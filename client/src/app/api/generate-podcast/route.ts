import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Exa from 'exa-js';
import { google } from 'googleapis';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import os from 'os';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const exa = new Exa(process.env.EXA_API_KEY);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

async function createVideoBuffer(audioBuffer: Buffer, imageBuffer: Buffer): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const audioPath = path.join(tempDir, `audio-${Date.now()}.mp3`);
  const imagePath = path.join(tempDir, `image-${Date.now()}.webp`);
  const videoPath = path.join(tempDir, `video-${Date.now()}.mp4`);
  
  try {
    fs.writeFileSync(audioPath, audioBuffer);
    fs.writeFileSync(imagePath, imageBuffer);
    
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(audioPath)
        .input(imagePath)
        .inputOptions(['-loop 1'])
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-tune stillimage', 
          '-shortest',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .on('end', () => {
          try {
            const videoBuffer = fs.readFileSync(videoPath);
            
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            
            resolve(videoBuffer);
          } catch (readError) {
            reject(readError);
          }
        })
        .on('error', (err) => {
          if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
          reject(err);
        })
        .save(videoPath);
    });
  } catch (error) {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    throw error;
  }
}

async function uploadToYouTube(videoBuffer: Buffer, title: string, description: string): Promise<{ youtubeUrl: string; videoId: string }> {
  const video = {
    snippet: {
      title,
      description,
      tags: ['podcast', 'ai-generated', 'news'],
      categoryId: '22',
    },
    status: {
      privacyStatus: 'private',
    },
  };

  const media = {
    body: Readable.from(videoBuffer),
  };

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: video,
    media,
  });

  const videoId = response.data.id!;
  return {
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { keywords, userId = 'default_user' } = await request.json();
    
    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const researchResponse = await exa.searchAndContents(keywords, {
      type: 'neural',
      numResults: 5,
      highlights: true,
    });

    const researchSummary = researchResponse.results
      .map((result, idx) => 
        `${idx + 1}. ${result.title}\n${result.highlights?.join(' ') || (result as any).text?.substring(0, 200) || ''}`
      )
      .join('\n\n');

    const scriptResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional podcast scriptwriter who creates engaging conversations between two hosts: Alex (curious and asks great questions) and Sam (knowledgeable and explains well). Create a natural, conversational 3-5 minute podcast script based on the research provided. Keep it concise and under 4000 characters total. Include speaker labels (Alex: and Sam:) for each line of dialogue.`
        },
        {
          role: 'user',
          content: `Create a podcast script about: ${keywords}\n\nResearch findings:\n${researchSummary}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const script = scriptResponse.choices[0]?.message?.content || '';

    let audioUrl = null;
    let videoUrl = null;
    let youtubeUrl = null;
    let videoId = null;
    
    try {
      let ttsInput = script;
      
      if (script.length > 4000) {
        console.log(`⚠️ Script too long (${script.length} chars), truncating to 4000 chars for TTS`);
        ttsInput = script.substring(0, 3950) + '...';
      }
      
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: ttsInput,
        response_format: 'mp3',
      });

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      
      try {
        const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dog.webp`;
        const imageBuffer = await fetchImageBuffer(imageUrl);
        const videoBuffer = await createVideoBuffer(audioBuffer, imageBuffer);
        const videoBase64 = videoBuffer.toString('base64');
        videoUrl = `data:video/mp4;base64,${videoBase64}`;
        console.log('✅ Video created successfully from buffer');
        
        try {
          const youtubeResult = await uploadToYouTube(videoBuffer, keywords, researchSummary);
          youtubeUrl = youtubeResult.youtubeUrl;
          videoId = youtubeResult.videoId;
          console.log('✅ Video successfully uploaded to YouTube:', youtubeUrl);
        } catch (youtubeError) {
          console.log('⚠️ YouTube upload skipped (credentials not configured):', youtubeError instanceof Error ? youtubeError.message : String(youtubeError));
        }
      } catch (videoError) {
        console.error('❌ Error creating video:', videoError);
      }
      
      const audioBase64 = audioBuffer.toString('base64');
      audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    } catch (ttsError) {
      console.error('TTS or video creation error:', ttsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        userId,
        script,
        audioUrl,
        videoUrl,
        youtubeUrl,
        videoId,
        researchSummary,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Podcast generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate podcast' },
      { status: 500 }
    );
  }
} 
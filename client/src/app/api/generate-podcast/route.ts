import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Exa from 'exa-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const exa = new Exa(process.env.EXA_API_KEY);

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
          content: `You are a professional podcast scriptwriter who creates engaging conversations between two hosts: Alex (curious and asks great questions) and Sam (knowledgeable and explains well). Create a natural, conversational 5-7 minute podcast script based on the research provided. Include speaker labels (Alex: and Sam:) for each line of dialogue.`
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
    try {
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: script,
        response_format: 'mp3',
      });

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      const audioBase64 = audioBuffer.toString('base64');
      audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    } catch (ttsError) {
      console.error('TTS error:', ttsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        userId,
        script,
        audioUrl,
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
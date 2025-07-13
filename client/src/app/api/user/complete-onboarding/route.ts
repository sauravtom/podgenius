import { NextRequest, NextResponse } from 'next/server';
import { updateUserData } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const data = await request.json();

    await updateUserData(userId, {
      onboardingCompleted: true,
      interests: data.interests || [],
      gmailConnected: data.gmailConnected || false,
      calendarConnected: data.calendarConnected || false,
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getUserData } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const userData = await getUserData(userId);

    if (!userData) {
      return NextResponse.json({
        completed: false,
        step: 0,
        data: null
      });
    }

    return NextResponse.json({
      completed: userData.onboardingCompleted,
      step: userData.onboardingStep,
      data: {
        interests: userData.interests,
        gmailConnected: userData.gmailConnected,
        calendarConnected: userData.calendarConnected,
      }
    });

  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
} 
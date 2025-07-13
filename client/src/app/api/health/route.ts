import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnvVars = {
    EXA_API_KEY: !!process.env.EXA_API_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
  };

  const allConfigured = Object.values(requiredEnvVars).every(Boolean);

  return NextResponse.json({
    status: allConfigured ? 'healthy' : 'degraded',
    services: {
      exa: requiredEnvVars.EXA_API_KEY ? 'ready' : 'missing_api_key',
      openai: requiredEnvVars.OPENAI_API_KEY ? 'ready' : 'missing_api_key',
    },
    timestamp: new Date().toISOString(),
  });
} 
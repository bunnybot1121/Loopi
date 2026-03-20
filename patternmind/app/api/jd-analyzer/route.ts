import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { recallUserProfile } from '@/lib/hindsight';
import { analyzeJobDescription } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { jd } = await req.json();
    if (!jd || typeof jd !== 'string') {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const profile = await recallUserProfile(userId);
    const analysis = await analyzeJobDescription(jd, profile);

    return NextResponse.json({ ...analysis, profile });
  } catch (err: any) {
    console.error('[jd-analyzer] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

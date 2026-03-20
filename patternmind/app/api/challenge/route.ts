import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { recallUserProfile } from '@/lib/hindsight';
import { generateProblem } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_number, target_difficulty, target_topic } = await req.json();

    // Read full user profile from Hindsight
    const profile = await recallUserProfile(userId);

    // Generate personalised problem
    const problem = await generateProblem(profile, session_number || 1, target_difficulty, target_topic);

    return NextResponse.json({ problem, profile });
  } catch (err: any) {
    console.error('[challenge] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

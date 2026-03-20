import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { recallUserProfile, getRawMemories } from '@/lib/hindsight';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [profile, rawMemories] = await Promise.all([
      recallUserProfile(userId),
      getRawMemories(userId),
    ]);

    return NextResponse.json({ profile, memories: rawMemories });
  } catch (err: any) {
    console.error('[memory] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

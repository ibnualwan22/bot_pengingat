import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'AI_BOT_ACTIVE' }
    });
    return NextResponse.json({ active: setting?.value === 'true' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { active } = await request.json();
    
    const setting = await prisma.setting.upsert({
      where: { key: 'AI_BOT_ACTIVE' },
      update: { value: active ? 'true' : 'false' },
      create: { key: 'AI_BOT_ACTIVE', value: active ? 'true' : 'false' }
    });
    
    return NextResponse.json({ active: setting.value === 'true' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

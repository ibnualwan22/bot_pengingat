import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshScheduler } from '@/lib/scheduler';

export async function GET() {
  try {
    const schedules = await prisma.scheduledMessage.findMany({
      include: { group: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const schedule = await prisma.scheduledMessage.create({
      data: {
        groupId: data.groupId,
        message: data.message,
        cronExpression: data.cronExpression,
        repeatType: data.repeatType,
        isActive: data.isActive ?? true,
      }
    });
    
    // Refresh memory scheduler to apply the new cron job immediately
    refreshScheduler();
    
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const logs = await prisma.messageLog.findMany({
      include: {
        group: true,
        scheduledMessage: true
      },
      orderBy: { sentAt: 'desc' },
      take: limit
    });
    
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

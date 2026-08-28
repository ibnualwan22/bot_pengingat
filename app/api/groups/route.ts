import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ groups });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

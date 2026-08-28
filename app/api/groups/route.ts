import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const defaultJid = process.env.WA_DEFAULT_GROUP;
    const groups = await prisma.group.findMany({
      where: defaultJid ? { jid: defaultJid } : undefined,
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ groups });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

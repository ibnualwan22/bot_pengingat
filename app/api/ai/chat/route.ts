import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/agnes';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const history = await prisma.aiConversation.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    // Save user message
    await prisma.aiConversation.create({
      data: { role: 'user', content }
    });

    // Get previous contexts if we want, for simplicity we send just the last 10 messages
    const recentHistory = await prisma.aiConversation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Sort in ascending order for the AI API
    const messages = recentHistory.reverse().map(c => ({
      role: c.role,
      content: c.content
    }));
    
    // Add system context at the front
    messages.unshift({
      role: "system",
      content: "Anda adalah asisten AI (Agnes) yang membantu admin membuat pesan-pesan WA otomatis yang ramah, sopan, dan informatif. Anda ahli dalam copywriting bahasa Indonesia. Tolong berikan jawaban langsung tanpa formatting tambahan yang berlebihan, kecuali emoji jika sesuai."
    });

    const aiResponse = await generateChatResponse(messages);

    // Save assistant response
    const savedResponse = await prisma.aiConversation.create({
      data: { role: 'assistant', content: aiResponse }
    });

    return NextResponse.json({ reply: savedResponse });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

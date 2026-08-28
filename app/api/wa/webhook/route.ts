import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChatResponse } from '@/lib/agnes';
import { sendWaMessage } from '@/lib/wa';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("=> WEBHOOK RECEIVED PAYLOAD:", JSON.stringify(payload, null, 2));
    
    // Check if event is message:received
    if (payload.event !== 'message:received' || !payload.data) {
      return NextResponse.json({ success: true }); // Acknowledge other events
    }
    
    const from = payload.data.from;
    const message = payload.data.content || payload.data.message || '';
    
    // Prevent Cross-Session Infinite Loops (if user registered identical webhooks on multiple WA accounts)
    if (payload.data.session_id !== process.env.WA_SESSION_ID) {
      return NextResponse.json({ message: "Ignored, webhook originated from a secondary session" });
    }
    
    // Check if AI Agent is enabled in settings
    const activeSetting = await prisma.setting.findUnique({
      where: { key: 'AI_BOT_ACTIVE' }
    });

    
    if (activeSetting?.value !== 'true') {
      return NextResponse.json({ message: "AI Agent is currently disabled" });
    }
    
    // Exclude empty messages or messages that might be our own (prevents infinite loop if echoed by WA API)
    if (!message || message.trim() === '') {
      return NextResponse.json({ message: "Empty message ignored" });
    }
    
    // Optional: Log memory - In a production bot you might want memory. 
    // Here we'll just send the user's message as a single prompt context.
    const prompt = `Ini ada pesan masuk dari anggota grup WhatsApp: "${message}". Jawablah dengan wajar, ramah, dan profesional sebagai Agnes.`;
    
    const reply = await generateChatResponse([{ role: 'user', content: prompt }]);
    
    const defaultGroup = process.env.WA_DEFAULT_GROUP;
    if (reply && defaultGroup) {
      await sendWaMessage(defaultGroup, reply);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

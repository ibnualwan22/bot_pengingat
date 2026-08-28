import { NextResponse } from 'next/server';
import { registerWebhook } from '@/lib/wa';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const response = await registerWebhook(url);
    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: 'API Error: ' + err }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Registration Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

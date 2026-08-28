'use client';

import { useState, useEffect, useRef } from 'react';

export default function AIChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [aiActive, setAiActive] = useState(false);
  const [loadingSetting, setLoadingSetting] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  useEffect(() => {
    fetchHistory();
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setAiActive(!!data.active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSetting(false);
    }
  };

  const toggleAiSetting = async () => {
    const newState = !aiActive;
    setAiActive(newState);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newState })
      });
    } catch (e) {
      console.error(e);
      setAiActive(!newState);
    }
  };

  const registerWebhook = async () => {
    setWebhookStatus('loading');
    try {
      const webhookUrl = window.location.origin + '/api/wa/webhook';
      const res = await fetch('/api/wa/webhook/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      if (res.ok) {
        setWebhookStatus('success');
      } else {
        setWebhookStatus('error');
      }
    } catch (e) {
      setWebhookStatus('error');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ai/chat');
      const data = await res.json();
      setMessages(data.history || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);
    
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, data.reply]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: '❌ Terjadi kesalahan saat menghubungi API Agnes AI.' }]);
    }
    setLoading(false);
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Pesan berhasil disalin! Silakan paste di menu pembuatan schedule.');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <header className="mb-6 flex-shrink-0 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            Agnes AI Assistant
            <span className="bg-[#25D366] text-xs px-2 py-1 rounded-md text-black font-extrabold tracking-wider">BETA</span>
          </h1>
          <p className="text-gray-400">Chat with AI to draft engaging and professional WhatsApp messages</p>
        </div>
        
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-6 border border-[rgba(255,255,255,0.05)] w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-sm font-bold">Auto-Responder Grup</span>
            <span className="text-xs text-gray-400">Balas chat otomatis di grup</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={registerWebhook}
              disabled={webhookStatus === 'loading'}
              className="text-xs bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] px-3 py-2 rounded-lg transition-colors border border-[rgba(255,255,255,0.1)]"
              title="Hubungkan Webhook agar AI langsung menerima pesan Grup"
            >
              {webhookStatus === 'success' ? 'Terhubung ✅' : webhookStatus === 'error' ? 'Gagal ❌' : webhookStatus === 'loading' ? '⏳' : '🔗 Integrasi Webhook'}
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={aiActive}
                onChange={toggleAiSetting}
                disabled={loadingSetting}
              />
              <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
            </label>
          </div>
        </div>
      </header>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <div className="text-6xl mb-4">✨🤖</div>
              <p>Mulai percakapan dengan Agnes.</p>
              <p className="text-sm">Contoh: "Buatkan pesan pengingat tagihan semester gasal yang sopan"</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 relative ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-[#128C7E] to-[#075E54] text-white rounded-tr-sm shadow-[0_4px_12px_rgba(37,211,102,0.2)]'
                  : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="text-[#25D366] font-bold text-xs mb-2 flex items-center justify-between">
                    <span>AGNES AI</span>
                    <button 
                      onClick={() => handleCopy(msg.content)} 
                      className="text-gray-400 hover:text-white bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded transition-colors"
                    >
                      📋 Copy
                    </button>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="w-full flex justify-start">
              <div className="max-w-[80%] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl rounded-tl-sm p-4 flex gap-2">
                <div className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="p-4 bg-[rgba(0,0,0,0.2)] border-t border-[rgba(255,255,255,0.1)] flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ketik permintaan ke AI di sini..."
            className="flex-1 glass-input rounded-full px-6 py-3"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-full glass-button flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

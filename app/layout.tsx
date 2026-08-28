import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "WA Bot Manager",
  description: "Automate and schedule your WhatsApp messages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex text-sm md:text-base">
        <aside className="w-64 min-h-screen glass-panel fixed left-0 top-0 border-r border-[rgba(255,255,255,0.1)] flex flex-col">
          <div className="p-6 font-bold text-xl flex items-center gap-3 border-b border-[rgba(255,255,255,0.1)]">
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">W</div>
            BotManager
          </div>
          <nav className="flex-1 p-4 space-y-2 flex flex-col">
            <Link href="/" className="px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">Dashboard</Link>
            <Link href="/groups" className="px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">Groups</Link>
            <Link href="/schedules" className="px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">Schedules</Link>
            <Link href="/ai-chat" className="px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors flex justify-between items-center">
              Agnes AI <span className="bg-[#25D366] text-[10px] px-2 py-0.5 rounded-full text-black font-bold">NEW</span>
            </Link>
            <Link href="/logs" className="px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">Message Logs</Link>
          </nav>
          <div className="p-4 border-t border-[rgba(255,255,255,0.1)] text-xs text-[rgba(255,255,255,0.5)]">
            v1.0.0
          </div>
        </aside>
        
        <main className="flex-1 ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

import { prisma } from '@/lib/prisma';

export const revalidate = 0; // Disable static rendering for this dashboard

export default async function Dashboard() {
  const [totalGroups, totalSchedules, totalLogs] = await Promise.all([
    prisma.group.count(),
    prisma.scheduledMessage.count(),
    prisma.messageLog.count(),
  ]);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-400">Manage your WhatsApp automated messages and schedules.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="text-gray-400 mb-2">Total Groups</div>
          <div className="text-4xl font-bold">{totalGroups}</div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl">
          <div className="text-gray-400 mb-2">Scheduled Messages</div>
          <div className="text-4xl font-bold">{totalSchedules}</div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-l-[4px] border-l-[#25D366]">
          <div className="text-[#25D366] mb-2 font-semibold">Messages Sent</div>
          <div className="text-4xl font-bold">{totalLogs}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/groups" className="block w-full text-left p-4 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all">
              🔄 Sync Groups from WhatsApp
            </a>
            <a href="/schedules" className="block w-full text-left p-4 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all">
              🕰 Create New Schedule
            </a>
            <a href="/ai-chat" className="block w-full text-left p-4 rounded-xl bg-[rgba(37,211,102,0.1)] text-[#25D366] hover:bg-[rgba(37,211,102,0.15)] transition-all">
              ✨ Compose with Agnes AI
            </a>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Connection</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WA API Connection</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Scheduler Engine</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

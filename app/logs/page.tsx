'use client';

import { useState, useEffect } from 'react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs?limit=100');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Message Logs</h1>
          <p className="text-gray-400">History of automated messages sent</p>
        </div>
        <button onClick={fetchLogs} className="glass-button-secondary px-4 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading logs...</div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.05)] text-gray-400 border-b border-[rgba(255,255,255,0.1)]">
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Group Target</th>
                  <th className="p-4 font-medium w-1/3">Message Content</th>
                  <th className="p-4 font-medium">Time (WIB)</th>
                  <th className="p-4 font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">Sent</span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/20">Failed</span>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      {log.group?.name || 'Unknown Group'}
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      <div className="line-clamp-2" title={log.message}>{log.message}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-xs text-red-400 max-w-[200px] truncate" title={log.errorMessage}>
                      {log.errorMessage || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No message logs found. Run a schedule to see logs here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

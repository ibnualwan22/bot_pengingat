'use client';

import { useState, useEffect } from 'react';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/groups/sync', { method: 'POST' });
      await res.json();
      await fetchGroups();
    } catch (e) {
      console.error(e);
      alert("Failed to sync groups");
    }
    setSyncing(false);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">WhatsApp Groups</h1>
          <p className="text-gray-400">Manage your connected groups</p>
        </div>
        <button 
          onClick={handleSync} 
          disabled={syncing}
          className="glass-button px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          {syncing ? '🔄 Syncing...' : '🔄 Sync from WhatsApp'}
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 truncate" title={group.name}>{group.name}</h3>
                <div className="text-xs text-gray-500 mb-4 truncate">{group.jid}</div>
              </div>
              
              <div className="flex justify-between items-end border-t border-[rgba(255,255,255,0.1)] pt-4 mt-4">
                <div>
                  <div className="text-xs text-gray-400">Participants</div>
                  <div className="font-bold text-xl">{group.participantCount || 0}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${group.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="col-span-full glass-panel p-12 text-center rounded-2xl">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">No Groups Found</h3>
              <p className="text-gray-400 mb-6">Click sync to load groups from your connected WhatsApp account.</p>
              <button 
                onClick={handleSync} 
                className="glass-button px-6 py-3 rounded-xl font-medium"
              >
                Sync Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formUI, setFormUI] = useState({
    groupId: '',
    message: '',
    repeatType: 'DAILY',
    time: '08:00',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    dayOfWeek: '1',
    customCron: '0 8 * * *'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, groupsRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/groups')
      ]);
      const schedData = await schedRes.json();
      const groupsData = await groupsRes.json();
      
      setSchedules(schedData.schedules || []);
      const fetchedGroups = groupsData.groups || [];
      setGroups(fetchedGroups);
      
      if (fetchedGroups.length > 0) {
        setFormUI(prev => ({ ...prev, groupId: fetchedGroups[0].id.toString() }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Area you sure you want to delete this schedule?')) return;
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const computeCron = () => {
    if (formUI.repeatType === 'CUSTOM') return formUI.customCron;
    
    const [hh, mm] = formUI.time.split(':');
    const minute = mm ? parseInt(mm).toString() : '0';
    const hour = hh ? parseInt(hh).toString() : '8';
    
    if (formUI.repeatType === 'DAILY') {
      return `${minute} ${hour} * * *`;
    }
    if (formUI.repeatType === 'WEEKLY') {
      return `${minute} ${hour} * * ${formUI.dayOfWeek}`;
    }
    if (formUI.repeatType === 'MONTHLY' || formUI.repeatType === 'ONCE') {
      const dateObj = formUI.date ? new Date(formUI.date) : new Date();
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1; // 1-12
      
      if (formUI.repeatType === 'MONTHLY') {
        return `${minute} ${hour} ${day} * *`;
      } else {
        // ONCE
        return `${minute} ${hour} ${day} ${month} *`;
      }
    }
    return `${minute} ${hour} * * *`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetGroupId = formUI.groupId;
    if (!targetGroupId && groups.length > 0) {
      targetGroupId = groups[0].id.toString();
    }
    
    if (!targetGroupId) {
      alert("Harap sinkronisasi grup terlebih dahulu di menu Groups sebelum membuat jadwal!");
      return;
    }
    
    try {
      const computedCron = computeCron();
      
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: parseInt(targetGroupId),
          message: formUI.message,
          repeatType: formUI.repeatType,
          cronExpression: computedCron
        })
      });
      setShowModal(false);
      setFormUI({ ...formUI, message: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to create schedule");
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scheduled Messages</h1>
          <p className="text-gray-400">Automate your group messages</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="glass-button px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          ➕ New Schedule
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading schedules...</div>
      ) : (
        <div className="space-y-4">
          {schedules.map(schedule => (
            <div key={schedule.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-[#25D366] shadow-[0_0_8px_#25D366]' : 'bg-red-500'}`}></span>
                  <h3 className="font-bold text-lg">{schedule.group.name}</h3>
                  <span className="bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full text-xs text-gray-300">
                    {schedule.cronExpression}
                  </span>
                  <span className="bg-[#25D366]/20 text-[#25D366] px-3 py-1 rounded-full text-xs">
                    {schedule.repeatType}
                  </span>
                </div>
                <p className="text-gray-300 bg-[rgba(0,0,0,0.2)] p-4 rounded-xl font-mono text-sm line-clamp-2">
                  {schedule.message}
                </p>
                <div className="text-xs text-gray-500 flex gap-4">
                  <span>Last run: {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : 'Never'}</span>
                  <span>Created: {new Date(schedule.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-3 md:flex-col justify-end border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.1)] pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => handleToggle(schedule.id, schedule.isActive)}
                  className={`w-full glass-button-secondary px-4 py-2 rounded-lg text-sm ${schedule.isActive ? 'text-orange-300' : 'text-green-300'}`}
                >
                  {schedule.isActive ? 'Pause' : 'Resume'}
                </button>
                <button 
                  onClick={() => handleDelete(schedule.id)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {schedules.length === 0 && (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <div className="text-4xl mb-4">🕰</div>
              <h3 className="text-xl font-bold mb-2">No Schedules Yet</h3>
              <p className="text-gray-400 mb-6">Create your first automated message schedule right now.</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="glass-button px-6 py-3 rounded-xl font-medium"
              >
                Create Schedule
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-6">Buat Jadwal Pengiriman</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Pilih Grup disembunyikan karena selalu spesifik ke grup default pribadi */}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Isi Pesan</label>
                <textarea 
                  required
                  rows={4}
                  value={formUI.message}
                  onChange={e => setFormUI({...formUI, message: e.target.value})}
                  className="w-full glass-input p-3 rounded-xl resize-none"
                  placeholder="Ketik isi pesan untuk dikirim langsung nanti..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pola Rutinitas</label>
                <select 
                  value={formUI.repeatType}
                  onChange={e => setFormUI({...formUI, repeatType: e.target.value})}
                  className="w-full glass-input p-3 rounded-xl appearance-none"
                >
                  <option value="ONCE">Sekali Jalan (Once)</option>
                  <option value="DAILY">Setiap Hari (Daily)</option>
                  <option value="WEEKLY">Setiap Minggu (Weekly)</option>
                  <option value="MONTHLY">Setiap Bulan (Monthly)</option>
                  <option value="CUSTOM">Custom Cron</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                {formUI.repeatType === 'CUSTOM' ? (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Cron Expression</label>
                    <input 
                      required
                      type="text"
                      value={formUI.customCron}
                      onChange={e => setFormUI({...formUI, customCron: e.target.value})}
                      className="w-full glass-input p-3 rounded-xl font-mono text-sm"
                      placeholder="0 8 * * *"
                    />
                    <a href="https://crontab.guru" target="_blank" className="text-xs text-[#25D366] mt-1 inline-block hover:underline">Cron guide</a>
                  </div>
                ) : (
                  <>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Waktu (Jam)</label>
                      <input 
                        required
                        type="time"
                        value={formUI.time}
                        onChange={e => setFormUI({...formUI, time: e.target.value})}
                        className="w-full glass-input p-3 rounded-xl text-sm"
                      />
                    </div>
                    
                    {(formUI.repeatType === 'ONCE' || formUI.repeatType === 'MONTHLY') && (
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          {formUI.repeatType === 'ONCE' ? 'Tanggal' : 'Tanggal Bulanan'}
                        </label>
                        <input 
                          required
                          type="date"
                          value={formUI.date}
                          onChange={e => setFormUI({...formUI, date: e.target.value})}
                          className="w-full glass-input p-3 rounded-xl text-sm"
                        />
                      </div>
                    )}
                    
                    {formUI.repeatType === 'WEEKLY' && (
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Hari</label>
                        <select 
                          value={formUI.dayOfWeek}
                          onChange={e => setFormUI({...formUI, dayOfWeek: e.target.value})}
                          className="w-full glass-input p-3 rounded-xl appearance-none text-sm"
                        >
                          <option value="1">Senin</option>
                          <option value="2">Selasa</option>
                          <option value="3">Rabu</option>
                          <option value="4">Kamis</option>
                          <option value="5">Jumat</option>
                          <option value="6">Sabtu</option>
                          <option value="0">Minggu</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-[rgba(255,255,255,0.1)]">
                <button type="button" onClick={() => setShowModal(false)} className="glass-button-secondary px-6 py-3 rounded-xl text-sm">Batal</button>
                <button type="submit" className="glass-button px-6 py-3 rounded-xl font-medium text-sm">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

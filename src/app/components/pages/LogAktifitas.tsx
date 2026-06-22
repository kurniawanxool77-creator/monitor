import React, { useState } from 'react';
import { useAppData } from '../../hooks/AppDataContext';
import { Clock, User, Activity, AlertCircle, Filter } from 'lucide-react';

export function LogAktifitas() {
  const { activityLogs } = useAppData();

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredLogs = activityLogs.filter(log => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!log.user.toLowerCase().includes(term) && 
          !log.action.toLowerCase().includes(term) && 
          !(log.details && log.details.toLowerCase().includes(term))) {
        return false;
      }
    }
    
    if (startDate || endDate) {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (logDate > end) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
            <input
              type="text"
              placeholder="Cari user, aksi, atau detail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Awal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <div className="text-lg font-medium text-gray-900 mb-1">Belum ada aktifitas</div>
            <div className="text-sm">Log aktifitas yang sesuai dengan filter tidak ditemukan.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{log.user}</div>
                        <div className="text-sm font-medium text-blue-600 mt-0.5">{log.action}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{log.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

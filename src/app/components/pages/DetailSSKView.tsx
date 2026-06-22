import React, { useState } from 'react';
import { detailSSKMock, DetailSSK } from '../../lib/data';
import { List, Edit3, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

function formatRp(n: number, short = false) {
  if (short) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${n.toLocaleString('id-ID')}`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function DetailSSKView() {
  const [data, setData] = useState<DetailSSK>(detailSSKMock);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ target: '', realisasi: '' });

  const totalTarget = data.bulanan.reduce((sum, b) => sum + b.target, 0);
  const totalRealisasi = data.bulanan.reduce((sum, b) => sum + b.realisasi, 0);
  const capaian = totalRealisasi; // Capaian % is the total of realisasi % since target is 100%
  const totalCapaian = data.bulanan.reduce((sum, b) => sum + (b.target > 0 ? (b.realisasi / b.target) * 100 : 0), 0);

  const startEdit = (idx: number, b: any) => {
    setEditingRow(idx);
    setEditForm({ target: String(b.target), realisasi: String(b.realisasi) });
  };

  const saveEdit = (idx: number) => {
    const next = [...data.bulanan];
    next[idx] = { target: Number(editForm.target), realisasi: Number(editForm.realisasi) };
    setData({ ...data, bulanan: next });
    setEditingRow(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters (Mock Selectors) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">OPD</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 font-medium">
                <option>{data.opd}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Program</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 font-medium">
                <option>{data.program}</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Bidang</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 font-medium">
                <option>{data.bidang}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">SubKegiatan</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 font-medium">
                <option>{data.subKegiatan}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Sub SubKegiatan</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 font-medium">
                <option>{data.subKegiatan}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Detail SSK Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
          <List className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-teal-800">Sub Sub SubKegiatan Belanja</h3>
        </div>
        
        <div className="p-0">
          {/* Info Header */}
          <div className="p-6 bg-teal-50/30 flex flex-wrap gap-y-4 justify-between relative">
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-[150px_1fr] gap-4 text-sm">
                <div className="text-slate-500 font-medium">Sub SubKegiatan</div>
                <div className="font-bold text-slate-800">: {data.subKegiatan}</div>
              </div>
              <div className="grid grid-cols-[150px_1fr] gap-4 text-sm">
                <div className="text-slate-500 font-medium">Pagu APBD (Rp)</div>
                <div className="font-bold text-slate-800">: {formatRp(data.paguApbd, true)}</div>
              </div>
              <div className="grid grid-cols-[150px_1fr] gap-4 text-sm">
                <div className="text-slate-500 font-medium">Pagu Verifikasi (Rp)</div>
                <div className="font-bold text-slate-800">: {formatRp(data.paguVerifikasi, true)}</div>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-end sm:items-start pl-0 sm:pl-8">
              <div className="grid grid-cols-[150px_1fr] gap-4 text-sm">
                <div className="text-slate-500 font-medium">Total RAB (Rp)</div>
                <div className="font-bold text-slate-800">: {formatRp(data.totalRab, true)}</div>
              </div>
            </div>
            
            {/* Big Percentage Box */}
            <div className="absolute right-6 top-6 bg-teal-500 text-white rounded-xl shadow-lg w-28 h-28 flex items-center justify-center font-black text-2xl">
              {capaian.toFixed(2)}%
            </div>
          </div>

          {/* SSK Main Table */}
          <div className="overflow-x-auto border-y border-slate-200">
            <table className="w-full text-xs text-center">
              <thead className="bg-slate-200 text-slate-600">
                <tr>
                  <th className="p-3 text-left w-[300px]">Uraian SSK</th>
                  <th className="p-3">Pagu (Rp)</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Sumber Anggaran</th>
                  <th className="p-3">Jenis IKU Daerah</th>
                  <th className="p-3">Bobot</th>
                  <th className="p-3 border-x border-slate-300">
                    <div className="mb-2 border-b border-slate-300 pb-2">Status</div>
                    <div className="grid grid-cols-2">
                      <div>Sesuai</div>
                      <div>Selesai</div>
                    </div>
                  </th>
                  <th className="p-3">Realisasi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-pink-100/50 hover:bg-pink-100 transition-colors">
                  <td className="p-4 text-left">
                    <div className="font-bold text-slate-800 text-sm mb-1">{data.uraianSsk}</div>
                    <div className="text-pink-600">Indikator : {data.indikator}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{formatRp(data.paguApbd, true)}</td>
                  <td className="p-3 font-bold text-blue-500">{data.jenis}</td>
                  <td className="p-3 font-medium text-slate-700">{data.sumberAnggaran}</td>
                  <td className="p-3 font-medium text-slate-700">{data.jenisIku}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg font-bold">{data.bobot}%</span>
                  </td>
                  <td className="p-0 border-x border-slate-200">
                    <div className="grid grid-cols-2 h-full items-center">
                      <div className={`p-3 font-semibold ${data.statusSesuai ? 'text-emerald-600' : 'text-pink-500'}`}>{data.statusSesuai ? 'Sesuai' : 'Tidak Sesuai'}</div>
                      <div className={`p-3 font-semibold border-l border-slate-200 ${data.statusSelesai ? 'text-emerald-600' : 'text-pink-500'}`}>{data.statusSelesai ? 'Selesai' : 'Belum Selesai'}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Realisasi</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Monthly Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right whitespace-nowrap">
              <thead className="text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-left font-bold w-40">Realisasi</th>
                  <th className="p-3 font-semibold">Januari</th>
                  <th className="p-3 font-semibold">Februari</th>
                  <th className="p-3 font-semibold">Maret</th>
                  <th className="p-3 font-semibold">April</th>
                  <th className="p-3 font-semibold">Mei</th>
                  <th className="p-3 font-semibold">Juni</th>
                  <th className="p-3 font-semibold">Juli</th>
                  <th className="p-3 font-semibold">Agustus</th>
                  <th className="p-3 font-semibold">September</th>
                  <th className="p-3 font-semibold">Oktober</th>
                  <th className="p-3 font-semibold">November</th>
                  <th className="p-3 font-semibold">Desember</th>
                  <th className="p-3 font-bold text-slate-800 bg-slate-100">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-teal-50/50 hover:bg-teal-50 transition-colors">
                  <td className="p-3 text-left font-bold text-teal-800">Target (%)</td>
                  {data.bulanan.map((b, i) => <td key={i} className="p-3 text-slate-700">{b.target.toFixed(2)}</td>)}
                  <td className="p-3 font-black text-slate-800 bg-slate-100/50">{totalTarget.toFixed(0)}</td>
                </tr>
                <tr className="bg-teal-100/50 hover:bg-teal-100 transition-colors">
                  <td className="p-3 text-left font-bold text-teal-900">Realisasi (%)</td>
                  {data.bulanan.map((b, i) => (
                    <td key={i} className="p-3 font-medium text-slate-800 group relative">
                      {editingRow === i ? (
                        <input type="number" value={editForm.realisasi} onChange={e => setEditForm({...editForm, realisasi: e.target.value})} onBlur={() => saveEdit(i)} autoFocus className="w-16 px-1 py-0.5 border border-blue-400 rounded text-right" />
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {b.realisasi.toFixed(2)}
                          <button onClick={() => startEdit(i, b)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="p-3 font-black text-slate-800 bg-slate-100/50">{totalRealisasi.toFixed(2)}</td>
                </tr>
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-left font-bold text-slate-700">Tingkat Capaian (%)</td>
                  {data.bulanan.map((b, i) => {
                    const cap = b.target > 0 ? (b.realisasi / b.target) * 100 : 0;
                    return <td key={i} className={`p-3 font-medium ${cap >= 100 ? 'text-emerald-600' : cap > 0 ? 'text-amber-500' : 'text-slate-400'}`}>{cap.toFixed(4)}</td>
                  })}
                  <td className="p-3 font-black text-slate-800 bg-slate-100/50"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

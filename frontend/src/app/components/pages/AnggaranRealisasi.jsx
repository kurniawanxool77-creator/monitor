import React, { useState } from 'react';
import { DollarSign, TrendingUp, PieChart as PieChartIcon, X, Save, AlertCircle, Wallet, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PAGU_TOTAL, BULAN_NAMES } from '../../lib/data';
import { useAppData } from '../../hooks/AppDataContext';

function formatRp(n, short = false) {
  if (short) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)}Jt`;
    return `Rp ${n.toLocaleString('id-ID')}`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function AnggaranRealisasi() {
  const { dataUraian, getSubKegiatanList } = useAppData();
  const subKegiatans = getSubKegiatanList();

  const [showPaguModal, setShowPaguModal] = useState(false);
  const [showEditBidangModal, setShowEditBidangModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const [globalPagu, setGlobalPagu] = useState({
    [currentYear]: PAGU_TOTAL
  });

  const [targetBidangBulan, setTargetBidangBulan] = useState({});

  const [editingBidangBulan, setEditingBidangBulan] = useState(null);

  const [paguInput, setPaguInput] = useState('');
  const [tahunAnggaranInput, setTahunAnggaranInput] = useState(currentYear);
  const [bidangTargetInput, setBidangTargetInput] = useState('');

  const bidangList = dataUraian.filter(u => u.level === 1);

  const paguTotal = globalPagu[selectedYear] || 0;

  const realisasiPerBulan = Array(12).fill(0);

  const realisasiBidangBulan = {};
  for (let i = 0; i < 12; i++) realisasiBidangBulan[i] = {};

  const leafSubKegiatans = subKegiatans.filter(k =>
    !subKegiatans.some(child => child.id.startsWith(k.id + '.') && child.id.length > k.id.length)
  );

  leafSubKegiatans.forEach(k => {
    const realisasi = k.realisasi || 0;
    if (realisasi > 0) {
      const startDate = new Date(k.tanggalMulai);
      const endDate = new Date(k.tanggalSelesai);

      if (startDate.getFullYear() === selectedYear || endDate.getFullYear() === selectedYear) {
        const startMonth = startDate.getFullYear() < selectedYear ? 0 : startDate.getMonth();
        const endMonth = endDate.getFullYear() > selectedYear ? 11 : endDate.getMonth();
        const totalMonths = Math.max(1, endMonth - startMonth + 1);
        const perMonth = realisasi / totalMonths;

        for (let m = startMonth; m <= endMonth && m < 12; m++) {
          realisasiPerBulan[m] += perMonth;
          const bidangObj = bidangList.find(b => b.uraian === k.bidang);
          if (bidangObj) {
            realisasiBidangBulan[m][bidangObj.kode] = (realisasiBidangBulan[m][bidangObj.kode] || 0) + perMonth;
          }
        }
      }
    }
  });

  const totalRealisasi = realisasiPerBulan.reduce((sum, v) => sum + v, 0);
  const totalSisa = paguTotal - totalRealisasi;
  const pctSerapan = paguTotal > 0 ? ((totalRealisasi / paguTotal) * 100).toFixed(1) : '0';

  const currentYearTargetBidang = targetBidangBulan[selectedYear] || {};
  const currentYearTargets = Array(12).fill(0).map((_, i) => {
    const bidangTargets = currentYearTargetBidang[i] || {};
    return Object.values(bidangTargets).reduce((sum, val) => sum + val, 0);
  });

  const monthly = BULAN_NAMES.map((bulan, i) => {
    const target = currentYearTargets[i] || 0;
    const realisasi = realisasiPerBulan[i];
    const pct = target > 0 ? Math.round((realisasi / target) * 100) : 0;
    const onTrack = pct >= 80;

    return {
      idx: i,
      bulan,
      target,
      realisasi,
      persentase: pct,
      onTrack,
    };
  });

  const chartData = BULAN_NAMES.map((bln, i) => ({
    bulan: bln.substring(0, 3),
    Target: Math.round(currentYearTargets[i] / 1_000_000),
    Realisasi: Math.round(realisasiPerBulan[i] / 1_000_000),
  }));

  const pieData = [
    { name: 'Terserap', value: totalRealisasi, color: '#10b981' },
    { name: 'Sisa', value: Math.max(0, totalSisa), color: '#e5e7eb' },
  ];

  function handleSavePagu() {
    const val = Number(paguInput.replace(/\D/g, ''));
    if (val >= 0) {
      setGlobalPagu(prev => ({
        ...prev,
        [tahunAnggaranInput]: val
      }));
      setSelectedYear(tahunAnggaranInput);
      setPaguInput('');
      setShowPaguModal(false);
    }
  }

  function handleOpenEditBidangBulanModal(monthIdx, monthNama, kode, nama, currentTarget) {
    setEditingBidangBulan({ monthIdx, monthNama, kode, nama, currentTarget });
    setBidangTargetInput(currentTarget.toString());
    setShowEditBidangModal(true);
  }

  function handleSaveTargetBidang() {
    if (!editingBidangBulan) return;
    const val = Number(bidangTargetInput.replace(/\D/g, '')) || 0;

    setTargetBidangBulan(prev => {
      const yearData = prev[selectedYear] || {};
      const monthData = yearData[editingBidangBulan.monthIdx] || {};

      return {
        ...prev,
        [selectedYear]: {
          ...yearData,
          [editingBidangBulan.monthIdx]: {
            ...monthData,
            [editingBidangBulan.kode]: val
          }
        }
      };
    });

    setShowEditBidangModal(false);
    setEditingBidangBulan(null);
    setBidangTargetInput('');
  }

  const availableYears = Array.from(new Set([
    ...Array.from({ length: 15 }, (_, i) => currentYear - 3 + i),
    ...Object.keys(globalPagu).map(Number),
    ...Object.keys(targetBidangBulan).map(Number)
  ])).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "TOTAL PAGU", value: formatRp(paguTotal, true), color: "bg-blue-500", icon: DollarSign, detail: `Tahun Anggaran ${selectedYear}` },
          { title: "TOTAL REALISASI", value: formatRp(totalRealisasi, true), color: "bg-emerald-500", icon: TrendingUp, detail: "Terserap" },
          { title: "SISA ANGGARAN", value: formatRp(totalSisa, true), color: "bg-amber-500", icon: Wallet, detail: "Sisa Pagu" },
          { title: "PERSENTASE", value: `${pctSerapan}%`, color: "bg-purple-500", icon: PieChartIcon, detail: "Dari Total Pagu" }
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 active:scale-95 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-2 min-w-0">
                <div className="text-xs font-bold text-gray-500 mb-1 truncate">{c.title}</div>
                <div className="text-3xl font-bold text-gray-900 truncate">{c.value}</div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <c.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{c.detail}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700">Tahun Anggaran:</label>
          <select value={selectedYear} onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            setExpandedMonth(null);
          }}
            className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-slate-800">
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button onClick={() => { setPaguInput(String(paguTotal)); setTahunAnggaranInput(selectedYear); setShowPaguModal(true); }}
          className="flex items-center gap-2 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-semibold transition-colors">
          <DollarSign className="w-4 h-4" /> Set Pagu Anggaran
        </button>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Target vs Realisasi Per Bulan (juta Rp)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`Rp ${v}Jt`, '']} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="Target" fill="#93c5fd" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Realisasi" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Serapan Anggaran</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={62} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-xl font-black text-gray-900">{pctSerapan}%</div>
                <div className="text-[10px] text-gray-500">Terserap</div>
              </div>
            </div>
            <div className="mt-4 w-full space-y-2">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-600">{p.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{formatRp(p.value, true)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Per Bulan Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-800">Target & Realisasi Per Bulan</h3>
          <span className="text-xs text-gray-500">Klik baris bulan untuk melihat detail per bidang</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-slate-200">
              <tr>
                <th className="text-center py-3 px-4 font-semibold text-slate-500 w-12">No</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Bulan</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-600 w-48">Target</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-600 w-48">Realisasi</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600 w-36">Capaian</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => {
                const isExpanded = expandedMonth === m.idx;
                const hasData = m.target > 0 || m.realisasi > 0;

                return (
                  <React.Fragment key={m.bulan}>
                    <tr onClick={() => setExpandedMonth(isExpanded ? null : m.idx)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50/50' : 'border-b border-slate-100 hover:bg-slate-50'}`}>
                      <td className="py-3.5 px-4 text-slate-400 text-center font-medium">{m.idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          {m.bulan}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right tabular-nums text-slate-700 font-bold">
                        {m.target > 0 ? formatRp(m.target, true) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className={`py-3.5 px-6 text-right tabular-nums font-bold ${m.persentase >= 71 ? 'text-red-600' : m.persentase >= 41 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {m.realisasi > 0 ? formatRp(m.realisasi, true) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasData ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-full max-w-[80px] bg-slate-100 rounded-full h-1.5 mx-auto overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${m.persentase >= 71 ? 'bg-red-500' : m.persentase >= 41 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(m.persentase, 100)}%` }} />
                            </div>
                            <span className={`text-[11px] font-bold ${m.persentase >= 71 ? 'text-red-600' : m.persentase >= 41 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              {m.persentase}%
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-xs block text-center">-</span>}
                      </td>
                    </tr>

                    {isExpanded && bidangList.map((bidang, bIdx) => {
                      const t = currentYearTargetBidang[m.idx]?.[bidang.kode] || 0;
                      const r = realisasiBidangBulan[m.idx]?.[bidang.kode] || 0;
                      const pct = t > 0 ? Math.round((r / t) * 100) : 0;
                      const isLast = bIdx === bidangList.length - 1;

                      return (
                        <tr key={bidang.kode} className={`bg-slate-50/50 hover:bg-slate-100/50 transition-colors ${isLast ? 'border-b border-slate-200' : 'border-b border-slate-100/50'}`}>
                          <td className="py-3 px-4 text-center"></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 pl-6 text-slate-600 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              {bidang.uraian}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-right tabular-nums text-slate-700 font-medium">
                            {t > 0 ? formatRp(t) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className={`py-3 px-6 text-right tabular-nums font-medium ${pct > 100 ? 'text-red-600' : pct >= 80 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {r > 0 ? formatRp(r) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => handleOpenEditBidangBulanModal(m.idx, m.bulan, bidang.kode, bidang.uraian, t)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit Target">
                              <Edit2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              <tr className="bg-blue-100 font-bold border-t-2 border-blue-300">
                <td colSpan={2} className="py-3 px-4 text-blue-900">TOTAL {selectedYear}</td>
                <td className="py-3 px-4 text-right text-blue-800">{formatRp(currentYearTargets.reduce((a, b) => a + b, 0))}</td>
                <td className="py-3 px-4 text-right text-emerald-700">{formatRp(totalRealisasi)}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-base font-black text-blue-800">{pctSerapan}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Set Pagu */}
      {showPaguModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Set Pagu Anggaran Global</h2>
              <button onClick={() => setShowPaguModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Masukkan total pagu anggaran keseluruhan untuk tahun yang dipilih.
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Anggaran</label>
                <select value={tahunAnggaranInput}
                  onChange={(e) => setTahunAnggaranInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Pagu Anggaran</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
                  <input type="number" value={paguInput}
                    onChange={(e) => setPaguInput(e.target.value)}
                    placeholder="Contoh: 18500000000"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowPaguModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSavePagu}
                disabled={!paguInput || Number(paguInput) < 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Target Per Bidang Per Bulan */}
      {showEditBidangModal && editingBidangBulan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Set Target Bidang</h2>
              <button onClick={() => { setShowEditBidangModal(false); setEditingBidangBulan(null); }} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Mengatur target untuk {editingBidangBulan.nama} pada bulan {editingBidangBulan.monthNama}.
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target {editingBidangBulan.monthNama}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
                  <input type="text"
                    value={bidangTargetInput}
                    onChange={(e) => setBidangTargetInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Masukkan target"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setShowEditBidangModal(false); setEditingBidangBulan(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveTargetBidang}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

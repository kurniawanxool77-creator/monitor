import React, { useState } from 'react';
import { DollarSign, TrendingUp, PieChart as PieChartIcon, X, Save, AlertCircle, Wallet, Edit2, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PAGU_TOTAL, BULAN_NAMES } from "../../../lib/data";
import { useAppData } from "../../../hooks/AppDataContext";

function formatRp(n, short = false) {
  if (short) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)}Jt`;
    return `Rp ${n.toLocaleString('id-ID')}`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function AnggaranRealisasi() {
  const { dataUraian, getSubKegiatanList, sumberDanaList, paguSumberDana, setPaguSumberDana, addSumberDana } = useAppData();
  const subKegiatans = getSubKegiatanList();

  const [showPaguModal, setShowPaguModal] = useState(false);
  const [showEditBidangModal, setShowEditBidangModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [filterSumberDana, setFilterSumberDana] = useState('semua');

  const [paguInputPerSD, setPaguInputPerSD] = useState({});
  const [tahunAnggaranInput, setTahunAnggaranInput] = useState(currentYear);
  const [newSdMode, setNewSdMode] = useState(false);
  const [newSdValue, setNewSdValue] = useState('');

  const [globalPagu, setGlobalPagu] = useState({});
  const [targetBidangBulan, setTargetBidangBulan] = useState({});

  const [editingBidangBulan, setEditingBidangBulan] = useState(null);
  const [bidangTargetInput, setBidangTargetInput] = useState('');

  const bidangList = dataUraian.filter(u => u.level === 1);

  // Hitung paguTotal: dari paguSumberDana jika sudah diset, fallback ke globalPagu
  const sdPaguThisYear = paguSumberDana[selectedYear] || {};
  const sdPaguTotal = Object.values(sdPaguThisYear).reduce((s, v) => s + v, 0);
  const paguTotal = sdPaguTotal > 0 ? sdPaguTotal : (globalPagu[selectedYear] || 0);

  // Filter subKegiatans by sumberDana
  const activeSD = sumberDanaList.find(sd => String(sd.id) === filterSumberDana);
  const leafSubKegiatans = subKegiatans.filter(k => {
    if (k.isWadah) return false;
    if (filterSumberDana === 'semua') return true;
    return k.sumberDana === (activeSD?.nama || '');
  });

  // Hitung total realisasi dari dataUraian (leaf nodes), difilter by sumberDana
  const totalRealisasi = (() => {
    if (filterSumberDana === 'semua') {
      const leafUraian = dataUraian.filter(u => {
        const hasChildren = dataUraian.some(child => child.kode.startsWith(u.kode + '.') && child.kode !== u.kode);
        return !hasChildren && u.level > 1;
      });
      return leafUraian.reduce((sum, u) => sum + (u.realisasi || 0), 0);
    }
    return leafSubKegiatans.reduce((sum, k) => sum + (k.realized || 0), 0);
  })();

  // Pagu filter: jika SD dipilih, ambil dari paguSumberDana[year][sdId]
  const paguFiltered = (() => {
    if (filterSumberDana === 'semua') return paguTotal;
    return sdPaguThisYear[filterSumberDana] || 0;
  })();

  const totalSisa = paguFiltered - totalRealisasi;
  const pctSerapan = paguFiltered > 0 ? ((totalRealisasi / paguFiltered) * 100).toFixed(1) : '0';

  const realisasiPerBulan = Array(12).fill(0);
  const realisasiBidangBulan = Array(12).fill(null).map(() => ({}));

  const autoTargetBidangBulan = Array(12).fill(null).map(() => ({}));
  
  leafSubKegiatans.forEach(k => {
    const realisasi = k.realized || 0;
    const pagu = k.paguAnggaran || k.target || 0;

    if (realisasi > 0 || pagu > 0) {
      const startDate = new Date(k.tanggalMulai);
      const endDate = new Date(k.tanggalSelesai);
      if (startDate.getFullYear() === selectedYear || endDate.getFullYear() === selectedYear) {
        const startMonth = startDate.getFullYear() < selectedYear ? 0 : startDate.getMonth();
        const endMonth = endDate.getFullYear() > selectedYear ? 11 : endDate.getMonth();
        const totalMonths = Math.max(1, endMonth - startMonth + 1);
        const perMonthRealisasi = realisasi / totalMonths;
        const perMonthPagu = pagu / totalMonths;
        
        for (let m = startMonth; m <= endMonth && m < 12; m++) {
          if (realisasi > 0) realisasiPerBulan[m] += perMonthRealisasi;
          
          const bidangObj = bidangList.find(b => b.uraian === k.bidang);
          if (bidangObj) {
            if (realisasi > 0) {
              realisasiBidangBulan[m][bidangObj.kode] = (realisasiBidangBulan[m][bidangObj.kode] || 0) + perMonthRealisasi;
            }
            if (pagu > 0) {
              autoTargetBidangBulan[m][bidangObj.kode] = (autoTargetBidangBulan[m][bidangObj.kode] || 0) + perMonthPagu;
            }
          }
        }
      }
    }
  });

  const currentYearTargetBidang = targetBidangBulan[selectedYear] || {};
  const currentYearTargets = Array(12).fill(0).map((_, i) => {
    const manualTargets = currentYearTargetBidang[i] || {};
    const autoTargets = autoTargetBidangBulan[i];
    let sum = 0;
    bidangList.forEach(b => {
      if (manualTargets[b.kode] !== undefined) sum += manualTargets[b.kode];
      else sum += (autoTargets[b.kode] || 0);
    });
    return sum;
  });

  const monthly = BULAN_NAMES.map((bulan, i) => {
    const target = currentYearTargets[i] || 0;
    const realisasi = realisasiPerBulan[i];
    const pct = target > 0 ? Math.round((realisasi / target) * 100) : 0;
    return { idx: i, bulan, target, realisasi, persentase: pct, onTrack: pct >= 80 };
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

  const chartPieData = (totalRealisasi === 0 && Math.max(0, totalSisa) === 0)
    ? [{ name: 'Belum ada pagu', value: 1, color: '#f3f4f6' }]
    : pieData;

  function handleOpenPaguModal() {
    const existing = paguSumberDana[selectedYear] || {};
    const inputs = {};
    sumberDanaList.filter(sd => sd.aktif).forEach(sd => {
      inputs[sd.id] = existing[sd.id] ? String(existing[sd.id]) : '';
    });
    setPaguInputPerSD(inputs);
    setTahunAnggaranInput(selectedYear);
    setShowPaguModal(true);
  }

  function handleSavePagu() {
    const newPagu = {};
    let hasAny = false;
    sumberDanaList.filter(sd => sd.aktif).forEach(sd => {
      const val = Number((paguInputPerSD[sd.id] || '').replace(/\D/g, ''));
      if (val > 0) { newPagu[sd.id] = val; hasAny = true; }
    });
    if (hasAny) {
      setPaguSumberDana(prev => ({ ...prev, [tahunAnggaranInput]: newPagu }));
      setSelectedYear(tahunAnggaranInput);
    }
    setShowPaguModal(false);
  }

  const totalPaguModal = sumberDanaList
    .filter(sd => sd.aktif)
    .reduce((sum, sd) => sum + Number((paguInputPerSD[sd.id] || '').replace(/\D/g, '') || 0), 0);

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
        [selectedYear]: { ...yearData, [editingBidangBulan.monthIdx]: { ...monthData, [editingBidangBulan.kode]: val } }
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

  const [activeCard, setActiveCard] = useState(null);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'PAGU', title: "TOTAL PAGU", value: formatRp(paguFiltered, true), color: "bg-blue-500", icon: DollarSign, detail: filterSumberDana === 'semua' ? `Tahun Anggaran ${selectedYear}` : `Tahun ${selectedYear} - ${activeSD?.nama || ''}` },
          { id: 'REALISASI', title: "TOTAL REALISASI", value: formatRp(totalRealisasi, true), color: "bg-emerald-500", icon: TrendingUp, detail: "Terserap" },
          { id: 'SISA', title: "SISA ANGGARAN", value: formatRp(Math.max(0, totalSisa), true), color: "bg-amber-500", icon: Wallet, detail: "Sisa Pagu" },
          { id: 'PERSENTASE', title: "PERSENTASE", value: `${pctSerapan}%`, color: "bg-purple-500", icon: PieChartIcon, detail: "Dari Total Pagu" }
        ].map((c, i) => (
          <div key={i} onClick={() => setActiveCard(activeCard === c.id ? null : c.id)} className={`group cursor-pointer bg-white rounded-xl p-4 shadow-sm border ${activeCard === c.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 active:scale-95 flex flex-col justify-between`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-2 min-w-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">{c.title}</div>
                <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight truncate">{c.value}</div>
              </div>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${c.color}`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-[11px] text-gray-400 font-medium">{c.detail}</div>
          </div>
        ))}
      </div>

      {/* Header: Filter Tahun + Sumber Dana + Tombol Set Pagu */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-slate-700">Tahun:</label>
            <select value={selectedYear} onChange={(e) => { setSelectedYear(Number(e.target.value)); setExpandedMonth(null); }}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-slate-800">
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-slate-700">Sumber Dana:</label>
            <select value={filterSumberDana} onChange={(e) => setFilterSumberDana(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-slate-800">
              <option value="semua">Semua Sumber Dana</option>
              {sumberDanaList.filter(sd => sd.aktif).map(sd => (
                <option key={sd.id} value={String(sd.id)}>{sd.nama}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={handleOpenPaguModal}
          className="flex items-center gap-2 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-semibold transition-colors">
          <DollarSign className="w-4 h-4" /> Set Pagu Anggaran
        </button>
      </div>

      {/* Distribusi Pagu Per Sumber Dana (Dihapus sesuai permintaan) */}
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
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">Serapan</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartPieData} cx="50%" cy="50%" innerRadius={44} outerRadius={62} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {chartPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-2xl font-extrabold text-gray-800 tracking-tight">{pctSerapan}%</div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Terserap</div>
              </div>
            </div>
            <div className="mt-5 w-full space-y-3">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[13px] text-gray-500 font-medium">{p.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700">{formatRp(p.value, true)}</span>
                </div>
              ))}
              {/* Total Realisasi Row */}
              <div className="pt-3 mt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-600 font-semibold uppercase tracking-wide">Total Realisasi</span>
                  <span className="text-[14px] font-bold text-emerald-600">{formatRp(totalRealisasi, true)}</span>
                </div>
              </div>
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
          <table className="w-full text-sm font-sans">
            <thead className="bg-gray-50 border-b border-slate-200">
              <tr>
                <th className="text-center py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-12">No</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bulan</th>
                <th className="text-right py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-48">Target</th>
                <th className="text-right py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-48">Realisasi</th>
                <th className="text-center py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36">Capaian</th>
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
                      <td className="py-3.5 px-4 text-slate-400 text-center font-medium text-[13px]">{m.idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-semibold text-slate-700 text-[13px]">
                          {m.bulan}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right tabular-nums text-slate-600 font-medium text-[13px]">
                        {m.target > 0 ? formatRp(m.target, true) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-6 text-right tabular-nums font-semibold text-[13px] text-slate-700">
                        {m.realisasi > 0 ? formatRp(m.realisasi, true) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasData ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-full max-w-[80px] bg-slate-100 rounded-full h-1.5 mx-auto overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${m.persentase >= 75 ? 'bg-emerald-500' : m.persentase >= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(m.persentase, 100)}%` }} />
                            </div>
                            <span className={`text-[11px] font-semibold ${m.persentase >= 75 ? 'text-emerald-600' : m.persentase >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                              {m.persentase}%
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-[11px] block text-center">-</span>}
                      </td>
                    </tr>

                    {isExpanded && bidangList.map((bidang, bIdx) => {
                      const manualT = currentYearTargetBidang[m.idx]?.[bidang.kode];
                      const autoT = autoTargetBidangBulan[m.idx]?.[bidang.kode] || 0;
                      const t = manualT !== undefined ? manualT : autoT;
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
                          <td className={`py-3 px-6 text-right tabular-nums font-medium ${pct >= 75 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
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

              <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-4 text-slate-700 text-[13px]">TOTAL {selectedYear}</td>
                <td className="py-3 px-4 text-right text-slate-700 text-[13px]">{formatRp(currentYearTargets.reduce((a, b) => a + b, 0))}</td>
                <td className="py-3 px-4 text-right text-slate-700 text-[13px]">{formatRp(totalRealisasi)}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-sm font-bold text-slate-700">{pctSerapan}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Set Pagu Per Sumber Dana */}
      {showPaguModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Set Pagu Anggaran Per Sumber Dana</h2>
                <p className="text-xs text-gray-500 mt-0.5">Alokasikan pagu berdasarkan sumber dana aktif</p>
              </div>
              <button onClick={() => setShowPaguModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Anggaran</label>
                <select value={tahunAnggaranInput} onChange={(e) => setTahunAnggaranInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                {sumberDanaList.filter(sd => sd.aktif).length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    Belum ada sumber dana aktif. Tambahkan dulu di Master Data.
                  </div>
                ) : sumberDanaList.filter(sd => sd.aktif).map(sd => (
                  <div key={sd.id}>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5 uppercase tracking-wide">{sd.nama}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                      <input type="text" inputMode="numeric"
                        value={paguInputPerSD[sd.id] ? Number(paguInputPerSD[sd.id]).toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setPaguInputPerSD(prev => ({ ...prev, [sd.id]: raw }));
                        }}
                        placeholder="0"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                    </div>
                  </div>
                ))}
                
                {newSdMode ? (
                  <div className="mt-4 p-4 border border-blue-200 bg-blue-50/50 rounded-xl">
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">Nama Sumber Dana Baru</label>
                    <div className="flex gap-2">
                      <input type="text" autoFocus value={newSdValue} onChange={(e) => setNewSdValue(e.target.value)}
                        placeholder="Contoh: DAU, DAK, BOS..."
                        className="flex-1 px-4 py-2.5 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button onClick={async () => {
                        if (newSdValue.trim()) {
                          try {
                            const newSd = await addSumberDana(newSdValue.trim());
                            setPaguInputPerSD(prev => ({ ...prev, [newSd.id]: '' }));
                            setNewSdMode(false);
                            setNewSdValue('');
                          } catch (err) {
                            alert("Gagal menambahkan sumber dana");
                          }
                        }
                      }} className="px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Simpan</button>
                      <button onClick={() => { setNewSdMode(false); setNewSdValue(''); }}
                        className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">Batal</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewSdMode(true)}
                    className="mt-2 w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Sumber Dana Baru
                  </button>
                )}
              </div>
              {/* Total auto-sum */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Pagu Keseluruhan</span>
                <span className="text-base font-bold text-blue-700">{formatRp(totalPaguModal, true)}</span>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowPaguModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSavePagu}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
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

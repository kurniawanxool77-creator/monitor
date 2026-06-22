import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Plus, X, Wallet, Filter, Search } from 'lucide-react';
import { useAppData } from '../../hooks/AppDataContext';
import { PAGU_TOTAL } from '../../lib/data';

function formatRp(n, short = false) {
  if (short) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)}Jt`;
    return `Rp ${n.toLocaleString('id-ID')}`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function UraianSubKegiatanTable() {
  const { dataUraian: uraianAnggaran, updateUraian, addActivityLog, subKegiatanMeta } = useAppData();
  const [expandedKode, setExpandedKode] = useState(new Set(['1', '2', '3', '4', '5']));
  const [selectedBidang, setSelectedBidang] = useState(null);

  const [filterBulan, setFilterBulan] = useState(new Date().getMonth().toString());
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState('');

  const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedKode, setSelectedKode] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [sukses, setSukses] = useState(false);

  function toggleExpand(kode) {
    setExpandedKode((prev) => {
      const next = new Set(prev);
      next.has(kode) ? next.delete(kode) : next.add(kode);
      return next;
    });
  }

  function isVisible(kode) {
    const parts = kode.split('.');
    if (parts.length === 1) return true;
    const parent = parts.slice(0, -1).join('.');
    return expandedKode.has(parent) && isVisible(parent);
  }

  let matchedKodes = new Set();
  const isDateFilterActive = filterBulan !== 'semua' || filterTahun !== 'semua';
  const isSearchActive = searchQuery.trim().length > 0;

  if (isDateFilterActive || isSearchActive) {
    uraianAnggaran.forEach(u => {
      let matchDate = true;
      if (isDateFilterActive) {
        const meta = subKegiatanMeta.find(m => m.id === u.kode);
        if (meta && meta.tanggalMulai && meta.tanggalSelesai) {
          const startDate = new Date(meta.tanggalMulai);
          const endDate = new Date(meta.tanggalSelesai);
          const startMonth = startDate.getMonth();
          const endMonth = endDate.getMonth();
          const startYear = startDate.getFullYear().toString();
          const endYear = endDate.getFullYear().toString();

          if (filterBulan !== 'semua') {
            const b = parseInt(filterBulan, 10);
            if (!(b >= startMonth && b <= endMonth)) matchDate = false;
          }
          if (filterTahun !== 'semua') {
            if (filterTahun !== startYear && filterTahun !== endYear) matchDate = false;
          }
        } else {
          matchDate = false;
        }
      }

      let matchSearch = true;
      if (isSearchActive) {
        if (!u.uraian.toLowerCase().includes(searchQuery.toLowerCase()) && !u.kode.includes(searchQuery)) {
          matchSearch = false;
        }
      }

      // Jika date filter aktif, dia HARUS match date.
      // Jika search filter aktif, dia HARUS match search.
      // Jika node ini match semua filter yang aktif:
      if ((!isDateFilterActive || matchDate) && (!isSearchActive || matchSearch)) {
        const parts = u.kode.split('.');
        let currentKode = '';
        for (const part of parts) {
          currentKode = currentKode ? `${currentKode}.${part}` : part;
          matchedKodes.add(currentKode);
        }
      }
    });

    // Pass 2: Jika search aktif, kita juga show children dari node yang di-search (tapi harus dicek juga datenya kalau date aktif)
    if (isSearchActive) {
      uraianAnggaran.forEach(u => {
        const parts = u.kode.split('.');
        if (parts.length > 1) {
          const parentKode = parts.slice(0, -1).join('.');
          if (matchedKodes.has(parentKode)) {
             // Parent matched search (and date). Show child too, IF date matches (or date is not active)
             let matchDate = true;
             if (isDateFilterActive) {
               const meta = subKegiatanMeta.find(m => m.id === u.kode);
               if (meta && meta.tanggalMulai && meta.tanggalSelesai) {
                 const startDate = new Date(meta.tanggalMulai);
                 const endDate = new Date(meta.tanggalSelesai);
                 const startMonth = startDate.getMonth();
                 const endMonth = endDate.getMonth();
                 const startYear = startDate.getFullYear().toString();
                 const endYear = endDate.getFullYear().toString();

                 if (filterBulan !== 'semua') {
                   const b = parseInt(filterBulan, 10);
                   if (!(b >= startMonth && b <= endMonth)) matchDate = false;
                 }
                 if (filterTahun !== 'semua') {
                   if (filterTahun !== startYear && filterTahun !== endYear) matchDate = false;
                 }
               } else {
                 matchDate = false;
               }
             }
             if (matchDate) {
               matchedKodes.add(u.kode);
             }
          }
        }
      });
    }
  }

  const filteredData = uraianAnggaran.filter(u => {
    if (selectedBidang && !(u.kode === selectedBidang || u.kode.startsWith(selectedBidang + '.'))) return false;
    if ((isDateFilterActive || isSearchActive) && !matchedKodes.has(u.kode)) return false;
    return true;
  });

  const uraianTotal = filteredData.reduce((a, u) => u.level === 1 ? a + u.target : a, 0);
  const uraianRealisasiTotal = filteredData.reduce((a, u) => u.level === 1 ? a + u.realisasi : a, 0);
  const sisaTotal = uraianTotal - uraianRealisasiTotal;

  // Ambil data per Bidang (level 1) untuk kartu ringkasan
  const bidangList = uraianAnggaran.filter(u => u.level === 1);

  const totalPaguDialokasikan = bidangList.reduce((acc, b) => acc + b.target, 0);
  const sisaPaguGlobal = PAGU_TOTAL - totalPaguDialokasikan;

  // Auto-fill form when selectedKode changes
  useEffect(() => {
    if (selectedKode) {
      const b = bidangList.find(x => x.kode === selectedKode);
      if (b) {
        setJumlah(formatInputRupiah(b.target.toString()));
      }
    } else {
      setJumlah('');
    }
  }, [selectedKode]); // Remove bidangList from deps to avoid loop

  function handleSimpanPagu() {
    if (!selectedKode || !jumlah) return;
    const amount = parseInt(jumlah.replace(/[^0-9]/g, ''), 10);
    if (isNaN(amount) || amount < 0) return;

    const b = bidangList.find(x => x.kode === selectedKode);
    if (!b) return;

    const currentTarget = b.target;
    // Check available pagu if increasing
    const difference = amount - currentTarget;
    if (difference > sisaPaguGlobal) {
      alert(`Sisa pagu global tidak mencukupi! Sisa: ${formatRp(sisaPaguGlobal)}`);
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    updateUraian(selectedKode, { target: amount });

    addActivityLog({
      user: user?.nama || 'Admin',
      action: 'Set Pagu Bidang',
      details: `Mengubah pagu bidang ${b.uraian} (${selectedKode}) menjadi ${formatRp(amount)}`
    });
    setSukses(true);
    setTimeout(() => {
      setSukses(false);
      setShowModal(false);
      setSelectedKode('');
      setJumlah('');
    }, 1500);
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedKode('');
    setJumlah('');
    setSukses(false);
  }

  function formatInputRupiah(val) {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return parseInt(num, 10).toLocaleString('id-ID');
  }

  return (
    <div className="space-y-6">
      {/* ── KARTU RINGKASAN PER BIDANG ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bidangList.map(b => {
          const sisa = b.target - b.realisasi;
          const pct = b.target > 0 ? Math.round((b.realisasi / b.target) * 100) : 0;
          const sisaPct = 100 - pct;
          const isKritis = sisaPct < 15;
          const isAman = sisaPct >= 40;
          const isSelected = selectedBidang === b.kode;

          return (
            <button
              key={b.kode}
              onClick={() => setSelectedBidang(isSelected ? null : b.kode)}
              className={`text-left bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isSelected
                  ? 'border-blue-500 ring-4 ring-blue-500/20 transform scale-[1.02] shadow-md bg-blue-50/10'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 active:scale-95'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2 min-w-0">
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate" title={b.uraian}>{b.uraian}</div>
                  <div className="text-2xl font-bold text-gray-900 truncate">{formatRp(sisa, true)}</div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isKritis ? 'bg-red-500' : isAman ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {isKritis
                    ? <AlertCircle className="w-6 h-6 text-white" />
                    : isAman
                      ? <CheckCircle2 className="w-6 h-6 text-white" />
                      : <AlertCircle className="w-6 h-6 text-white" />
                  }
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Target: <span className="font-medium text-gray-700">{formatRp(b.target, true)}</span></span>
                  <span className="font-bold text-gray-700">{pct}% Terserap</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isKritis ? 'bg-red-500' : pct >= 60 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── BARIS FILTER & TOMBOL ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari kode / uraian..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full text-sm font-medium focus:outline-none bg-transparent" />
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none">
              <option value="semua">Semua Bulan</option>
              {BULAN_NAMES.map((b, i) => <option key={i} value={i}>{b}</option>)}
            </select>
            <div className="w-px h-4 bg-gray-300"></div>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none">
              <option value="semua">Semua Tahun</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-200 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Pagu Bidang
        </button>
      </div>

      {/* ── TABEL DETAIL ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Table Info Bar */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-slate-100 bg-white">
          <div className="text-xs text-slate-500">
            Target: <span className="font-bold text-slate-700">{formatRp(uraianTotal, true)}</span>
            {' · '}
            Realisasi: <span className="font-bold text-emerald-600">{formatRp(uraianRealisasiTotal, true)}</span>
            {' · '}
            Sisa: <span className={`font-bold ${sisaTotal < 0 ? 'text-red-600' : 'text-blue-600'}`}>{formatRp(sisaTotal, true)}</span>
            {' · '}
            <span className={`font-bold ${uraianRealisasiTotal / uraianTotal >= 0.7 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {uraianTotal > 0 ? Math.round((uraianRealisasiTotal / uraianTotal) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-center py-3 px-4 font-semibold text-slate-600 w-16">No</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 w-56">Bidang</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Kegiatan</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Target (Pagu)</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Realisasi</th>
                <th className="text-right py-3 px-4 font-semibold text-blue-700 bg-blue-50">Sisa Anggaran</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600 w-40">% Persentase</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let kegiatanCount = 0;
                return filteredData.filter((u) => isVisible(u.kode)).map((u) => {
                const pct = u.target > 0 ? Math.round((u.realisasi / u.target) * 100) : 0;
                const sisa = u.target - u.realisasi;
                const hasChildren = uraianAnggaran.some((x) => x.kode.startsWith(u.kode + '.') && x.kode.split('.').length === u.kode.split('.').length + 1);
                const isExpanded = expandedKode.has(u.kode);
                const indent = (u.level - 1) * 20;

                return (
                  <React.Fragment key={u.kode}>
                    <tr className={`border-b border-slate-100 ${
                        u.level === 1 ? 'bg-blue-50/50 font-bold' :
                        u.level === 2 ? 'bg-slate-50/50 font-semibold' :
                        u.level === 3 ? 'hover:bg-slate-50' :
                        'hover:bg-slate-50 text-slate-600'
                      }`}>

                      <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center whitespace-nowrap">
                        {u.level === 1 ? '' : ++kegiatanCount}
                      </td>

                      {u.level === 1 ? (
                        <>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {hasChildren ? (
                                <button onClick={() => toggleExpand(u.kode)} className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 transition-colors">
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                              ) : (
                                <span className="w-5 h-5 flex-shrink-0" />
                              )}
                              <span className="font-bold text-blue-800">
                                {u.uraian}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-400">-</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 pl-10 text-xs font-semibold text-slate-500">
                            {uraianAnggaran.find(x => x.kode === u.kode.split('.')[0])?.uraian || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {u.uraian}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                        {formatRp(u.target)}
                      </td>

                      <td className={`py-3 px-4 text-right tabular-nums font-medium ${pct > 100 ? 'text-red-600' : pct >= 80 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                        {formatRp(u.realisasi)}
                      </td>

                      <td className={`py-3 px-4 text-right tabular-nums font-bold bg-blue-50/30 ${
                        sisa < 0 ? 'text-red-600' :
                        sisa === 0 ? 'text-red-500' :
                        sisa / u.target < 0.30 ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {sisa < 0 ? <span className="text-red-600">Melebihi Pagu</span> : formatRp(sisa)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[60px]">
                            <div className={`h-1.5 rounded-full transition-all ${pct > 100 ? 'bg-red-500' : pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-bold min-w-[36px] text-right ${pct > 100 ? 'text-red-600' : pct >= 80 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })})()}
            </tbody>

            <tfoot className="bg-slate-100 border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-3 px-4 font-bold text-slate-700">TOTAL</td>
                <td className="py-3 px-4 text-right font-black text-slate-800 tabular-nums">{formatRp(uraianTotal)}</td>
                <td className="py-3 px-4 text-right font-black text-emerald-700 tabular-nums">{formatRp(uraianRealisasiTotal)}</td>
                <td className={`py-3 px-4 text-right font-black tabular-nums ${sisaTotal < 0 ? 'text-red-600' : 'text-blue-700'}`}>{formatRp(sisaTotal)}</td>
                <td className="py-3 px-4 text-center font-black text-slate-700">
                  {uraianTotal > 0 ? Math.round((uraianRealisasiTotal / uraianTotal) * 100) : 0}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── MODAL TAMBAH PAGU BIDANG ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Set Pagu Bidang</h2>
                <p className="text-xs text-slate-500 mt-0.5">Alokasikan pagu global ke masing-masing bidang</p>
              </div>
              <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sukses ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                </div>
                <p className="font-bold text-emerald-700 text-lg">Pagu Bidang berhasil diperbarui!</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">

                {/* Global Pagu Summary */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-0.5">Total Pagu Global</div>
                      <div className="font-bold text-slate-800 text-sm">{formatRp(PAGU_TOTAL, true)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-0.5">Sisa Belum Dialokasikan</div>
                      <div className={`font-bold text-sm ${sisaPaguGlobal < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                        {formatRp(sisaPaguGlobal, true)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pilih Bidang <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedKode}
                      onChange={(e) => setSelectedKode(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                    >
                      <option value="">-- Pilih Bidang --</option>
                      {bidangList.map(b => (
                        <option key={b.kode} value={b.kode}>{b.uraian}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pagu Bidang (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={jumlah}
                        disabled={!selectedKode}
                        onChange={e => setJumlah(formatInputRupiah(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:bg-slate-50 disabled:cursor-not-allowed font-medium text-slate-800"
                      />
                    </div>
                    {selectedKode && (
                      <p className="text-xs text-slate-500 mt-2">
                        Mengubah pagu ini akan memotong dari sisa pagu global yang belum dialokasikan.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleCloseModal} className="flex-1 py-3 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    Batal
                  </button>
                  <button
                    onClick={handleSimpanPagu}
                    disabled={!selectedKode || !jumlah}
                    className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Simpan Pagu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

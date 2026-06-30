import { UraianSubKegiatanTable } from "../../shared/UraianSubKegiatanTable";
import { useAppData } from "../../../hooks/AppDataContext";
import { DollarSign, X, Save } from 'lucide-react';
import { useState } from 'react';

function formatRp(n, short = false) {
  if (short) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)}Jt`;
    return `Rp ${n.toLocaleString('id-ID')}`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function RealisasiPage() {
  const { paguSumberDana, setPaguSumberDana, sumberDanaList } = useAppData();

  // Modal state for Set Pagu Anggaran Per Sumber Dana
  const [showPaguModal, setShowPaguModal] = useState(false);
  const [activeRows, setActiveRows] = useState([]);
  const [tahunAnggaranInput, setTahunAnggaranInput] = useState(new Date().getFullYear());

  const availableYears = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 3 + i);

  function loadRowsForYear(year) {
    const existing = paguSumberDana[year] || {};
    const activeSdList = sumberDanaList.filter(sd => sd.aktif);
    let rows = [];
    if (activeSdList.length > 0) {
      Object.entries(existing).forEach(([sdId, val]) => {
        if (val > 0 && activeSdList.find(sd => String(sd.id) === sdId)) {
          rows.push({ id: Math.random().toString(36).substr(2, 9), sdId: String(sdId), amount: String(val) });
        }
      });
      if (rows.length === 0) {
        rows.push({ id: Math.random().toString(36).substr(2, 9), sdId: '', amount: '' });
      }
    }
    setActiveRows(rows);
  }

  function handleOpenPaguModal() {
    const year = new Date().getFullYear();
    setTahunAnggaranInput(year);
    loadRowsForYear(year);
    setShowPaguModal(true);
  }

  function handleYearChange(e) {
    const year = Number(e.target.value);
    setTahunAnggaranInput(year);
    loadRowsForYear(year);
  }

  function handleSavePagu() {
    const newPagu = {};
    activeRows.forEach(row => {
      const val = Number((row.amount || '').replace(/\D/g, ''));
      if (row.sdId && val > 0) {
        newPagu[row.sdId] = (newPagu[row.sdId] || 0) + val;
      }
    });
    
    setPaguSumberDana(prev => ({ ...prev, [tahunAnggaranInput]: newPagu }));
    setShowPaguModal(false);
  }

  const totalPaguModal = activeRows.reduce((sum, row) => sum + Number((row.amount || '').replace(/\D/g, '') || 0), 0);

  return (
    <div className="space-y-6">
      <UraianSubKegiatanTable onOpenPaguModal={handleOpenPaguModal} />

      {/* Modal: Set Pagu Per Sumber Dana */}
      {showPaguModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Set Pagu Anggaran Per Sumber Dana</h2>
                <p className="text-xs text-gray-500 mt-0.5">Alokasikan pagu global per tahun berdasarkan sumber dana</p>
              </div>
              <button type="button" onClick={() => setShowPaguModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Anggaran</label>
                <select value={tahunAnggaranInput} onChange={handleYearChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold">
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Distribusi Sumber Dana</label>
                  <button
                    type="button"
                    onClick={() => setActiveRows([...activeRows, { id: Math.random().toString(36).substr(2, 9), sdId: '', amount: '' }])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    + Tambah Dana
                  </button>
                </div>
                
                <div className="space-y-2">
                  {activeRows.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                      <p className="text-sm text-slate-500 mb-1">Belum ada sumber dana dialokasikan.</p>
                      <p className="text-[11px] text-slate-400">Klik &quot;+ Tambah Dana&quot; untuk mulai.</p>
                    </div>
                  ) : (
                    activeRows.map((row, index) => {
                      const selectedSdIds = activeRows.map(r => r.sdId).filter(id => id !== '');
                      const availableSds = sumberDanaList.filter(sd => sd.aktif && (String(sd.id) === row.sdId || !selectedSdIds.includes(String(sd.id))));
                      
                      return (
                        <div key={row.id} className="flex flex-col gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <select
                              value={row.sdId}
                              onChange={(e) => {
                                const newRows = [...activeRows];
                                newRows[index].sdId = e.target.value;
                                setActiveRows(newRows);
                              }}
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Pilih Sumber Dana --</option>
                              {availableSds.map(sd => (
                                <option key={sd.id} value={sd.id}>{sd.nama}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setActiveRows(activeRows.filter((_, i) => i !== index))}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={row.amount ? Number(row.amount.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                const newRows = [...activeRows];
                                newRows[index].amount = raw;
                                setActiveRows(newRows);
                              }}
                              placeholder="0"
                              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Total auto-sum */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Pagu Disimpan</span>
                <span className="text-base font-bold text-blue-700">{formatRp(totalPaguModal, true)}</span>
              </div>
            </div>
            
            <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/80">
              <button type="button" onClick={() => setShowPaguModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 bg-white">Batal</button>
              <button type="button" onClick={handleSavePagu}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                <Save className="w-4 h-4" /> Simpan Pagu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

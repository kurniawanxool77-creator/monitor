import { UraianSubKegiatanTable } from '../shared/UraianSubKegiatanTable';
import { useAppData } from '../../hooks/AppDataContext';
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
  const [paguInputPerSD, setPaguInputPerSD] = useState({});
  const [tahunAnggaranInput, setTahunAnggaranInput] = useState(new Date().getFullYear());

  const availableYears = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 3 + i);

  function handleOpenPaguModal() {
    const existing = paguSumberDana[tahunAnggaranInput] || {};
    const inputs = {};
    sumberDanaList.filter(sd => sd.aktif).forEach(sd => {
      inputs[sd.id] = existing[sd.id] ? String(existing[sd.id]) : '';
    });
    setPaguInputPerSD(inputs);
    setTahunAnggaranInput(new Date().getFullYear());
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
    }
    setShowPaguModal(false);
  }

  const totalPaguModal = sumberDanaList
    .filter(sd => sd.aktif)
    .reduce((sum, sd) => sum + Number((paguInputPerSD[sd.id] || '').replace(/\D/g, '') || 0), 0);

  return (
    <div className="space-y-6">
      <UraianSubKegiatanTable onOpenPaguModal={handleOpenPaguModal} />

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{sd.nama}</label>
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
    </div>
  );
}

import { useState } from 'react';
import { FileText, Download, Eye, Share2, Printer } from 'lucide-react';
import { useAppData } from "../../../hooks/AppDataContext";

function formatRp(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatRpShort(n) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function LaporanAnggaran() {
  const { dataUraian, subKegiatanMeta, sumberDanaList } = useAppData();
  const [filterBagian, setFilterBagian] = useState('semua');
  const [filterPeriode, setFilterPeriode] = useState('semua');
  const [filterSumberDana, setFilterSumberDana] = useState('semua');
  const [filterLevel, setFilterLevel] = useState('perBidang');

  const bidangList = dataUraian.filter(u => u.level === 1);

  // Cari nama SD yang dipilih
  const activeSdObj = sumberDanaList.find(sd => String(sd.id) === filterSumberDana);
  const activeSdNama = activeSdObj?.nama || '';

  // Filter bidang berdasarkan Bagian
  const filteredBidang = filterBagian === 'semua'
    ? bidangList
    : bidangList.filter(b => b.uraian === filterBagian);

  // Jika filter SD aktif, hitung pagu & realisasi hanya dari kegiatan dengan SD tersebut
  const getFilteredTotalsForBidang = (bidangKode) => {
    if (filterSumberDana === 'semua') {
      const b = dataUraian.find(u => u.kode === bidangKode);
      return { target: b?.target || 0, realisasi: b?.realisasi || 0 };
    }
    // Sum dari leaf subKegiatan yang cocok SD
    const leaves = subKegiatanMeta.filter(m =>
      m.id.startsWith(bidangKode + '.') && m.sumberDana === activeSdNama && !m.isWadah
    );
    const target = leaves.reduce((sum, m) => {
      const u = dataUraian.find(x => x.kode === m.id);
      return sum + (u?.target || 0);
    }, 0);
    const realisasi = leaves.reduce((sum, m) => {
      const u = dataUraian.find(x => x.kode === m.id);
      return sum + (u?.realisasi || 0);
    }, 0);
    return { target, realisasi };
  };

  const bidangRows = filteredBidang
    .map(b => {
      const totals = getFilteredTotalsForBidang(b.kode);
      return { ...b, ...totals };
    })
    .filter(b => filterSumberDana === 'semua' || b.target > 0 || b.realisasi > 0);

  const totalPagu = bidangRows.reduce((sum, b) => sum + b.target, 0);
  const totalRealisasi = bidangRows.reduce((sum, b) => sum + b.realisasi, 0);
  const totalSisa = totalPagu - totalRealisasi;
  const pctSerapan = totalPagu > 0 ? ((totalRealisasi / totalPagu) * 100).toFixed(2) : '0.00';

  const sdLabel = filterSumberDana === 'semua' ? 'Semua Sumber Dana' : activeSdNama;
  const currentYear = new Date().getFullYear();

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Print CSS */}
      <style>{`
        @media print {
          body > *:not(#laporan-print-area) { display: none !important; }
          #laporan-print-area { display: block !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 no-print">
        <h2 className="font-bold text-gray-900 mb-4">Filter Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bidang</label>
            <select value={filterBagian} onChange={(e) => setFilterBagian(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="semua">Semua Bidang</option>
              {bidangList.map(b => (
                <option key={b.kode} value={b.uraian}>{b.uraian}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
            <select value={filterPeriode} onChange={(e) => setFilterPeriode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="semua">Semua Periode</option>
              <option value="q1">Triwulan 1</option>
              <option value="q2">Triwulan 2</option>
              <option value="q3">Triwulan 3</option>
              <option value="q4">Triwulan 4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="perBidang">Per Bidang</option>
              <option value="perKegiatan">Per Kegiatan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Dana</label>
            <select value={filterSumberDana} onChange={(e) => setFilterSumberDana(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="semua">Semua Sumber Dana</option>
              {sumberDanaList.filter(sd => sd.aktif).map(sd => (
                <option key={sd.id} value={String(sd.id)}>{sd.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 no-print">
          <h2 className="font-bold text-gray-900">Preview Laporan</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Eye className="w-4 h-4" /> Print Preview
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div id="laporan-print-area" className="border border-gray-200 rounded-lg p-8 bg-gray-50">
          <div className="bg-white p-8 rounded shadow-sm">
            {/* Report Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">LAPORAN ANGGARAN &amp; REALISASI</h1>
              <p className="text-gray-600">Sekretariat DPRD Provinsi Jawa Tengah</p>
              <p className="text-gray-600">Periode: Tahun Anggaran {currentYear}</p>
              <p className="text-gray-700 font-semibold mt-1">
                Sumber Dana: <span className="text-blue-700">{sdLabel}</span>
              </p>
              {filterBagian !== 'semua' && (
                <p className="text-gray-600 text-sm mt-1">Bidang: {filterBagian}</p>
              )}
            </div>

            {/* Report Summary */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Ringkasan Anggaran</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Total Pagu</div>
                  <div className="text-xl font-bold text-gray-900">{formatRpShort(totalPagu)}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Realisasi</div>
                  <div className="text-xl font-bold text-emerald-700">{formatRpShort(totalRealisasi)}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Sisa</div>
                  <div className="text-xl font-bold text-blue-700">{formatRpShort(totalSisa)}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">% Serapan</div>
                  <div className="text-xl font-bold text-gray-900">{pctSerapan}%</div>
                </div>
              </div>
            </div>

            {/* Detail Table */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Rincian Per Bidang</h3>
              <table className="w-full text-sm font-sans">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border">Bidang</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border">Pagu</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border">Realisasi</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border">Sisa</th>
                    <th className="text-center py-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border">%</th>
                  </tr>
                </thead>
                <tbody>
                  {bidangRows.length > 0 ? (
                    bidangRows.map(b => {
                      const sisa = b.target - b.realisasi;
                      const pct = b.target > 0 ? Math.round((b.realisasi / b.target) * 100) : 0;
                      return (
                        <tr key={b.kode}>
                          <td className="py-2.5 px-3 border text-[13px] text-gray-700">{b.uraian}</td>
                          <td className="py-2.5 px-3 border text-right text-[13px] font-medium text-slate-700">{formatRp(b.target)}</td>
                          <td className="py-2.5 px-3 border text-right text-[13px] font-medium text-emerald-700">{formatRp(b.realisasi)}</td>
                          <td className="py-2.5 px-3 border text-right text-[13px] font-medium text-blue-700">{formatRp(sisa)}</td>
                          <td className="py-2.5 px-3 border text-center text-[13px] font-medium text-slate-600">{pct}%</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 border text-sm">
                        Tidak ada data untuk sumber dana / bidang yang dipilih.
                      </td>
                    </tr>
                  )}
                  <tr className="font-semibold bg-slate-50 border-t-2 border-slate-200">
                    <td className="py-2.5 px-3 border text-[13px] text-slate-700">TOTAL</td>
                    <td className="py-2.5 px-3 border text-right text-[13px] text-slate-700">{formatRp(totalPagu)}</td>
                    <td className="py-2.5 px-3 border text-right text-[13px] text-emerald-700">{formatRp(totalRealisasi)}</td>
                    <td className="py-2.5 px-3 border text-right text-[13px] text-blue-700">{formatRp(totalSisa)}</td>
                    <td className="py-2.5 px-3 border text-center text-[13px] text-slate-700">{pctSerapan}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="flex justify-between items-start">
                <div className="text-sm text-gray-600">
                  <p>Dokumen ini digenerate secara otomatis</p>
                  <p>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Sumber Dana: <strong>{sdLabel}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-12">Mengetahui,</p>
                  <p className="font-bold text-gray-900">Kepala Bagian Keuangan</p>
                  <p className="text-sm text-gray-600">Sekretariat DPRD Provinsi Jawa Tengah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

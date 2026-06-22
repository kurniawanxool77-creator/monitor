import { useState } from 'react';
import { FileText, Download, Eye, Share2, DollarSign } from 'lucide-react';
import { useAppData } from '../../hooks/AppDataContext';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatRpShort(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function LaporanAnggaran() {
  const { dataUraian } = useAppData();
  const [filterBagian, setFilterBagian] = useState('semua');
  const [filterPeriode, setFilterPeriode] = useState('semua');

  const bidangList = dataUraian.filter(u => u.level === 1);
  
  const filteredBidang = filterBagian === 'semua' 
    ? bidangList 
    : bidangList.filter(b => b.uraian === filterBagian);

  const totalPagu = filteredBidang.reduce((sum, b) => sum + b.target, 0);
  const totalRealisasi = filteredBidang.reduce((sum, b) => sum + b.realisasi, 0);
  const totalSisa = totalPagu - totalRealisasi;
  const pctSerapan = totalPagu > 0 ? ((totalRealisasi / totalPagu) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Filter Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bidang</label>
            <select
              value={filterBagian}
              onChange={(e) => setFilterBagian(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semua">Semua Bidang</option>
              {bidangList.map(b => (
                <option key={b.kode} value={b.uraian}>{b.uraian}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
            <select
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semua">Semua Periode</option>
              <option value="q1">Triwulan 1</option>
              <option value="q2">Triwulan 2</option>
              <option value="q3">Triwulan 3</option>
              <option value="q4">Triwulan 4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Per Bidang</option>
              <option>Per Kegiatan</option>
              <option>Per SubKegiatan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900">Preview Laporan</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Eye className="w-4 h-4" />
              Print Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Sample Report Content */}
        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
          <div className="bg-white p-8 rounded shadow-sm">
            {/* Report Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <div className="flex items-center justify-center gap-4 mb-4">


              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">LAPORAN ANGGARAN & REALISASI</h1>
              <p className="text-gray-600">Periode: Tahun Anggaran {new Date().getFullYear()}</p>
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
                  <div className="text-xl font-bold text-gray-900">{formatRpShort(totalRealisasi)}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Sisa</div>
                  <div className="text-xl font-bold text-gray-900">{formatRpShort(totalSisa)}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">% Serapan</div>
                  <div className="text-xl font-bold text-gray-900">{pctSerapan}%</div>
                </div>
              </div>
            </div>

            {/* Sample Table */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Rincian Per Bidang</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-3 border">Bidang</th>
                    <th className="text-right py-2 px-3 border">Pagu</th>
                    <th className="text-right py-2 px-3 border">Realisasi</th>
                    <th className="text-right py-2 px-3 border">Sisa</th>
                    <th className="text-center py-2 px-3 border">%</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBidang.length > 0 ? (
                    filteredBidang.map(b => {
                      const sisa = b.target - b.realisasi;
                      const pct = b.target > 0 ? Math.round((b.realisasi / b.target) * 100) : 0;
                      return (
                        <tr key={b.kode}>
                          <td className="py-2 px-3 border">{b.uraian}</td>
                          <td className="py-2 px-3 border text-right">{formatRp(b.target)}</td>
                          <td className="py-2 px-3 border text-right">{formatRp(b.realisasi)}</td>
                          <td className="py-2 px-3 border text-right">{formatRp(sisa)}</td>
                          <td className="py-2 px-3 border text-center">{pct}%</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 border">Tidak ada data bidang.</td>
                    </tr>
                  )}
                  <tr className="font-bold bg-gray-50">
                    <td className="py-2 px-3 border">TOTAL</td>
                    <td className="py-2 px-3 border text-right">{formatRp(totalPagu)}</td>
                    <td className="py-2 px-3 border text-right">{formatRp(totalRealisasi)}</td>
                    <td className="py-2 px-3 border text-right">{formatRp(totalSisa)}</td>
                    <td className="py-2 px-3 border text-center">{pctSerapan}%</td>
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

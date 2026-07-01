import { useState } from 'react';
import { Download, Eye, DollarSign } from 'lucide-react';

function formatRp(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export function LaporanPendapatan() {
  const [filterBulan, setFilterBulan] = useState('Semua');
  
  // Dummy data for placeholder
  const totalTarget = 5000000000;
  const totalRealisasi = 3500000000;
  const sisa = totalTarget - totalRealisasi;
  const pct = Math.round((totalRealisasi / totalTarget) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Filter Laporan Pendapatan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <select 
              value={filterBulan} 
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Semua">Semua Bulan</option>
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900">Preview Laporan Pendapatan</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Eye className="w-4 h-4" /> Print Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
          <div className="bg-white p-8 rounded shadow-sm text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">LAPORAN PENDAPATAN</h1>
            <p className="text-gray-600 mb-8">Sekretariat DPRD Provinsi Jawa Tengah</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="border border-gray-300 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Target Pendapatan</div>
                <div className="text-xl font-bold text-gray-900">{formatRp(totalTarget)}</div>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Realisasi Pendapatan</div>
                <div className="text-xl font-bold text-emerald-700">{formatRp(totalRealisasi)}</div>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Kekurangan Target</div>
                <div className="text-xl font-bold text-blue-700">{formatRp(sisa)}</div>
              </div>
              <div className="border border-gray-300 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Persentase</div>
                <div className="text-xl font-bold text-gray-900">{pct}%</div>
              </div>
            </div>
            
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <DollarSign className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">Modul Laporan Pendapatan sedang dalam pengembangan.</p>
              <p className="text-sm text-gray-400 mt-1">Data rinci akan ditampilkan di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

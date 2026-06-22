import { useState } from 'react';
import { FileText, Download, Eye, Printer, Share2 } from 'lucide-react';
import { useAppData } from '../../hooks/AppDataContext';

export function LaporanSubKegiatan() {
  const { getSubKegiatanList, getBagianList } = useAppData();
  const subKegiatanList = getSubKegiatanList();
  const bagianList = getBagianList();

  const [filterQuery, setFilterQuery] = useState('');
  const [filterBagian, setFilterBagian] = useState('semua');
  const [filterBulan, setFilterBulan] = useState('semua');
  const [filterTahun, setFilterTahun] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');

  // Filter the subKegiatan
  const filteredSubKegiatan = subKegiatanList.filter(k => !k.isWadah).filter(k => {
    if (filterQuery && !k.nama.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    if (filterBagian !== 'semua' && !k.bidang.toLowerCase().includes(filterBagian.toLowerCase())) return false;
    
    // Check month if filterBulan is not 'semua'
    if (filterBulan !== 'semua') {
      const monthStr = String(filterBulan).padStart(2, '0');
      if (!k.tanggalMulai.includes(`-${monthStr}-`)) return false;
    }
    
    // Check year if filterTahun is not 'semua'
    if (filterTahun !== 'semua' && !k.tanggalMulai.startsWith(filterTahun)) return false;
    
    if (filterStatus !== 'semua' && k.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

  const total = filteredSubKegiatan.length;
  const selesai = filteredSubKegiatan.filter(k => k.status === 'Selesai').length;
  const berjalan = filteredSubKegiatan.filter(k => k.status === 'Berjalan').length;

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kegiatan</label>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Cari kegiatan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bagian</label>
            <select
              value={filterBagian}
              onChange={(e) => setFilterBagian(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semua">Semua Bidang</option>
              {bagianList.map((b) => (
                <option key={b.id} value={b.nama}>{b.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semua">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semua">Semua Tahun</option>
              {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 3 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="semua">Semua Status</option>
              <option value="selesai">Selesai</option>
              <option value="berjalan">Berjalan</option>
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

              <h1 className="text-2xl font-bold text-gray-900 mb-2">LAPORAN KEGIATAN</h1>
              <p className="text-gray-600">Periode: {filterBulan === 'semua' ? 'Semua Waktu' : `Bulan ${filterBulan}`}</p>
            </div>

            {/* Report Summary */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Ringkasan Kegiatan</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Total Kegiatan</div>
                  <div className="text-2xl font-bold text-gray-900">{total}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Selesai</div>
                  <div className="text-2xl font-bold text-gray-900">{selesai}</div>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Berjalan</div>
                  <div className="text-2xl font-bold text-gray-900">{berjalan}</div>
                </div>
              </div>
            </div>

            {/* Sample Table */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Daftar Kegiatan</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-3 border">No</th>
                    <th className="text-left py-2 px-3 border">Nama Kegiatan</th>
                    <th className="text-left py-2 px-3 border">Tanggal Mulai</th>
                    <th className="text-left py-2 px-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubKegiatan.length > 0 ? (
                    filteredSubKegiatan.map((keg, idx) => (
                      <tr key={keg.id}>
                        <td className="py-2 px-3 border">{idx + 1}</td>
                        <td className="py-2 px-3 border">{keg.nama}</td>
                        <td className="py-2 px-3 border">{keg.tanggalMulai}</td>
                        <td className="py-2 px-3 border">{keg.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500 border">Tidak ada kegiatan yang sesuai dengan filter.</td>
                    </tr>
                  )}
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
                  <p className="font-bold text-gray-900">Sekretaris DPRD</p>
                  <p className="text-sm text-gray-600">Provinsi Jawa Tengah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

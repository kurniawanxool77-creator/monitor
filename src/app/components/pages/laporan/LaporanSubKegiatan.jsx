import { useState } from 'react';
import { FileText, Download, Eye, Share2 } from 'lucide-react';
import { useAppData } from "../../../hooks/AppDataContext";

export function LaporanSubKegiatan() {
  const { dataUraian, subKegiatanMeta } = useAppData();
  
  const [filterQuery, setFilterQuery] = useState('');
  const [filterBagian, setFilterBagian] = useState('semua');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  const bagianList = dataUraian.filter(u => u.level === 1).map(u => ({ id: u.kode, nama: u.uraian }));

  const targetBidangKode = filterBagian === 'semua' ? null : dataUraian.find(u => u.level === 1 && u.uraian === filterBagian)?.kode;

  // Sorting hirarkis 3 level
  const sortedData = [...dataUraian].sort((a, b) => {
    const aParts = a.kode.split('.').map(Number);
    const bParts = b.kode.split('.').map(Number);
    const minLen = Math.min(aParts.length, bParts.length);
    for (let i = 0; i < minLen; i++) {
      if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
    }
    return aParts.length - bParts.length;
  });

  const rowData = sortedData.map(u => {
    const meta = subKegiatanMeta.find(m => m.id === u.kode);
    return {
      ...u,
      tanggalMulai: meta?.tanggalMulai || '-',
      tanggalSelesai: meta?.tanggalSelesai || '-',
      status: meta?.status || '-',
      isWadah: meta?.isWadah !== false // default true for parents
    };
  }).filter(k => {
    if (targetBidangKode && !k.kode.startsWith(targetBidangKode + '.') && k.kode !== targetBidangKode) return false;
    
    // Untuk leaf (Sub Kegiatan), terapkan filter status dan query
    if (!k.isWadah || k.level === 3) {
       if (filterQuery && !k.uraian.toLowerCase().includes(filterQuery.toLowerCase())) return false;
       if (filterTanggal && !k.tanggalMulai.startsWith(filterTanggal)) return false;
       if (filterStatus !== 'semua' && k.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    }
    // Note: If we aggressively filter out leaves, parents might be left dangling without children. 
    // In a simple approach, we just show all parents matching Bidang, and hide leaves that don't match.
    return true; 
  });

  // Calculate stats from leaves only
  const leaves = rowData.filter(r => r.level === 3 || !r.isWadah);
  const total = leaves.length;
  const selesai = leaves.filter(k => k.status === 'Selesai').length;
  const berjalan = leaves.filter(k => k.status === 'Berjalan').length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kegiatan</label>
            <input type="text" value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Cari kegiatan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bagian</label>
            <select value={filterBagian} onChange={(e) => setFilterBagian(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="semua">Semua Bidang</option>
              {bagianList.map(b => (
                <option key={b.id} value={b.nama}>{b.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
              <Eye className="w-4 h-4" /> Print Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" /> Share Link
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
          <div className="bg-white p-8 rounded shadow-sm">
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">LAPORAN KEGIATAN</h1>
              <p className="text-gray-600">
                Tanggal: {filterTanggal 
                  ? new Date(filterTanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                  : 'Semua Waktu'}
              </p>
            </div>

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

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Daftar Kegiatan</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-3 border font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Uraian / Nama Kegiatan</th>
                    <th className="text-left py-2 px-3 border font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Tanggal Mulai</th>
                    <th className="text-left py-2 px-3 border font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Tanggal Selesai</th>
                    <th className="text-left py-2 px-3 border font-semibold text-slate-500 uppercase text-[11px] tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rowData.length > 0 ? (
                    rowData.map((keg) => {
                      const indent = (keg.level - 1) * 20;
                      return (
                        <tr key={keg.kode} className={`${keg.level === 1 ? 'bg-blue-50/40 font-bold' : keg.level === 2 ? 'bg-slate-50/50 font-semibold' : ''}`}>
                          <td className="py-2.5 px-3 border text-[13px] text-gray-700" style={{ paddingLeft: `${indent + 12}px` }}>{keg.uraian}</td>
                          <td className="py-2.5 px-3 border text-[13px] text-gray-600">{keg.level === 3 ? keg.tanggalMulai : '-'}</td>
                          <td className="py-2.5 px-3 border text-[13px] text-gray-600">{keg.level === 3 ? keg.tanggalSelesai : '-'}</td>
                          <td className="py-2.5 px-3 border text-[13px] font-medium">
                            {keg.level === 3 ? (
                              <span className={`${keg.status === 'Selesai' ? 'text-emerald-600' : keg.status === 'Terlambat' ? 'text-red-600' : 'text-blue-600'}`}>
                                {keg.status}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500 border">Tidak ada kegiatan yang sesuai dengan filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

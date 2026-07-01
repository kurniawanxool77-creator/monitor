import { useState, useEffect } from 'react';
import { Database, Plus, Edit, Trash2, X, Save, TrendingDown, Users, FolderTree, FileText, CheckSquare } from 'lucide-react';
import { anggotaData as defaultAnggotaData } from "../../../lib/data";
import { useAppData } from "../../../hooks/AppDataContext";

const COLORS_PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700'
];

function getBidangColor(nama) {
  if (!nama) return 'bg-gray-100 text-gray-600';
  let hash = 0;
  for (let i = 0; i < nama.length; i++) {
    hash = nama.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS_PALETTE[Math.abs(hash) % COLORS_PALETTE.length];
}

function formatRp(n) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function MasterData() {
  const { dataUraian, addUraianBaru, updateUraian, deleteUraian, addActivityLog, sumberDanaList, addSumberDana, deleteSumberDana, anggotaList, setAnggotaList } = useAppData();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperadmin = user?.role === 'superadmin';

  const [editModal, setEditModal] = useState(null);
  const [editNama, setEditNama] = useState('');
  const [editTarget, setEditTarget] = useState('');

  const [editAnggotaModal, setEditAnggotaModal] = useState(null);
  const [editAnggotaNama, setEditAnggotaNama] = useState('');
  const [editAnggotaJabatan, setEditAnggotaJabatan] = useState('');
  const [editAnggotaBidang, setEditAnggotaBidang] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function confirmDelete() {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'anggota') {
      setAnggotaList(prev => prev.filter(a => a.id !== deleteConfirm.id));
      addActivityLog({ user: user?.nama || 'Unknown', action: 'Hapus Anggota', details: `Menghapus anggota: ${deleteConfirm.nama}` });
    } else {
      deleteUraian(deleteConfirm.id);
      addActivityLog({
        user: user?.nama || 'Unknown User',
        action: 'Hapus Master Data',
        details: `Menghapus Uraian ${deleteConfirm.id}: "${deleteConfirm.nama}" beserta semua turunannya`
      });
    }
    setDeleteConfirm(null);
  }

  function openEditUraianModal(kode, nama, target) {
    if (!isSuperadmin) return alert('Hanya Superadmin yang bisa mengedit Master Data.');
    setEditNama(nama);
    setEditTarget(String(target));
    setEditModal({ kode, nama, target });
  }

  function saveEditUraian() {
    if (!editModal || !editNama.trim()) return;
    const newTarget = Number(editTarget) || editModal.target;
    updateUraian(editModal.kode, { uraian: editNama.trim(), target: newTarget });
    addActivityLog({
      user: user?.nama || 'Unknown User',
      action: 'Edit Master Data',
      details: `Mengubah Uraian ${editModal.kode} dari "${editModal.nama}" menjadi "${editNama.trim()}"`
    });
    setEditModal(null);
  }

  function openEditAnggotaModal(item) {
    if (!isSuperadmin) return alert('Hanya Superadmin yang bisa mengedit Master Data.');
    setEditAnggotaNama(item.nama);
    setEditAnggotaJabatan(item.jabatan);
    setEditAnggotaBidang(item.bidang);
    setEditAnggotaModal(item);
  }

  function saveEditAnggota() {
    if (!editAnggotaModal || !editAnggotaNama.trim()) return;
    setAnggotaList(prev => prev.map(a => a.id === editAnggotaModal.id ? { ...a, nama: editAnggotaNama.trim(), jabatan: editAnggotaJabatan.trim(), bidang: editAnggotaBidang } : a));
    addActivityLog({ user: user?.nama || 'Unknown', action: 'Edit Anggota', details: `Mengubah data anggota: ${editAnggotaNama.trim()}` });
    setEditAnggotaModal(null);
  }

  function handleDeleteAnggota(id, nama) {
    if (!isSuperadmin) return alert('Hanya Superadmin yang bisa menghapus.');
    setDeleteConfirm({ type: 'anggota', id, nama });
  }

  function handleDeleteUraian(kode, nama) {
    if (!isSuperadmin) return alert("Hanya Superadmin yang bisa menghapus Master Data.");
    setDeleteConfirm({ type: 'uraian', id: kode, nama });
  }

  const allBidang = dataUraian.filter(u => u.level === 1).map(u => ({
    id: u.kode,
    nama: u.uraian,
    pagu: u.target,
  }));

  const allKegiatan = dataUraian.filter(u => u.level === 2).map(u => {
    const parentKode = u.kode.split('.').slice(0, 1).join('.');
    const parentBidang = dataUraian.find(x => x.kode === parentKode);
    return {
      id: u.kode,
      nama: u.uraian,
      bidangNama: parentBidang?.uraian || '',
    };
  });

  const allSubKegiatan = dataUraian.filter(u => u.level === 3).map(u => {
    const parentKode = u.kode.split('.').slice(0, 2).join('.');
    const parentKegiatan = dataUraian.find(x => x.kode === parentKode);
    const bidangKode = u.kode.split('.')[0];
    const parentBidang = dataUraian.find(x => x.kode === bidangKode);
    return {
      id: u.kode,
      nama: u.uraian,
      kegiatanNama: parentKegiatan?.uraian || '',
      bidangNama: parentBidang?.uraian || '',
    };
  });
  const [activeTab, setActiveTab] = useState('bidang');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterBidang, setFilterBidang] = useState('semua');

  const [formNamaBidang, setFormNamaBidang] = useState('');
  const [formParentBidangKode, setFormParentBidangKode] = useState('');
  const [formParentKegiatanKode, setFormParentKegiatanKode] = useState('');
  const [formNamaKegiatan, setFormNamaKegiatan] = useState('');
  const [formNamaSubKegiatan, setFormNamaSubKegiatan] = useState('');
  const [formSumberDana, setFormSumberDana] = useState('');
  const [formAnggotaNama, setFormAnggotaNama] = useState('');
  const [formAnggotaJabatan, setFormAnggotaJabatan] = useState('');
  const [formAnggotaBidang, setFormAnggotaBidang] = useState('');

  const filteredKegiatan = filterBidang === 'semua'
    ? allKegiatan
    : allKegiatan.filter(s => s.bidangNama === filterBidang);

  const filteredSubKegiatan = filterBidang === 'semua'
    ? allSubKegiatan
    : allSubKegiatan.filter(k => k.bidangNama === filterBidang);

  const tabs = [
    { key: 'bidang', label: 'Bidang', count: allBidang.length },
    { key: 'kegiatan', label: 'Kegiatan', count: allKegiatan.length },
    { key: 'subKegiatan', label: 'Sub Kegiatan', count: allSubKegiatan.length },
    { key: 'sumberDana', label: 'Sumber Dana', count: sumberDanaList.length },
    { key: 'anggota', label: 'Anggota & Jabatan', count: anggotaList.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { title: 'TOTAL BIDANG', tabKey: 'bidang', value: allBidang.length, detail: 'Kategori utama', detailColor: 'text-blue-600', icon: Database, color: 'bg-blue-500' },
          { title: 'TOTAL KEGIATAN', tabKey: 'kegiatan', value: allKegiatan.length, detail: 'Kategori turunan', detailColor: 'text-purple-600', icon: FolderTree, color: 'bg-purple-500' },
          { title: 'SUB KEGIATAN', tabKey: 'subKegiatan', value: allSubKegiatan.length, detail: 'Kategori level 3', detailColor: 'text-indigo-600', icon: CheckSquare, color: 'bg-indigo-500' },
          { title: 'SUMBER DANA', tabKey: 'sumberDana', value: sumberDanaList.length, detail: 'Opsi pendaaan', detailColor: 'text-emerald-600', icon: FileText, color: 'bg-emerald-500' },
          { title: 'TOTAL ANGGOTA', tabKey: 'anggota', value: anggotaList.length, detail: 'Personel terdata', detailColor: 'text-amber-600', icon: Users, color: 'bg-amber-500' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} 
              onClick={() => setActiveTab(card.tabKey)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 mb-1">{card.title}</div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">{card.value}</div>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-1">Master Data</div>
              <div className={`text-xs font-medium ${card.detailColor}`}>{card.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}>
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* BIDANG tab */}
          {activeTab === 'bidang' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 w-8">No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Bidang</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Jumlah Kegiatan</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {allBidang.map((bidang, idx) => {
                    const color = getBidangColor(bidang.nama);
                    const jmlKegiatan = allKegiatan.filter(s => s.bidangNama === bidang.nama).length;
                    const jmlSubKegiatan = allSubKegiatan.filter(k => k.bidangNama === bidang.nama).length;
                    return (
                      <tr key={bidang.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${color}`}>{bidang.nama}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-700">{jmlKegiatan}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openEditUraianModal(bidang.id, bidang.nama, bidang.pagu)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteUraian(bidang.id, bidang.nama)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* KEGIATAN tab */}
          {activeTab === 'kegiatan' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <select value={filterBidang} onChange={e => setFilterBidang(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="semua">Semua Bidang</option>
                  {allBidang.map(b => <option key={b.id} value={b.nama}>{b.nama}</option>)}
                </select>
                <span className="text-sm text-gray-500">{filteredKegiatan.length} kegiatan</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 w-8">No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama Kegiatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Bidang</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKegiatan.map((sub, idx) => {
                      const color = getBidangColor(sub.bidangNama);
                      return (
                        <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-gray-800">{sub.nama}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${color}`}>{sub.bidangNama}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => openEditUraianModal(sub.id, sub.nama, 0)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteUraian(sub.id, sub.nama)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB KEGIATAN tab */}
          {activeTab === 'subKegiatan' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <select value={filterBidang} onChange={e => setFilterBidang(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="semua">Semua Bidang</option>
                  {allBidang.map(b => <option key={b.id} value={b.nama}>{b.nama}</option>)}
                </select>
                <span className="text-sm text-gray-500">{filteredSubKegiatan.length} sub kegiatan</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 w-8">No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama Sub Kegiatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Kegiatan Induk</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Bidang</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubKegiatan.map((sub, idx) => {
                      const color = getBidangColor(sub.bidangNama);
                      return (
                        <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-gray-800">{sub.nama}</td>
                          <td className="py-3 px-4 text-gray-600">{sub.kegiatanNama}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${color}`}>{sub.bidangNama}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => openEditUraianModal(sub.id, sub.nama, 0)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteUraian(sub.id, sub.nama)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUMBER DANA tab */}
          {activeTab === 'sumberDana' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-500">{sumberDanaList.length} sumber dana</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 w-8">No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Sumber Dana</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sumberDanaList.map((sd, idx) => (
                      <tr key={sd.id || sd.nama} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{sd.nama}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => {
                              if (!isSuperadmin) return alert("Hanya Superadmin yang bisa menghapus.");
                              if (confirm(`Yakin ingin menghapus sumber dana: ${sd.nama}?`)) {
                                deleteSumberDana(sd.id);
                              }
                            }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANGGOTA tab */}
          {activeTab === 'anggota' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 w-8">No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Jabatan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Bidang</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {anggotaList.map((item, idx) => {
                    const color = getBidangColor(item.bidang);
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-800">{item.nama}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.jabatan}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${color}`}>{item.bidang}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openEditAnggotaModal(item)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteAnggota(item.id, item.nama)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Tambah {activeTab === 'bidang' ? 'Bidang' : activeTab === 'kegiatan' ? 'Kegiatan' : activeTab === 'subKegiatan' ? 'Sub Kegiatan' : activeTab === 'sumberDana' ? 'Sumber Dana' : activeTab === 'anggota' ? 'Anggota' : ''}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'bidang' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Bidang <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Contoh: Bagian Keuangan..."
                    value={formNamaBidang} onChange={e => setFormNamaBidang(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              )}
              {activeTab === 'kegiatan' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidang <span className="text-red-500">*</span></label>
                    <select value={formParentBidangKode} onChange={e => setFormParentBidangKode(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Pilih Bidang</option>
                      {allBidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kegiatan <span className="text-red-500">*</span></label>
                    <input type="text" value={formNamaKegiatan} onChange={e => setFormNamaKegiatan(e.target.value)}
                      placeholder="Nama kegiatan..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </>
              )}
              {activeTab === 'subKegiatan' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidang <span className="text-red-500">*</span></label>
                    <select value={formParentBidangKode} onChange={e => {
                      setFormParentBidangKode(e.target.value);
                      setFormParentKegiatanKode('');
                    }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Pilih Bidang</option>
                      {allBidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kegiatan <span className="text-red-500">*</span></label>
                    <select value={formParentKegiatanKode} onChange={e => setFormParentKegiatanKode(e.target.value)} disabled={!formParentBidangKode}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100">
                      <option value="">Pilih Kegiatan</option>
                      {allKegiatan.filter(k => k.id.startsWith(formParentBidangKode + '.')).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Sub Kegiatan <span className="text-red-500">*</span></label>
                    <input type="text" value={formNamaSubKegiatan} onChange={e => setFormNamaSubKegiatan(e.target.value)}
                      placeholder="Nama sub kegiatan..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </>
              )}
              {activeTab === 'sumberDana' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Sumber Dana <span className="text-red-500">*</span></label>
                  <input type="text" value={formSumberDana} onChange={e => setFormSumberDana(e.target.value)}
                    placeholder="Contoh: Hibah Pusat..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              )}
              {activeTab === 'anggota' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" value={formAnggotaNama} onChange={e => setFormAnggotaNama(e.target.value)}
                      placeholder="Contoh: Budi Santoso..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jabatan <span className="text-red-500">*</span></label>
                    <input type="text" value={formAnggotaJabatan} onChange={e => setFormAnggotaJabatan(e.target.value)}
                      placeholder="Contoh: Staff Keuangan..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidang <span className="text-red-500">*</span></label>
                    <select value={formAnggotaBidang} onChange={e => setFormAnggotaBidang(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">-- Pilih Bidang --</option>
                      {allBidang.map(b => <option key={b.id} value={b.nama}>{b.nama}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button
                onClick={() => {
                  if (activeTab === 'bidang') {
                    if (!isSuperadmin) return alert('Hanya Superadmin yang bisa menambah Bidang.');
                    if (!formNamaBidang.trim()) return;
                    const maxKode = allBidang.reduce((max, b) => {
                      const num = parseInt(b.id, 10);
                      return (!isNaN(num) && num > max) ? num : max;
                    }, 0);
                    const nextKode = String(maxKode + 1);
                    addUraianBaru({ kode: nextKode, uraian: formNamaBidang.trim(), level: 1, target: 0, realisasi: 0 });
                    addActivityLog({ user: user?.nama || 'Unknown', action: 'Tambah Bidang', details: `Menambah Bidang Baru: ${formNamaBidang.trim()} (${nextKode})` });
                    setFormNamaBidang('');
                    setShowAddModal(false);
                  } else if (activeTab === 'kegiatan') {
                    if (!formParentBidangKode || !formNamaKegiatan.trim()) return;
                    const parentKode = formParentBidangKode;
                    const siblings = dataUraian.filter(u => u.kode.startsWith(parentKode + '.') && u.kode.split('.').length === parentKode.split('.').length + 1);
                    const maxKode = siblings.reduce((max, u) => {
                      const num = parseInt(u.kode.split('.').pop() || '0', 10);
                      return (!isNaN(num) && num > max) ? num : max;
                    }, 0);
                    const nextKode = `${parentKode}.${maxKode + 1}`;
                    addUraianBaru({ kode: nextKode, uraian: formNamaKegiatan.trim(), level: 2, target: 0, realisasi: 0 });
                    addActivityLog({ user: user?.nama || 'Unknown', action: 'Tambah Kegiatan', details: `Menambah: ${formNamaKegiatan.trim()} (${nextKode})` });
                    setFormNamaKegiatan('');
                    setShowAddModal(false);
                  } else if (activeTab === 'subKegiatan') {
                    if (!formParentKegiatanKode || !formNamaSubKegiatan.trim()) return;
                    const parentKode = formParentKegiatanKode;
                    const siblings = dataUraian.filter(u => u.kode.startsWith(parentKode + '.') && u.kode.split('.').length === parentKode.split('.').length + 1);
                    const maxKode = siblings.reduce((max, u) => {
                      const num = parseInt(u.kode.split('.').pop() || '0', 10);
                      return (!isNaN(num) && num > max) ? num : max;
                    }, 0);
                    const nextKode = `${parentKode}.${maxKode + 1}`;
                    addUraianBaru({ kode: nextKode, uraian: formNamaSubKegiatan.trim(), level: 3, target: 0, realisasi: 0 });
                    addActivityLog({ user: user?.nama || 'Unknown', action: 'Tambah Sub Kegiatan', details: `Menambah: ${formNamaSubKegiatan.trim()} (${nextKode})` });
                    setFormNamaSubKegiatan('');
                    setShowAddModal(false);
                  } else if (activeTab === 'sumberDana') {
                    if (!isSuperadmin) return alert('Hanya Superadmin yang bisa menambah Sumber Dana.');
                    if (!formSumberDana.trim()) return;
                    if (sumberDanaList.some(s => s.nama.toLowerCase() === formSumberDana.trim().toLowerCase())) return alert('Sumber dana ini sudah ada.');
                    
                    addSumberDana(formSumberDana.trim())
                      .then(() => {
                        setFormSumberDana('');
                        setShowAddModal(false);
                      })
                      .catch(() => alert('Gagal menambah sumber dana'));
                  } else if (activeTab === 'anggota') {
                    if (!isSuperadmin) return alert('Hanya Superadmin yang bisa menambah Anggota.');
                    if (!formAnggotaNama.trim() || !formAnggotaJabatan.trim() || !formAnggotaBidang) return alert('Semua field wajib diisi');
                    
                    const newId = Math.random().toString(36).substring(2, 9);
                    setAnggotaList(prev => [...prev, {
                      id: newId,
                      nama: formAnggotaNama.trim(),
                      jabatan: formAnggotaJabatan.trim(),
                      bidang: formAnggotaBidang
                    }]);
                    addActivityLog({ user: user?.nama || 'Unknown', action: 'Tambah Anggota', details: `Menambah anggota baru: ${formAnggotaNama.trim()}` });
                    setFormAnggotaNama('');
                    setFormAnggotaJabatan('');
                    setFormAnggotaBidang('');
                    setShowAddModal(false);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Uraian Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Edit Data Master</h2>
              <button onClick={() => setEditModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama / Uraian</label>
                <input type="text" value={editNama} onChange={e => setEditNama(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={saveEditUraian} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Anggota Modal */}
      {editAnggotaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Edit Data Anggota</h2>
              <button onClick={() => setEditAnggotaModal(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                <input type="text" value={editAnggotaNama} onChange={e => setEditAnggotaNama(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jabatan</label>
                <input type="text" value={editAnggotaJabatan} onChange={e => setEditAnggotaJabatan(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidang</label>
                <select value={editAnggotaBidang} onChange={e => setEditAnggotaBidang(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Bidang</option>
                  {allBidang.map(b => <option key={b.id} value={b.nama}>{b.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setEditAnggotaModal(null)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={saveEditAnggota} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Konfirmasi Hapus</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-1">Apakah Anda yakin ingin menghapus {deleteConfirm.type === 'anggota' ? 'anggota' : 'data'} ini:</p>
              <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {deleteConfirm.nama}
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-200">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

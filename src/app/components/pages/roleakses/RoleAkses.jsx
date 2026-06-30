import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAppData } from "../../../hooks/AppDataContext";

export function RoleAkses() {
  const { appUsers, addUser, updateUser, deleteUser, getBagianList } = useAppData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'admin',
    bidangKode: '1',
    aktif: true,
  });

  const bagianList = getBagianList();

  const handleOpenAdd = () => {
    setFormData({ nama: '', email: '', password: '', role: 'admin', bidangKode: '1', aktif: true });
    setEditingId(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({
      nama: user.nama,
      email: user.email,
      password: '',
      role: user.role,
      bidangKode: user.bidangKode || '1',
      aktif: user.aktif,
    });
    setEditingId(user.id);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      deleteUser(id);
    }
  };

  const handleSave = () => {
    if (!formData.nama || !formData.email || (!editingId && !formData.password)) return;

    if (editingId) {
      updateUser(editingId, {
        nama: formData.nama,
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        bidangKode: formData.role === 'superadmin' ? 'ALL' : formData.bidangKode,
        aktif: formData.aktif,
      });
    } else {
      addUser({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bidangKode: formData.role === 'superadmin' ? 'ALL' : formData.bidangKode,
        aktif: formData.aktif,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <button onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> Tambah Pengguna
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Daftar Pengguna Aktif</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Login</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {appUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.nama.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.nama}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'superadmin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {'-'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.role !== 'superadmin' && (
                        <button onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email / Username *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Admin Bidang</option>
                </select>
              </div>
              {formData.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bidang Terkait</label>
                  <select value={formData.bidangKode} onChange={(e) => setFormData({...formData, bidangKode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    {bagianList.map(b => (
                      <option key={b.id} value={b.id}>{b.nama}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select value={formData.aktif ? 'Aktif' : 'Nonaktif'} onChange={(e) => setFormData({...formData, aktif: e.target.value === 'Aktif'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                Batal
              </button>
              <button onClick={handleSave}
                disabled={!formData.nama || !formData.email || (!editingId && !formData.password)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

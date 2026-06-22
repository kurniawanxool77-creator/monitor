import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Briefcase, Hash, Save, Shield, Camera, Trash2 } from 'lucide-react';
import { useAppData } from '../../hooks/AppDataContext';

export function PengaturanAkun() {
  const [user, setUser] = useState<any>(null);
  const { addActivityLog, getBagianList } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bagianList = getBagianList();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = { ...user, avatar: base64String };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('user-updated'));
        
        addActivityLog({
          user: updatedUser.nama,
          action: 'Update Foto Profil',
          details: 'Pengguna memperbarui foto profil'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = () => {
    const updatedUser = { ...user };
    delete updatedUser.avatar;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event('user-updated'));
    
    addActivityLog({
      user: updatedUser.nama,
      action: 'Hapus Foto Profil',
      details: 'Pengguna menghapus foto profil'
    });
  };

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      setUser(userData);
      
      let jabatanVal = 'Administrator';
      if (userData.role === 'superadmin') {
        jabatanVal = 'Administrator Utama';
      } else {
        const bidang = bagianList.find(b => b.id === userData.bidangKode);
        jabatanVal = bidang ? `Admin ${bidang.nama}` : 'Admin Bidang';
      }

      setFormData({
        nama: userData.nama || '',
        email: userData.email || '',
        nip: '-',
        jabatan: jabatanVal
      });
    }
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '', email: '', nip: '', jabatan: ''
  });

  const handleSaveProfile = () => {
    const updatedUser = { ...user, nama: formData.nama, email: formData.email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    
    window.dispatchEvent(new Event('user-updated'));
    
    addActivityLog({
      user: updatedUser.nama,
      action: 'Update Profil Akun',
      details: 'Pengguna memperbarui informasi profil pribadinya'
    });
    alert("Profil berhasil diperbarui!");
  };

  const handleSavePassword = () => {
    addActivityLog({
      user: user.nama,
      action: 'Update Keamanan',
      details: 'Pengguna mengubah password akun'
    });
    alert("Password berhasil diperbarui!");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 text-center">
            <div className="relative inline-block mb-3">
              <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 overflow-hidden shadow-inner cursor-pointer hover:opacity-80 transition-opacity" onClick={handleUploadClick}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            
            <div className="mb-4 flex items-center justify-center gap-2">
              <button onClick={handleUploadClick} className="text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all font-medium flex items-center justify-center gap-2 shadow-sm">
                <Camera className="w-4 h-4" /> Ubah Foto
              </button>
              {user.avatar && (
                <button onClick={handleDeletePhoto} className="text-sm bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-medium flex items-center justify-center shadow-sm" title="Hapus Foto">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{user.nama}</h2>
            <p className="text-sm text-blue-600 font-medium mt-1 uppercase">{user.role}</p>
          </div>
          <div className="border-t border-gray-100 px-6 py-4 bg-slate-50">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Akun terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {isEditing ? 'Batal' : 'Edit Profil'}
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.nip}
                      onChange={(e) => setFormData({...formData, nip: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.jabatan}
                      onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Ubah Password</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password saat ini"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password baru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ulangi password baru"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button onClick={handleSavePassword} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Perbarui Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

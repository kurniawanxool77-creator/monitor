import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import logoJateng from '../../../imports/logo_jateng.png';
import { useAppData } from '../../hooks/AppDataContext';

export function Login() {
  const navigate = useNavigate();
  const { appUsers, updateUser } = useAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi kredensial
    if (!email || !password) {
      setError('Username/Email dan Password wajib diisi');
      return;
    }

    const user = appUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.status !== 'Aktif') {
        setError('Akun Anda dinonaktifkan.');
        return;
      }

      updateUser(user.id, { lastLogin: new Date().toISOString() });
      
      // Simpan session (mock)
      localStorage.setItem('user', JSON.stringify({ 
        email: user.email, 
        role: user.role,
        nama: user.nama,
        bidangKode: user.bidangKode
      }));
      
      // trigger event to notify layout
      window.dispatchEvent(new Event('user-updated'));
      navigate('/');
    } else {
      setError('Email atau Password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden relative z-10">
        
        {/* Right Side: Form (Now full width) */}
        <div className="w-full p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center">
            <div className="w-20 h-24 mx-auto mb-6 flex items-center justify-center">
              <img src={logoJateng} alt="Logo Jawa Tengah" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Masuk ke Sistem</h2>
            <p className="text-sm text-gray-500 font-medium">Silakan masukkan kredensial Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Username / Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                placeholder="Masukkan username atau email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                placeholder="Masukkan password"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 block text-sm font-semibold text-gray-600 cursor-pointer">
                  Ingat saya
                </label>
              </div>
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                Lupa Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5" />
              Masuk Sekarang
            </button>
          </form>
          
          <div className="mt-8 text-center space-y-1">
            <p className="text-xs text-gray-400">
              Gunakan akun admin@dprd.go.id / admin untuk akses pertama kali.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-center w-full text-gray-400 text-xs font-medium px-4">
        © 2025 Sekretariat DPRD Provinsi Jawa Tengah • Dashboard Monitoring & Pelaporan
      </div>
    </div>
  );
}

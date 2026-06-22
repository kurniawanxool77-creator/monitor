import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { uraianAnggaran, UraianAnggaran, SubKegiatan, Bagian } from '../lib/data';

// Key for local storage
const STORAGE_KEY = 'master_uraian_anggaran_v5';
const KEGIATAN_META_KEY = 'kegiatan_metadata_v4';

export interface SubKegiatanMeta {
  id: string;
  penanggungJawab: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  steps: { id: string; nama: string; selesai: boolean; catatan?: string }[];
  isApproved?: boolean;
  sumberDana?: string;
  anggaranDiminta?: number;
  createdByRole?: 'superadmin' | 'admin';
  isWadah?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface AppUser {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'admin';
  bidangKode: string;
  status: 'Aktif' | 'Nonaktif';
  lastLogin: string;
}

interface AppDataContextValue {
  isLoaded: boolean;
  dataUraian: UraianAnggaran[];
  allDataUraian: UraianAnggaran[];
  subKegiatanMeta: SubKegiatanMeta[];
  activityLogs: ActivityLog[];
  appUsers: AppUser[];
  getBagianList: () => Bagian[];
  getSubKegiatanList: () => SubKegiatan[];
  getAgendaHariIni: () => any[];
  addUraianBaru: (uraian: UraianAnggaran) => void;
  updateUraian: (kode: string, updates: Partial<UraianAnggaran>) => void;
  deleteUraian: (kode: string) => void;
  deleteSubKegiatan: (id: string) => void;
  deleteSubKegiatanMetadata: (id: string) => void;
  addRealisasi: (kode: string, jumlah: number) => void;
  setRealisasiToTarget: (kode: string) => void;
  updateSubKegiatanMetadata: (meta: SubKegiatanMeta) => void;
  approveSubKegiatan: (id: string, userName: string) => void;
  duplicateSubKegiatan: (kode: string, newStart: string, newEnd: string) => string | null;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  addUser: (user: AppUser) => void;
  updateUser: (id: string, updatedData: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  user: AppUser | null;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [allDataUraian, setAllDataUraian] = useState<UraianAnggaran[]>([]);
  const [subKegiatanMeta, setSubKegiatanMeta] = useState<SubKegiatanMeta[]>([]);
  const [allActivityLogs, setAllActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage or Fallback to data.ts
  useEffect(() => {
    const savedUraian = localStorage.getItem(STORAGE_KEY);
    if (savedUraian) {
      try { setAllDataUraian(JSON.parse(savedUraian)); }
      catch (e) { setAllDataUraian([...uraianAnggaran]); }
    } else {
      setAllDataUraian([...uraianAnggaran]);
    }

    const savedMeta = localStorage.getItem(KEGIATAN_META_KEY);
    if (savedMeta) {
      try {
        let parsed = JSON.parse(savedMeta);
        // Force 'Verifikasi Dokumen' step for legacy metadata
        parsed = parsed.map((m: any) => {
          if (!m.isWadah && m.steps && m.steps.length > 0) {
            const hasVerifikasi = m.steps.some((s: any) => s.nama.toLowerCase().includes('verifikasi dokumen'));
            if (!hasVerifikasi) {
              m.steps.push({
                id: `step-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                nama: 'Verifikasi Dokumen',
                selesai: false
              });
            }
          }
          return m;
        });
        setSubKegiatanMeta(parsed);
      } catch (e) { }
    }

    const savedLogs = localStorage.getItem('activity_logs');
    if (savedLogs) {
      try { setAllActivityLogs(JSON.parse(savedLogs)); } catch (e) { }
    } else {
      setAllActivityLogs([
        { id: '1', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Administrator Utama', action: 'Memperbarui Progress', details: 'Memperbarui tahapan Persiapan untuk Dokumen Perencanaan' },
        { id: '2', timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'Administrator Utama', action: 'Menambahkan Kegiatan', details: 'Kegiatan baru: Evaluasi Kinerja Perangkat Daerah' }
      ]);
    }

    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      try { setAppUsers(JSON.parse(savedUsers)); } catch (e) { }
    } else {
      setAppUsers([{
        id: '1',
        nama: 'Administrator Utama',
        email: 'admin@dprd.go.id',
        password: 'admin',
        role: 'superadmin',
        bidangKode: 'ALL',
        status: 'Aktif',
        lastLogin: new Date().toISOString(),
      }]);
    }

    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDataUraian));
      localStorage.setItem(KEGIATAN_META_KEY, JSON.stringify(subKegiatanMeta));
      localStorage.setItem('activity_logs', JSON.stringify(allActivityLogs));
      localStorage.setItem('app_users', JSON.stringify(appUsers));
    }
  }, [allDataUraian, subKegiatanMeta, allActivityLogs, appUsers, isLoaded]);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) as AppUser : null;

  // Realisasi = COMPUTED sum dari realization children
  // Leaf node = use stored realization value
  // Parent node = sum dari children's realization
  const dataUraian = useMemo(() => {
    const computed = [...allDataUraian].map(u => ({ ...u })).sort((a, b) => {
      const partsA = a.kode.split('.').map(Number);
      const partsB = b.kode.split('.').map(Number);
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const valA = partsA[i] || 0;
        const valB = partsB[i] || 0;
        if (valA !== valB) return valA - valB;
      }
      return 0;
    });

    // Sort by level descending (4 to 1) for bottom-up
    const sorted = [...computed].sort((a, b) => b.level - a.level);

    // Bottom-up: reset parent nodes, keep leaf values
    sorted.forEach(u => {
      // Check if this node has children (is NOT a leaf)
      const hasChildren = computed.some(child =>
        child.kode.startsWith(u.kode + '.') &&
        child.level === u.level + 1
      );

      const meta = subKegiatanMeta.find(m => m.id === u.kode);
      const isWadah = meta ? meta.isWadah : false;

      // Node Container: Bidang (Level 1) atau secara eksplisit diset isWadah (Agenda Induk)
      // Jika user memilih "Kegiatan" (isWadah=false), tetap simpan realisasi meskipun punya anak di hierarchy
      if (u.level === 1 || isWadah) {
        u.realisasi = 0;
      }
    });

    // Now accumulate from leaves up
    sorted.forEach(u => {
      // Find parent and add this node's realization to it
      const parts = u.kode.split('.');
      if (parts.length > 1) {
        const parentKode = parts.slice(0, -1).join('.');
        const parent = computed.find(p => p.kode === parentKode);
        if (parent) {
          parent.realisasi += u.realisasi;
        }
      }
    });

    if (!user || user.role === 'superadmin' || !user.bidangKode || user.bidangKode === 'ALL') {
      return computed;
    }
    return computed.filter(u => u.kode === user.bidangKode || u.kode.startsWith(user.bidangKode + '.'));
  }, [allDataUraian, subKegiatanMeta, user?.bidangKode]);

  const activityLogs = useMemo(() => {
    if (!user || user.role === 'superadmin') return allActivityLogs;
    return allActivityLogs.filter(log =>
      log.user === user.nama || log.details?.toLowerCase().includes(user.bidangKode)
    );
  }, [allActivityLogs, user?.nama]);

  const getBagianList = (): Bagian[] => {
    return dataUraian
      .filter(u => u.level === 1)
      .map((u) => {
        const childrenMeta = subKegiatanMeta.filter(m => m.id.startsWith(u.kode + '.') && !m.isWadah);
        let totalProgress = 0;
        let validChildren = 0;
        childrenMeta.forEach(meta => {
           const steps = meta.steps || [];
           if (steps.length > 0) {
             const doneCount = steps.filter(s => s.selesai).length;
             // Hanya kalkulasi dari Kegiatan Berjalan (belum selesai 100%)
             if (doneCount < steps.length) {
               totalProgress += Math.round((doneCount / steps.length) * 100);
               validChildren++;
             }
           }
        });
        const progress = validChildren > 0 ? Math.round(totalProgress / validChildren) : 0;

        let color = 'bg-gray-500';
        if (u.uraian.includes('Sekretariat')) color = 'bg-blue-500';
        if (u.uraian.includes('Umum')) color = 'bg-emerald-500';
        if (u.uraian.includes('Humas')) color = 'bg-orange-500';
        if (u.uraian.includes('Persidangan')) color = 'bg-purple-500';
        return { id: u.kode, nama: u.uraian, progress, warna: color };
      });
  };

  const getSubKegiatanList = (): SubKegiatan[] => {
    // Tampilkan semua node yang memiliki metadata (baik Agenda Induk maupun Kegiatan Riil)
    return dataUraian
      .filter(u => subKegiatanMeta.some(m => m.id === u.kode))
      .map((u) => {
        const parts = u.kode.split('.');
        const bidangKode = parts[0];
        const subBidangKode = parts.slice(0, 2).join('.');

        const parentBidang = dataUraian.find(x => x.kode === bidangKode);
        const parentSubBidang = dataUraian.find(x => x.kode === subBidangKode);

        const meta = subKegiatanMeta.find(m => m.id === u.kode);

        // Tanggal dari metadata user, tidak ada dummy hardcoded
        const currentYear = new Date().getFullYear();
        const defaultStart = `${currentYear}-01-01`;
        const defaultEnd = `${currentYear}-12-31`;

        const defaultSteps = [
          { id: `s${u.kode}-1`, nama: 'Persiapan Dokumen', selesai: false },
          { id: `s${u.kode}-2`, nama: 'Pelaksanaan', selesai: false },
          { id: `s${u.kode}-3`, nama: 'Evaluasi', selesai: false },
          { id: `s${u.kode}-4`, nama: 'Verifikasi Dokumen', selesai: false },
        ];

        const steps = meta?.steps && meta.steps.length > 0 ? meta.steps : defaultSteps;

        // Container (Agenda Induk) = Level 1 SELALU wadah.
        // Untuk level lain, gunakan setting eksplisit dari metadata user.
        // Jika user memilih "Kegiatan" (isWadah=false), hormati pilihan tersebut
        // meskipun node memiliki anak di uraian hierarchy.
        const isInduk = u.level === 1 || (meta?.isWadah === true);

        let progress: number;
        if (isInduk) {
          // Progress Agenda Induk: Dihitung menggunakan bobot pagu. Σ(Progress Anak × Pagu Anak) / Σ(Pagu Anak)
          // Cari semua leaf descendants
          const leafDescendants = dataUraian.filter(desc => 
            desc.kode.startsWith(u.kode + '.') && 
            !dataUraian.some(child => child.kode.startsWith(desc.kode + '.') && child.kode.split('.').length === desc.kode.split('.').length + 1) &&
            (!subKegiatanMeta.find(m => m.id === desc.kode)?.isWadah)
          );

          if (leafDescendants.length === 0) {
            progress = 0;
          } else {
            let sumPagu = 0;
            let sumWeightedProgress = 0;
            
            leafDescendants.forEach(leaf => {
              const leafMeta = subKegiatanMeta.find(m => m.id === leaf.kode);
              const leafSteps = leafMeta?.steps && leafMeta.steps.length > 0 ? leafMeta.steps : defaultSteps;
              const leafDone = leafSteps.filter(s => s.selesai).length;
              const leafProgress = leafSteps.length > 0 ? (leafDone / leafSteps.length) * 100 : 0;
              
              sumPagu += leaf.target;
              sumWeightedProgress += (leafProgress * leaf.target);
            });

            progress = sumPagu > 0 ? Math.round(sumWeightedProgress / sumPagu) : 0;
          }
        } else {
          // Kegiatan riil: progress dari tahapan/steps sendiri
          const doneSteps = steps.filter(s => s.selesai).length;
          progress = steps.length > 0 ? Math.round((doneSteps / steps.length) * 100) : 0;
        }


        const createdByAdmin = meta?.createdByRole === 'admin';
        const isApproved = createdByAdmin ? (meta?.isApproved ?? false) : true;

        const now = new Date();
        const start = new Date(meta?.tanggalMulai || defaultStart);
        const end = new Date(meta?.tanggalSelesai || defaultEnd);
        const endWarning = new Date(end);
        endWarning.setDate(endWarning.getDate() - 3);

        let status: 'Belum Mulai' | 'Berjalan' | 'Selesai' | 'Terlambat' = 'Belum Mulai';
        const nowMs = now.setHours(0,0,0,0);
        const endMs = end.setHours(0,0,0,0);
        if (progress >= 100) status = 'Selesai';
        else if (nowMs > endMs) status = 'Terlambat';
        else if (progress > 0 || now >= start) status = 'Berjalan';

        const step: 'Persiapan' | 'Pelaksanaan' | 'Closed' = progress >= 100 ? 'Closed' : progress >= 50 ? 'Pelaksanaan' : 'Persiapan';

        return {
          id: u.kode,
          nama: u.uraian,
          bidang: parentBidang?.uraian || 'Unknown',
          kegiatan_parent: parentSubBidang?.uraian || 'Unknown',
          subKegiatan_parent: parentSubBidang?.uraian || 'Unknown',
          penanggungJawab: meta?.penanggungJawab || 'Belum Ada PJ',
          tanggalMulai: meta?.tanggalMulai || defaultStart,
          tanggalSelesai: meta?.tanggalSelesai || defaultEnd,
          status,
          progress,
          paguAnggaran: u.target,
          realisasiAnggaran: u.realisasi,
          deskripsi: meta?.deskripsi || `Pelaksanaan kegiatan ${u.uraian}`,
          step,
          steps,
          isApproved,
          sumberDana: meta?.sumberDana || 'Belum ditentukan',
          anggaranDiminta: meta?.anggaranDiminta || 0,
          isWadah: isInduk || false,
        };
      });
  };

  const getAgendaHariIni = () => {
    return getSubKegiatanList().slice(0, 4).map((k, i) => ({
      id: k.id,
      waktu: `${9 + i}:00`,
      status: i < 2 ? 'berlangsung' as const : 'terjadwal' as const,
      nama: k.nama,
      lokasi: 'Ruang Rapat',
    }));
  };

  const addUraianBaru = (newUraian: UraianAnggaran) => {
    setAllDataUraian(prev => {
      if (prev.some(u => u.kode === newUraian.kode)) return prev;
      return [...prev, newUraian];
    });
  };

  const updateUraian = (kode: string, updates: Partial<UraianAnggaran>) => {
    setAllDataUraian(prev => prev.map(u => u.kode === kode ? { ...u, ...updates } : u));
  };

  const deleteUraian = (kode: string) => {
    setAllDataUraian(prev => prev.filter(u => u.kode !== kode && !u.kode.startsWith(kode + '.')));
    setSubKegiatanMeta(prev => prev.filter(m => m.id !== kode && !m.id.startsWith(kode + '.')));
  };

  const duplicateSubKegiatan = (kode: string, newStart: string, newEnd: string) => {
    const node = allDataUraian.find(u => u.kode === kode);
    if (!node) return null;

    const parts = kode.split('.');
    const parentKode = parts.slice(0, -1).join('.');
    const siblings = allDataUraian.filter(u => {
      const p = u.kode.split('.');
      p.pop();
      return p.join('.') === parentKode;
    });
    
    let maxNum = 0;
    siblings.forEach(s => {
      const p = s.kode.split('.');
      const num = parseInt(p[p.length - 1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    });
    
    const newKode = parentKode ? `${parentKode}.${maxNum + 1}` : `${maxNum + 1}`;

    const newUraian = {
      ...node,
      kode: newKode,
      realisasi: 0
    };

    setAllDataUraian(prev => [...prev, newUraian]);

    const meta = subKegiatanMeta.find(m => m.id === kode);
    if (meta) {
      const newMeta = {
        ...meta,
        id: newKode,
        tanggalMulai: newStart,
        tanggalSelesai: newEnd,
        steps: meta.steps.map(s => ({ ...s, selesai: false, catatan: undefined })),
        isApproved: false
      };
      setSubKegiatanMeta(prev => [...prev, newMeta]);
    }

    addActivityLog({ user: user?.nama || 'Unknown', action: 'Duplikat Kegiatan', details: `Menduplikasi kegiatan ${node.uraian} (${kode}) untuk tanggal baru` });
    return newKode;
  };

  const deleteSubKegiatan = (id: string) => {
    setSubKegiatanMeta(prev => prev.filter(m => m.id !== id && !m.id.startsWith(id + '.')));
    setAllDataUraian(prev => prev.map(u => {
      if (u.kode === id || u.kode.startsWith(id + '.')) {
        return { ...u, target: 0, realisasi: 0 };
      }
      return u;
    }));
  };

  const deleteSubKegiatanMetadata = (id: string) => {
    setSubKegiatanMeta(prev => prev.filter(m => m.id !== id));
  };

  const addRealisasi = (kode: string, jumlah: number) => {
    // Tambahkan realisasi ke node dengan kode tertentu.
    // Propagasi ke parent dilakukan otomatis via useMemo dataUraian.
    setAllDataUraian(prev => prev.map(u =>
      u.kode === kode ? { ...u, realisasi: u.realisasi + jumlah } : u
    ));
  };

  const setRealisasiToTarget = (kode: string) => {
    // Set realisasi = target untuk node dengan kode tertentu (tandai selesai).
    setAllDataUraian(prev => prev.map(u =>
      u.kode === kode ? { ...u, realisasi: u.target } : u
    ));
  };

  const updateSubKegiatanMetadata = (meta: SubKegiatanMeta) => {
    setSubKegiatanMeta(prev => {
      const idx = prev.findIndex(m => m.id === meta.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = meta;
        return next;
      }
      return [...prev, meta];
    });
  };

  const approveSubKegiatan = (id: string, userName: string) => {
    setSubKegiatanMeta(prev => {
      const idx = prev.findIndex(m => m.id === id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isApproved: true };
        return next;
      }
      return prev;
    });
    addActivityLog({ user: userName, action: 'Menyetujui Kegiatan', details: `Kegiatan ${id} disetujui` });
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    setAllActivityLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toISOString(), ...log },
      ...prev,
    ]);
  };

  const addUser = (newUser: AppUser) => {
    setAppUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updatedData: Partial<AppUser>) => {
    setAppUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const deleteUser = (id: string) => {
    setAppUsers(prev => prev.filter(u => u.id !== id));
  };

  const value: AppDataContextValue = {
    isLoaded, dataUraian, allDataUraian, subKegiatanMeta, activityLogs, appUsers,
    getBagianList, getSubKegiatanList, getAgendaHariIni,
    addUraianBaru, updateUraian, deleteUraian,
    deleteSubKegiatan,
    deleteSubKegiatanMetadata,
    addRealisasi,
    setRealisasiToTarget,
    updateSubKegiatanMetadata,
    approveSubKegiatan,
    duplicateSubKegiatan,
    addActivityLog, addUser, updateUser, deleteUser,
    user,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

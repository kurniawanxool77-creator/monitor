import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { uraianAnggaran } from '../lib/data';
// Key for local storage
const STORAGE_KEY = 'master_uraian_anggaran_v5';
const KEGIATAN_META_KEY = 'kegiatan_metadata_v4';

export const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [appUsers, setAppUsers] = useState([]);
  const [allDataUraian, setAllDataUraian] = useState([]);
  const [subKegiatanMeta, setSubKegiatanMeta] = useState([]);
  const [allActivityLogs, setAllActivityLogs] = useState([]);
  const [sumberDanaList, setSumberDanaList] = useState([]);
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

    const generateDummyMeta = () => {
      const defaultMeta = [];
      const currentYear = new Date().getFullYear();
      const pjNames = ['Drs. Bambang Setiawan, M.Si', 'Hj. Sri Wahyuni, S.H', 'Ir. Eko Nugroho, M.T', 'Dra. Endah Kusumastuti', 'Ahmad Fauzi, S.E', 'Yuliana Dewi, A.Md'];
      const sumberDanas = ['APBD Provinsi', 'Dana Alokasi Umum (DAU)', 'Dana Bagi Hasil (DBH)'];

      uraianAnggaran.forEach((u, i) => {
        if (u.level === 2) {
          const progressSeed = Math.random();
          let doneCount = 0;
          if (progressSeed > 0.7) doneCount = 4;
          else if (progressSeed > 0.3) doneCount = Math.floor(Math.random() * 3) + 1;
          
          const steps = [
            { id: `s${u.kode}-1`, nama: 'Persiapan Dokumen', selesai: doneCount >= 1 },
            { id: `s${u.kode}-2`, nama: 'Pelaksanaan', selesai: doneCount >= 2 },
            { id: `s${u.kode}-3`, nama: 'Evaluasi', selesai: doneCount >= 3 },
            { id: `s${u.kode}-4`, nama: 'Verifikasi Dokumen', selesai: doneCount >= 4 },
          ];

          const startMonth = Math.floor(Math.random() * 12);
          const endMonth = Math.min(11, startMonth + Math.floor(Math.random() * 3));
          
          defaultMeta.push({
            id: u.kode,
            penanggungJawab: pjNames[i % pjNames.length],
            tanggalMulai: `${currentYear}-${String(startMonth + 1).padStart(2, '0')}-01T00:00:00.000Z`,
            tanggalSelesai: `${currentYear}-${String(endMonth + 1).padStart(2, '0')}-28T00:00:00.000Z`,
            deskripsi: `Pelaksanaan ${u.uraian} sesuai DPA tahun berjalan.`,
            steps,
            isWadah: false,
            isApproved: true,
            sumberDana: sumberDanas[i % sumberDanas.length],
            anggaranDiminta: u.target > 0 ? u.target : 10000000
          });
        }
      });
      return defaultMeta;
    };

    const savedMeta = localStorage.getItem(KEGIATAN_META_KEY);
    if (savedMeta) {
      try {
        let parsed = JSON.parse(savedMeta);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          parsed = generateDummyMeta();
        } else {
          parsed = parsed.map((m) => {
            if (!m.isWadah && m.steps && m.steps.length > 0) {
              const hasVerifikasi = m.steps.some((s) => s.nama.toLowerCase().includes('verifikasi dokumen'));
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
        }
        setSubKegiatanMeta(parsed);
      } catch (e) {
        setSubKegiatanMeta(generateDummyMeta());
      }
    } else {
      setSubKegiatanMeta(generateDummyMeta());
    }

    const defaultLogs = [
      { id: '1', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Administrator Utama', action: 'Memperbarui Progress', details: 'Memperbarui tahapan Persiapan untuk Dokumen Perencanaan' },
      { id: '2', timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'Administrator Utama', action: 'Menambahkan Kegiatan', details: 'Kegiatan baru: Evaluasi Kinerja Perangkat Daerah' }
    ];

    const savedLogs = localStorage.getItem('activity_logs');
    if (savedLogs) {
      try { 
        const parsed = JSON.parse(savedLogs);
        if (!Array.isArray(parsed) || parsed.length === 0) setAllActivityLogs(defaultLogs);
        else setAllActivityLogs(parsed);
      } catch (e) { setAllActivityLogs(defaultLogs); }
    } else {
      setAllActivityLogs(defaultLogs);
    }

    const defaultUsers = [{
      id: '1',
      nama: 'Administrator Utama',
      email: 'admin@dprd.go.id',
      password: 'admin',
      role: 'superadmin',
      bidangKode: 'ALL',
      status: 'Aktif',
      lastLogin: new Date().toISOString(),
    }];

    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      try { 
        const parsed = JSON.parse(savedUsers);
        if (!Array.isArray(parsed) || parsed.length === 0) setAppUsers(defaultUsers);
        else setAppUsers(parsed);
      } catch (e) { setAppUsers(defaultUsers); }
    } else {
      setAppUsers(defaultUsers);
    }

    const defaultSumberDana = [
      'APBD Provinsi',
      'APBD Kabupaten/Kota',
      'APBN',
      'Dana Alokasi Khusus (DAK)',
      'Dana Alokasi Umum (DAU)',
      'Dana Bagi Hasil (DBH)',
      'Dana Insentif Daerah (DID)',
      'Hibah'
    ];
    const savedSumberDana = localStorage.getItem('sumber_dana_v1');
    if (savedSumberDana) {
      try {
        const parsed = JSON.parse(savedSumberDana);
        if (!Array.isArray(parsed) || parsed.length === 0) setSumberDanaList(defaultSumberDana);
        else setSumberDanaList(parsed);
      } catch (e) { setSumberDanaList(defaultSumberDana); }
    } else {
      setSumberDanaList(defaultSumberDana);
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
      localStorage.setItem('sumber_dana_v1', JSON.stringify(sumberDanaList));
    }
  }, [allDataUraian, subKegiatanMeta, allActivityLogs, appUsers, sumberDanaList, isLoaded]);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Realisasi = COMPUTED sum dari realisasi children
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
      const hasChildren = computed.some(child =>
        child.kode.startsWith(u.kode + '.') &&
        child.level === u.level + 1
      );

      const meta = subKegiatanMeta.find(m => m.id === u.kode);
      const isWadah = meta ? meta.isWadah : false;

      if (u.level === 1 || isWadah) {
        u.realisasi = 0;
      }
    });

    // Now accumulate from leaves up
    sorted.forEach(u => {
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

  const getBagianList = () => {
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

  const getSubKegiatanList = () => {
    return dataUraian
      .filter(u => subKegiatanMeta.some(m => m.id === u.kode))
      .map((u) => {
        const parts = u.kode.split('.');
        const bidangKode = parts[0];
        const subBidangKode = parts.slice(0, 2).join('.');

        const parentBidang = dataUraian.find(x => x.kode === bidangKode);
        const parentSubBidang = dataUraian.find(x => x.kode === subBidangKode);

        const meta = subKegiatanMeta.find(m => m.id === u.kode);

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

        const isInduk = u.level === 1 || (meta?.isWadah === true);

        let progress;
        if (isInduk) {
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
              const leafProg = leafSteps.length > 0 ? (leafDone / leafSteps.length) * 100 : 0;

              sumPagu += leaf.target;
              sumWeightedProgress += (leafProg * leaf.target);
            });

            progress = sumPagu > 0 ? Math.round(sumWeightedProgress / sumPagu) : 0;
          }
        } else {
          const doneSteps = steps.filter(s => s.selesai).length;
          progress = steps.length > 0 ? Math.round((doneSteps / steps.length) * 100) : 0;
        }

        const createdByAdmin = meta?.createdByRole === 'admin';
        const isApproved = createdByAdmin ? (meta?.isApproved ?? false) : true;

        const now = new Date();
        const start = new Date(meta?.tanggalMulai || defaultStart);
        const end = new Date(meta?.tanggalSelesai || defaultEnd);

        let status = 'Belum Mulai';
        const nowMs = now.setHours(0,0,0,0);
        const endMs = end.setHours(0,0,0,0);
        if (progress >= 100) status = 'Selesai';
        else if (nowMs > endMs) status = 'Terlambat';
        else if (progress > 0 || now >= start) status = 'Berjalan';

        const step = progress >= 100 ? 'Closed' : progress >= 50 ? 'Pelaksanaan' : 'Persiapan';

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
          realized: u.realisasi,
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
      status: i < 2 ? 'berlangsung' : 'terjadwal',
      nama: k.nama,
      lokasi: 'Ruang Rapat',
    }));
  };

  const addUraianBaru = (newUraian) => {
    setAllDataUraian(prev => {
      if (prev.some(u => u.kode === newUraian.kode)) return prev;
      return [...prev, newUraian];
    });
  };

  const updateUraian = (kode, updates) => {
    setAllDataUraian(prev => prev.map(u => u.kode === kode ? { ...u, ...updates } : u));
  };

  const deleteUraian = (kode) => {
    setAllDataUraian(prev => prev.filter(u => u.kode !== kode && !u.kode.startsWith(kode + '.')));
    setSubKegiatanMeta(prev => prev.filter(m => m.id !== kode && !m.id.startsWith(kode + '.')));
  };

  const duplicateSubKegiatan = (kode, newStart, newEnd) => {
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
      realized: 0
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

  const deleteSubKegiatan = (id) => {
    setSubKegiatanMeta(prev => prev.filter(m => m.id !== id && !m.id.startsWith(id + '.')));
    setAllDataUraian(prev => prev.map(u => {
      if (u.kode === id || u.kode.startsWith(id + '.')) {
        return { ...u, target: 0, realized: 0 };
      }
      return u;
    }));
  };

  const deleteSubKegiatanMetadata = (id) => {
    setSubKegiatanMeta(prev => prev.filter(m => m.id !== id));
  };

  const addRealisasi = (kode, jumlah) => {
    setAllDataUraian(prev => prev.map(u =>
      u.kode === kode ? { ...u, realized: u.realized + jumlah } : u
    ));
  };

  const setRealisasiToTarget = (kode) => {
    setAllDataUraian(prev => prev.map(u =>
      u.kode === kode ? { ...u, realized: u.target } : u
    ));
  };

  const updateSubKegiatanMetadata = (meta) => {
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

  const approveSubKegiatan = (id, userName) => {
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

  const addActivityLog = (log) => {
    setAllActivityLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toISOString(), ...log },
      ...prev,
    ]);
  };

  const addUser = (newUser) => {
    setAppUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id, updatedData) => {
    setAppUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const deleteUser = (id) => {
    setAppUsers(prev => prev.filter(u => u.id !== id));
  };

  const value = {
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
    getAppUsers,
    sumberDanaList,
    setSumberDanaList,
    user,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

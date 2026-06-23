import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { uraianAnggaran, subKegiatanList, sumberDanaList as mockSumberDana } from '../lib/data';
import { api, sumberDanaApi, userApi, API_URL } from '../lib/api';
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
  // paguSumberDana: { [tahun]: { [sumberDanaId]: jumlahPagu } }
  const [paguSumberDana, setPaguSumberDana] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoaded(true);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        const [uraianRes, subKegiatanRes, logsRes, sumberDanaRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/kegiatan/uraian`, { headers }),
          fetch(`${API_URL}/kegiatan/sub-kegiatan`, { headers }),
          fetch(`${API_URL}/kegiatan/activity-logs`, { headers }),
          fetch(`${API_URL}/admin/sumber-dana`, { headers }),
          fetch(`${API_URL}/admin/users`, { headers })
        ]);

        if (uraianRes.ok) {
          const uraianData = (await uraianRes.json()).data;
          setAllDataUraian(uraianData.map(u => ({
            kode: u.kode,
            uraian: u.nama,
            level: u.level,
            target: u.pagu,
            realized: 0,
            id: u.id
          })));
        }

        if (subKegiatanRes.ok) {
          const skData = (await subKegiatanRes.json()).data;
          setSubKegiatanMeta(skData.map(sk => ({
            id: sk.uraian.kode,
            realId: sk.id,
            penanggungJawab: sk.penanggungJawab,
            tanggalMulai: sk.tanggalMulai,
            tanggalSelesai: sk.tanggalSelesai,
            deskripsi: `Pelaksanaan ${sk.nama}`,
            steps: sk.steps.map(s => ({
              id: s.id,
              nama: s.nama,
              selesai: s.completed,
              urutan: s.urutan
            })),
            isWadah: sk.isWadah,
            isApproved: sk.status !== 'PERSIAPAN',
            sumberDana: sk.sumberDana || 'Belum ditentukan',
            anggaranDiminta: sk.anggaranSubKegiatan
          })));
        }

        if (logsRes.ok) {
          const logsData = (await logsRes.json()).data;
          setAllActivityLogs(logsData.map(l => ({
            id: l.id,
            timestamp: l.createdAt,
            user: l.user.nama,
            action: l.action,
            details: l.details
          })));
        }

        // Load SumberDana from backend
        if (sumberDanaRes.ok) {
          const sdData = (await sumberDanaRes.json()).data;
          setSumberDanaList(sdData.map(sd => ({
            id: sd.id,
            nama: sd.nama,
            aktif: sd.aktif
          })));
        }

        // Load AppUsers from backend
        if (usersRes.ok) {
          const usersData = (await usersRes.json()).data;
          setAppUsers(usersData.map(u => ({
            id: u.id,
            email: u.email,
            nama: u.nama,
            role: u.role.toLowerCase(),
            aktif: u.aktif,
            bidangKode: u.bidangKode
          })));
        }

      } catch (error) {
        console.error('Error fetching data, using mock/offline fallback:', error);
        
        // Fallback to mock data from data.js
        setAllDataUraian(uraianAnggaran.map(u => ({
          kode: u.kode,
          uraian: u.uraian,
          level: u.level,
          target: u.target || 0,
          realized: u.realisasi || 0,
          id: `mock-${u.kode}`
        })));

        setSubKegiatanMeta(subKegiatanList.map(sk => ({
          id: sk.id,
          realId: `mock-sk-${sk.id}`,
          penanggungJawab: sk.penanggungJawab,
          tanggalMulai: sk.tanggalMulai,
          tanggalSelesai: sk.tanggalSelesai,
          deskripsi: sk.deskripsi,
          steps: sk.steps.map((s, idx) => ({
            id: s.id || `s-${sk.id}-${idx}`,
            nama: s.nama,
            selesai: s.selesai,
            urutan: idx + 1
          })),
          isWadah: sk.isWadah,
          isApproved: sk.isApproved,
          sumberDana: sk.sumberDana,
          anggaranDiminta: sk.anggaranDiminta
        })));

        setSumberDanaList(mockSumberDana.map((sd, index) => ({
          id: index + 1,
          nama: sd,
          aktif: true
        })));

        setAppUsers([
          { id: '1', email: 'admin@dprd.go.id', nama: 'Admin DPRD', role: 'superadmin', aktif: true, bidangKode: 'ALL' },
          { id: '2', email: 'operator@dprd.go.id', nama: 'Operator Umum', role: 'admin', aktif: true, bidangKode: '2' }
        ]);

        setAllActivityLogs([
          { id: '1', timestamp: new Date().toISOString(), user: 'Admin DPRD', action: 'Demo Mode', details: 'Sistem berjalan dalam mode offline/demo' }
        ]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // local storage no longer used for users and sumberdana

  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    localStorage.removeItem('user');
  }

  // Realisasi = COMPUTED sum dari realisasi children
  const dataUraian = useMemo(() => {
    const computed = [...allDataUraian].map(u => ({
      ...u,
      realisasi: u.realisasi || u.realized || 0
    })).sort((a, b) => {
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

  const addUraianBaru = async (newUraian) => {
    try {
      const parts = newUraian.kode.split('.');
      const parentKode = parts.length > 1 ? parts.slice(0, -1).join('.') : null;
      let parentId = null;
      if (parentKode) {
        const parent = allDataUraian.find(u => u.kode === parentKode);
        if (parent) parentId = parent.id;
      }

      const res = await api.post('/kegiatan/uraian', {
        kode: newUraian.kode,
        nama: newUraian.uraian,
        level: newUraian.level,
        pagu: newUraian.target || 0,
        parentId
      });

      setAllDataUraian(prev => {
        if (prev.some(u => u.kode === newUraian.kode)) return prev;
        return [...prev, { ...newUraian, id: res.id }];
      });
    } catch (err) {
      console.error('Failed to add Uraian', err);
      // Fallback local update to keep UI working
      setAllDataUraian(prev => {
        if (prev.some(u => u.kode === newUraian.kode)) return prev;
        return [...prev, newUraian];
      });
    }
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

  const addRealisasi = async (kode, jumlah) => {
    try {
      const meta = subKegiatanMeta.find(m => m.id === kode);
      if (meta && meta.realId) {
        await api.post('/kegiatan/realisasi', {
          subKegiatanId: meta.realId,
          jumlah,
          bulan: new Date().getMonth() + 1,
          tahun: new Date().getFullYear(),
          keterangan: 'Realisasi anggaran frontend'
        });
      }
    } catch (err) {
      console.error('Failed to add Realisasi', err);
    }

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

  const addUser = async (newUser) => {
    try {
      const res = await api.post('/admin/users', newUser);
      setAppUsers(prev => [...prev, { ...newUser, id: res.data.id }]);
      addActivityLog({ user: user?.nama || 'System', action: 'Menambah User', details: `Menambah user baru: ${newUser.email}` });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateUser = async (id, updatedData) => {
    try {
      await api.patch(`/admin/users/${id}`, updatedData);
      setAppUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
      addActivityLog({ user: user?.nama || 'System', action: 'Mengubah User', details: `Mengubah user: ${updatedData.email || id}` });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setAppUsers(prev => prev.filter(u => u.id !== id));
      addActivityLog({ user: user?.nama || 'System', action: 'Menghapus User', details: `Menghapus user: ${id}` });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addSumberDana = async (nama) => {
    try {
      const res = await api.post('/admin/sumber-dana', { nama });
      setSumberDanaList(prev => [...prev, { id: res.data.id, nama: res.data.nama, aktif: true }]);
      addActivityLog({ user: user?.nama || 'System', action: 'Menambah Sumber Dana', details: `Menambah sumber dana: ${nama}` });
      return res.data;
    } catch (err) {
      console.warn('Failed to add sumber dana via API, adding to local state (offline mode):', err);
      const newId = `mock-sd-${Date.now()}`;
      const newSd = { id: newId, nama, aktif: true };
      setSumberDanaList(prev => [...prev, newSd]);
      addActivityLog({ user: user?.nama || 'System', action: 'Menambah Sumber Dana (Offline)', details: `Menambah sumber dana: ${nama}` });
      return newSd;
    }
  };

  const deleteSumberDana = async (id) => {
    try {
      await api.delete(`/admin/sumber-dana/${id}`);
      setSumberDanaList(prev => prev.filter(u => u.id !== id));
      addActivityLog({ user: user?.nama || 'System', action: 'Menghapus Sumber Dana', details: `Menghapus sumber dana: ${id}` });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Helper: set pagu untuk satu sumber dana pada satu tahun
  const setPaguPerSumberDana = (tahun, sumberDanaId, jumlah) => {
    setPaguSumberDana(prev => ({
      ...prev,
      [tahun]: {
        ...(prev[tahun] || {}),
        [sumberDanaId]: jumlah
      }
    }));
  };

  // Helper: ambil pagu total untuk tahun tertentu dari paguSumberDana
  const getPaguTotalByTahun = (tahun) => {
    const yearData = paguSumberDana[tahun] || {};
    return Object.values(yearData).reduce((sum, v) => sum + v, 0);
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
    sumberDanaList,
    addSumberDana,
    deleteSumberDana,
    paguSumberDana, setPaguSumberDana, setPaguPerSumberDana, getPaguTotalByTahun,
    user,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

import { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, UserPlus } from 'lucide-react';
import { useAppData } from '../../hooks/AppDataContext';
import { anggotaData } from '../../lib/data';

export function SubKegiatanFormModal({ mode, initialData, onClose }) {
  const { dataUraian, addUraianBaru, updateUraian, updateSubKegiatanMetadata, deleteSubKegiatanMetadata, addActivityLog, user, addRealisasi, subKegiatanMeta, duplicateSubKegiatan, sumberDanaList } = useAppData();

  const INITIAL_FORM = {
    bidangId: '',
    kegiatanId: '',
    subKegiatanTemplateId: '',
    subSubKegiatanId: '',
    penanggungJawab: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
    sumberDana: '',
    anggaranSubKegiatan: '',
    realisasi: '',
    customSteps: ['Persiapan Dokumen', 'Pelaksanaan Kegiatan', 'Evaluasi Hasil', 'Verifikasi Dokumen'],
    anggota: [''],
    isWadah: false,
  };

  const parsedIds = (() => {
    if (mode === 'edit' && initialData) {
      const parts = initialData.id.split('.');
      return {
        bidangId: parts.length >= 1 ? parts[0] : '',
        kegiatanId: parts.length >= 2 ? parts.slice(0, 2).join('.') : '',
        subKegiatanTemplateId: parts.length >= 3 ? parts.slice(0, 3).join('.') : '',
        subSubKegiatanId: parts.length >= 4 ? parts.slice(0, 4).join('.') : '',
      };
    }
    return { bidangId: '', kegiatanId: '', subKegiatanTemplateId: '', subSubKegiatanId: '' };
  })();

  const [form, setForm] = useState(
    mode === 'edit' && initialData
      ? {
        ...INITIAL_FORM,
        ...parsedIds,
        penanggungJawab: initialData.penanggungJawab,
        tanggalMulai: initialData.tanggalMulai.split('T')[0],
        tanggalSelesai: initialData.tanggalSelesai.split('T')[0],
        sumberDana: initialData.sumberDana || '',
        anggaranSubKegiatan: (initialData.paguAnggaran || initialData.anggaranDiminta || '').toString(),
        realisasi: initialData.realisasi ? initialData.realisasi.toString() : '0',
        customSteps: (() => {
          const steps = initialData.steps ? initialData.steps.map(s => s.nama) : [];
          if (steps.length === 0 || steps[steps.length - 1] !== 'Verifikasi Dokumen') {
            steps.push('Verifikasi Dokumen');
          }
          return steps;
        })(),
        isWadah: (() => {
          if (initialData.id.split('.').length === 4) return false;
          const metaEntry = subKegiatanMeta.find(m => m.id === initialData.id);
          return metaEntry?.isWadah || false;
        })(),
      }
      : INITIAL_FORM
  );

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm(prev => {
        const finalKode = prev.subSubKegiatanId || prev.subKegiatanTemplateId || prev.kegiatanId || prev.bidangId;
        if (finalKode === initialData.id && prev.anggaranSubKegiatan !== '') return prev;

        return {
          ...prev,
          ...parsedIds,
          penanggungJawab: initialData.penanggungJawab,
          tanggalMulai: initialData.tanggalMulai.split('T')[0],
          tanggalSelesai: initialData.tanggalSelesai.split('T')[0],
          sumberDana: initialData.sumberDana || '',
          anggaranSubKegiatan: (initialData.paguAnggaran || initialData.anggaranDiminta || '').toString(),
          realisasi: initialData.realisasi ? initialData.realisasi.toString() : '0',
          isWadah: (() => {
            if (initialData.id.split('.').length === 4) return false;
            const metaEntry = subKegiatanMeta.find(m => m.id === initialData.id);
            return metaEntry?.isWadah || false;
          })(),
        };
      });
    }
  }, [mode, initialData]);

  const [newInputMode, setNewInputMode] = useState(null);
  const [newInputValue, setNewInputValue] = useState('');

  const listBidang = dataUraian.filter((u) => u.level === 1);
  const selectedBidang = listBidang.find((b) => b.kode === form.bidangId);
  const listKegiatan = dataUraian.filter((u) => u.level === 2 && form.bidangId && u.kode.startsWith(form.bidangId + '.'));
  const selectedKegiatan = listKegiatan.find((s) => s.kode === form.kegiatanId);
  const listSubKegiatan = dataUraian.filter((u) => u.level === 3 && form.kegiatanId && u.kode.startsWith(form.kegiatanId + '.'));

  const isLevel1 = !!form.bidangId && !form.kegiatanId && newInputMode !== 'kegiatan';
  const isKegiatanOrDeeper = !!form.kegiatanId || newInputMode === 'kegiatan';

  useEffect(() => {
    if (isLevel1 && !form.isWadah) {
      setForm(f => ({ ...f, isWadah: true }));
    }
    if (isKegiatanOrDeeper && form.isWadah) {
      setForm(f => ({ ...f, isWadah: false }));
    }
  }, [isLevel1, isKegiatanOrDeeper]);

  function handleBidangChange(val) {
    setForm((f) => ({ ...f, bidangId: val, kegiatanId: '', subKegiatanTemplateId: '', subSubKegiatanId: '' }));
    setNewInputMode(null);
  }

  function handleSelectChange(level, val) {
    if (val === 'NEW') {
      setNewInputMode(level);
      setNewInputValue('');
      return;
    }
    if (level === 'kegiatan') setForm((f) => ({ ...f, kegiatanId: val, subKegiatanTemplateId: '', subSubKegiatanId: '' }));
    if (level === 'subKegiatan') setForm((f) => ({ ...f, subKegiatanTemplateId: val, subSubKegiatanId: '' }));
    if (level === 'subSubKegiatan') {
      setForm((f) => ({ ...f, subSubKegiatanId: val, isWadah: false }));
    }
  }

  function saveNewItem() {
    if (!newInputValue.trim()) return;
    let level = 2;
    let parentKode = '';
    if (newInputMode === 'kegiatan') { level = 2; parentKode = form.bidangId; }
    if (newInputMode === 'subKegiatan') { level = 3; parentKode = form.kegiatanId; }
    if (newInputMode === 'subSubKegiatan') { level = 4; parentKode = form.subKegiatanTemplateId; }

    const siblings = dataUraian.filter(u => u.level === level && u.kode.startsWith(parentKode + '.'));
    const nextIdx = siblings.length + 1;
    const newKode = `${parentKode}.${nextIdx}`;

    addUraianBaru({
      kode: newKode,
      uraian: newInputValue.trim(),
      level: level,
      target: 0,
      realisasi: 0
    });

    if (newInputMode === 'kegiatan') setForm((f) => ({ ...f, kegiatanId: newKode, subKegiatanTemplateId: '', subSubKegiatanId: '' }));
    if (newInputMode === 'subKegiatan') setForm((f) => ({ ...f, subKegiatanTemplateId: newKode, subSubKegiatanId: '' }));
    if (newInputMode === 'subSubKegiatan') {
      setForm((f) => ({ ...f, subSubKegiatanId: newKode, isWadah: false }));
    }

    setNewInputMode(null);
    setNewInputValue('');
  }

  function cancelNewItem() {
    setNewInputMode(null);
    setNewInputValue('');
  }

  function addStepRow() {
    setForm(f => {
      const newSteps = [...f.customSteps];
      newSteps.splice(newSteps.length - 1, 0, `Tahap ${newSteps.length}`);
      return { ...f, customSteps: newSteps };
    });
  }

  function updateStepName(idx, val) {
    setForm(f => {
      const newSteps = [...f.customSteps];
      newSteps[idx] = val;
      return { ...f, customSteps: newSteps };
    });
  }

  function removeStepRow(idx) {
    if (form.customSteps.length <= 2) return;
    setForm(f => {
      const newSteps = [...f.customSteps];
      newSteps.splice(idx, 1);
      return { ...f, customSteps: newSteps };
    });
  }

  function addAnggota() { setForm(f => ({ ...f, anggota: [...f.anggota, ''] })); }
  function updateAnggota(idx, val) {
    setForm(f => {
      const newAnggota = [...f.anggota];
      newAnggota[idx] = val;
      return { ...f, anggota: newAnggota };
    });
  }
  function removeAnggota(idx) {
    setForm(f => ({ ...f, anggota: f.anggota.filter((_, i) => i !== idx) }));
  }

  let finalKodeForPagu = form.subSubKegiatanId || form.subKegiatanTemplateId || form.kegiatanId || form.bidangId;
  if (mode === 'edit' && initialData) finalKodeForPagu = initialData.id;

  const parentKodeForPagu = finalKodeForPagu.split('.').length > 1 ? finalKodeForPagu.split('.').slice(0, -1).join('.') : '';
  const parentNode = dataUraian.find(u => u.kode === parentKodeForPagu);
  const currentNode = dataUraian.find(u => u.kode === finalKodeForPagu);

  const siblings = dataUraian.filter(u => u.kode.startsWith(parentKodeForPagu + '.') && u.kode.split('.').length === parentKodeForPagu.split('.').length + 1);
  const sumSiblings = siblings.reduce((sum, u) => sum + (u.kode === finalKodeForPagu ? 0 : u.target), 0);

  let currentPagu = parentNode
    ? parentNode.target - sumSiblings
    : (currentNode ? currentNode.target - currentNode.realisasi : 0);

  let activeLevelLabel = parentKodeForPagu
    ? 'Induk ' + parentKodeForPagu
    : (currentNode ? 'Sisa ' + currentNode.uraian : 'Top Level');

  function handleSave() {
    if (mode === 'add') {
      if (!form.bidangId) {
        alert("Pilih Bidang terlebih dahulu");
        return;
      }
      if (newInputMode === 'kegiatan' && newInputValue.trim() !== '') {
        alert("Silakan klik tombol centang untuk menyimpan nama kegiatan baru terlebih dahulu.");
        return;
      }
      if (!form.kegiatanId) {
        alert("Pilih atau ketikkan nama Kegiatan terlebih dahulu.");
        return;
      }
      const finalKode = form.subSubKegiatanId || form.subKegiatanTemplateId || form.kegiatanId || form.bidangId;

      if (new Date(form.tanggalSelesai) < new Date(form.tanggalMulai)) {
        alert("Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai!");
        return;
      }

      const isAlreadyExists = subKegiatanMeta.some(m => m.id === finalKode);
      if (isAlreadyExists) {
        const confirmCopy = window.confirm("Kegiatan/Agenda ini sudah pernah dibuat sebelumnya.\n\nApakah Anda ingin MEN-DUPLIKASI kegiatan ini?");
        if (confirmCopy) {
          duplicateSubKegiatan(finalKode, form.tanggalMulai, form.tanggalSelesai);
          onClose();
        }
        return;
      }

      const targetPagu = Number(form.anggaranSubKegiatan) || 0;
      const realisasiAnggaran = Number(form.realisasi) || 0;

      if (parentNode && targetPagu > currentPagu) {
        alert("Anggaran Diminta melebihi Sisa Pagu Induk!");
        return;
      }

      updateUraian(finalKode, { target: targetPagu, realisasi: realisasiAnggaran });

      updateSubKegiatanMetadata({
        id: finalKode,
        penanggungJawab: form.penanggungJawab || 'Belum ada PJ',
        tanggalMulai: form.tanggalMulai || new Date().toISOString().split('T')[0],
        tanggalSelesai: form.tanggalSelesai || new Date().toISOString().split('T')[0],
        deskripsi: `Pelaksanaan kegiatan yang bersumber dari ${form.sumberDana}`,
        isWadah: form.isWadah,
        steps: form.isWadah ? [] : form.customSteps.map((stepName, idx) => ({
          id: `step-${Date.now()}-${idx}`,
          nama: stepName,
          selesai: false
        })),
        isApproved: user?.role === 'superadmin',
        createdByRole: user?.role === 'superadmin' ? 'superadmin' : 'admin',
        sumberDana: form.sumberDana,
        anggaranDiminta: targetPagu,
        realisasiAnggaran: realisasiAnggaran
      });

      const uraianStr = selectedKegiatan?.uraian || selectedBidang?.uraian || 'Tanpa Nama';
      addActivityLog({
        user: user?.nama || 'Unknown User',
        action: 'Menambah Agenda Kegiatan',
        details: `Menambah kegiatan baru: ${uraianStr} (${finalKode})`
      });
    } else if (mode === 'edit' && initialData) {
      if (!form.bidangId) {
        alert("Pilih Bidang terlebih dahulu");
        return;
      }
      const targetPagu = Number(form.anggaranSubKegiatan) || 0;
      const realisasiAnggaran = Number(form.realisasi) || 0;
      const finalKode = form.subSubKegiatanId || form.subKegiatanTemplateId || form.kegiatanId || form.bidangId;

      if (new Date(form.tanggalSelesai) < new Date(form.tanggalMulai)) {
        alert("Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai!");
        return;
      }

      if (parentNode && targetPagu > currentPagu) {
        alert("Anggaran Diminta melebihi Sisa Pagu Induk!");
        return;
      }

      if (finalKode !== initialData.id) {
        deleteSubKegiatanMetadata(initialData.id);
      }

      const oldStepsMap = new Map((initialData.steps || []).map(s => [s.nama, s.selesai]));
      const newSteps = form.isWadah ? [] : form.customSteps.map((stepName, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        nama: stepName,
        selesai: oldStepsMap.get(stepName) || false
      }));

      updateUraian(finalKode, { target: targetPagu, realisasi: realisasiAnggaran });

      updateSubKegiatanMetadata({
        id: finalKode,
        penanggungJawab: form.penanggungJawab,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        deskripsi: `Pelaksanaan kegiatan yang bersumber dari ${form.sumberDana}`,
        sumberDana: form.sumberDana,
        anggaranDiminta: targetPagu,
        realisasiAnggaran: realisasiAnggaran,
        isWadah: form.isWadah,
        steps: newSteps,
        isApproved: initialData.isApproved
      });

      addActivityLog({
        user: user?.nama || 'Unknown User',
        action: 'Edit Kegiatan',
        details: `Mengubah data kegiatan: ${finalKode}`
      });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full my-6 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Tambah Kegiatan Baru' : 'Edit Kegiatan'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidang <span className="text-red-500">*</span></label>
              <select value={form.bidangId} onChange={(e) => handleBidangChange(e.target.value)} disabled={mode === 'edit'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih Bidang</option>
                {listBidang.map((b) => <option key={b.kode} value={b.kode}>{b.uraian}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kegiatan <span className="text-red-500">*</span></label>
              {newInputMode === 'kegiatan' ? (
                <div className="flex gap-2">
                  <input autoFocus type="text" value={newInputValue} onChange={(e) => setNewInputValue(e.target.value)}
                    placeholder="Nama Kegiatan baru..." className="flex-1 px-3 py-2.5 border border-blue-400 rounded-lg" />
                  <button onClick={saveNewItem} className="px-3 bg-blue-600 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                  <button onClick={cancelNewItem} className="px-3 bg-gray-200 text-gray-600 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <select value={form.kegiatanId} onChange={(e) => handleSelectChange('kegiatan', e.target.value)} disabled={mode === 'edit' || !form.bidangId}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                  <option value="">Pilih Kegiatan</option>
                  {listKegiatan.map((s) => <option key={s.kode} value={s.kode}>{s.uraian}</option>)}
                  <option value="NEW" className="text-blue-600 font-bold">+ Tambah Baru...</option>
                </select>
              )}
            </div>
          </div>

          {!form.isWadah && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Tahapan Progress <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500">Tahap terakhir = Verifikasi Dokumen (otomatis)</p>
                </div>
                <button type="button" onClick={addStepRow}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-4 h-4" /> Tambah Tahap
                </button>
              </div>

              <div className="space-y-2">
                {form.customSteps.map((step, idx) => {
                  const isLast = idx === form.customSteps.length - 1;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-white ${isLast ? 'border-emerald-500 text-emerald-500' : 'border-blue-500 text-blue-500'}`}>
                        {isLast ? '✔' : String.fromCharCode(65 + idx)}
                      </div>
                      <input type="text" value={step}
                        onChange={(e) => updateStepName(idx, e.target.value)}
                        readOnly={isLast}
                        placeholder={isLast ? 'Verifikasi Dokumen' : `Nama tahap ${idx + 1}...`}
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isLast ? 'border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default' : 'border-gray-300'}`}
                      />
                      {!isLast && form.customSteps.length > 2 && (
                        <button type="button" onClick={() => removeStepRow(idx)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input type="date" value={form.tanggalMulai}
                onChange={(e) => setForm((f) => ({ ...f, tanggalMulai: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input type="date" value={form.tanggalSelesai}
                onChange={(e) => setForm((f) => ({ ...f, tanggalSelesai: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sisa Anggaran <span className="text-blue-500 text-xs font-normal">({activeLevelLabel})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="text" readOnly
                  value={(parentNode || currentNode) ? currentPagu.toLocaleString('id-ID') : ''}
                  placeholder="Menunggu pilihan hierarki..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-blue-50/50 text-blue-800 font-bold cursor-not-allowed text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sumber Dana <span className="text-red-500">*</span></label>
              <select value={form.sumberDana}
                onChange={(e) => setForm((f) => ({ ...f, sumberDana: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih Sumber Dana</option>
                {sumberDanaList.map((s) => <option key={s.id || s.nama} value={s.nama}>{s.nama}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Pagu <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="text" value={form.anggaranSubKegiatan ? Number(form.anggaranSubKegiatan).toLocaleString('id-ID') : ''}
                  onChange={(e) => setForm((f) => ({ ...f, anggaranSubKegiatan: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Nominal anggaran"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Realisasi</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="text" value={form.realisasi ? Number(form.realisasi).toLocaleString('id-ID') : ''}
                  onChange={(e) => setForm((f) => ({ ...f, realisasi: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Nominal realisasi"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Penanggung Jawab <span className="text-red-500">*</span></label>
            <input list="anggota-list" value={form.penanggungJawab} onChange={(e) => setForm(f => ({ ...f, penanggungJawab: e.target.value }))}
              placeholder="Ketik untuk mencari penanggung jawab..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <datalist id="anggota-list">
              {anggotaData.map(a => <option key={a.id} value={a.nama}>{a.nama} - {a.jabatan}</option>)}
            </datalist>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Nama Anggota</label>
              <button type="button" onClick={addAnggota}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <UserPlus className="w-4 h-4" /> Tambah Anggota
              </button>
            </div>
            <div className="space-y-2">
              {form.anggota.map((anggota, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <input list="anggota-list" type="text" value={anggota} onChange={(e) => updateAnggota(idx, e.target.value)}
                    placeholder={`Ketik nama anggota ${idx + 1}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  {form.anggota.length > 1 && (
                    <button type="button" onClick={() => removeAnggota(idx)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium">
            Batal
          </button>
          <button onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-lg shadow-blue-200">
            {mode === 'add' ? 'Simpan Kegiatan' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}

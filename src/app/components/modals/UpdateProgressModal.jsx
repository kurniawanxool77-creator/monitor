import { useState, useRef, useEffect } from 'react';
import {
  X, Check, FileCheck, Clock, Upload, Download,
  FileText, RefreshCw, DollarSign, Edit3,
  Plus, Trash2, Save, ChevronRight, AlertCircle,
} from 'lucide-react';

import { useAppData } from '../../hooks/AppDataContext';

const STEP_DESCRIPTIONS = {
  'Persiapan Dokumen': 'Siapkan seluruh dokumen pendukung subKegiatan',
  'Koordinasi Internal': 'Koordinasi dengan pihak terkait & konfirmasi peserta',
  'Pelaksanaan SubKegiatan': 'Upload foto, dokumen, absensi',
  'Evaluasi Hasil': 'Laporan, notulen, hasil subKegiatan',
  'Penyusunan Laporan': 'Susun laporan pelaksanaan subKegiatan',
  'Verifikasi Dokumen': 'Cek kelengkapan dokumen & laporan',
  'Closed': 'SubKegiatan Selesai Sempurna',
};
const getDesc = (n) => STEP_DESCRIPTIONS[n] ?? 'Selesaikan tahap ini sesuai prosedur';

function formatRp(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}
function nowDate() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function nowTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}


export function UpdateProgressModal({
  subKegiatan,
  steps,
  progress,
  onClose,
  onToggleStep,
  onSaveRealisasi,
}) {
  const { activityLogs, addActivityLog, addRealisasi, setRealisasiToTarget, user, updateSubKegiatanMetadata } = useAppData();
  const [confirmStep, setConfirmStep] = useState({ step: null, type: 'done' });
  const [undoReason, setUndoReason] = useState('');
  const [docs, setDocs] = useState([
    { id: 'd1', nama: 'Dokumen Perencanaan.pdf', ukuran: '245 KB', uploadedAt: '2 hari yang lalu' },
    { id: 'd2', nama: 'Surat Undangan.pdf', ukuran: '128 KB', uploadedAt: '1 hari yang lalu' },
  ]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const relevantLogs = activityLogs
      .filter(log => log.details.includes(`pada subKegiatan: ${subKegiatan.nama}`) || log.details.includes(subKegiatan.id))
      .map(log => {
        const d = new Date(log.timestamp);
        return {
          id: log.id,
          tanggal: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          jam: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          keterangan: log.details.split(' pada subKegiatan:')[0].replace('Mengubah data kegiatan: ' + subKegiatan.id, 'Data Kegiatan Diubah'),
          oleh: log.user,
        };
      });
    setLogs(relevantLogs);
  }, [activityLogs, subKegiatan.nama, subKegiatan.id]);
  const [catatan, setCatatan] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── Input Realisasi form state ──
  const [realisasiForm, setRealisasiForm] = useState({
    bulan: '',
    nominal: '',
    tanggal: '',
    keterangan: '',
  });

  const [activePanel, setActivePanel] = useState('progress');


  const doneCount = steps.filter((s) => s.selesai).length;
  const currentStepIdx = steps.findIndex((s) => !s.selesai);
  const allDone = doneCount === steps.length;

  function addLog(keterangan) {
    addActivityLog({
      user: 'Administrator Utama',
      action: 'Update Progress SubKegiatan',
      details: `${keterangan} pada subKegiatan: ${subKegiatan.nama}`
    });
  }

  function handleMarkStepClick(step, type) {
    if (!subKegiatan.isApproved) {
      alert("SubKegiatan ini belum disetujui, progress tidak bisa diupdate.");
      return;
    }
    setConfirmStep({ step, type });
  }

  function confirmMarkStep() {
    if (!confirmStep.step) return;
    const step = confirmStep.step;

    if (confirmStep.type === 'undo') {
      const reason = undoReason.trim() ? ` (Alasan: ${undoReason})` : '';
      addLog(`Tahap "${step.nama}" dibatalkan / ditandai belum selesai${reason}`);
    } else {
      addLog(`Tahap "${step.nama}" ditandai selesai`);
      const isLastStep = confirmStep.step.id === steps[steps.length - 1].id;
      if (isLastStep) {
        setRealisasiToTarget(subKegiatan.id);
        addLog(`Realisasi anggaran otomatis disesuaikan menjadi 100%`);
      }
    }

    onToggleStep(step.id, confirmStep.type === 'undo' ? undoReason : undefined);
    setConfirmStep({ step: null, type: 'done' });
    setUndoReason('');
  }

  function handleApprove() {
    updateSubKegiatanMetadata({
      id: subKegiatan.id,
      penanggungJawab: subKegiatan.penanggungJawab,
      tanggalMulai: subKegiatan.tanggalMulai,
      tanggalSelesai: subKegiatan.tanggalSelesai,
      deskripsi: subKegiatan.deskripsi,
      steps: subKegiatan.steps,
      isApproved: true,
      sumberDana: subKegiatan.sumberDana,
      anggaranDiminta: subKegiatan.anggaranDiminta
    });
    addLog(`SubKegiatan disetujui oleh ${user?.nama || 'Superadmin'}`);
  }

  function handleUpload(files) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      setDocs((prev) => [...prev, {
        id: `d${Date.now()}-${Math.random()}`,
        nama: file.name,
        ukuran: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        uploadedAt: 'Baru saja',
      }]);
      addLog(`Dokumen "${file.name}" diunggah`);
    });
  }

  function handleDeleteDoc(id) {
    const doc = docs.find((d) => d.id === id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (doc) addLog(`Dokumen "${doc.nama}" dihapus`);
  }

  function handleSaveCatatan() {
    updateSubKegiatanMetadata(subKegiatan.id, { catatanProgress: catatan });
    setCatatan('');
  }

  function handleSaveRealisasi() {
    if (!realisasiForm.nominal) return;
    const amount = Number(realisasiForm.nominal);

    if (subKegiatan.realisasiAnggaran + amount > subKegiatan.paguAnggaran) {
      alert(`Gagal: Total realisation melebihi Target Pagu!\nPagu: ${formatRp(subKegiatan.paguAnggaran)}\nRealisasi saat ini: ${formatRp(subKegiatan.realisasiAnggaran)}\nSisa yang bisa diinput: ${formatRp(subKegiatan.paguAnggaran - subKegiatan.realisasiAnggaran)}`);
      return;
    }

    addLog(`Input realiseasi ${realisasiForm.bulan}: ${formatRp(amount)}`);
    if (onSaveRealisasi) {
      onSaveRealisasi(amount);
    }
    setRealisasiForm({ bulan: '', nominal: '', tanggal: '', keterangan: '' });
    setActivePanel('progress');
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative">

        {/* ── Confirmation Modal Overlay ── */}
        {confirmStep.step && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-blue-50 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-gray-900">
                  {confirmStep.type === 'done' ? 'Verifikasi Tahapan' : 'Batalkan Tahapan'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  {confirmStep.type === 'done'
                    ? `Apakah Anda yakin tahap "${confirmStep.step.nama}" sudah betul-bitul terlaksanakan sesuai prosedur?`
                    : `Apakah Anda yakin ingin mengembalikan status tahap "${confirmStep.step.nama}" menjadi belum selesai?`}
                </p>

                {confirmStep.type === 'undo' && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alasan Perubahan (Opsional)</label>
                    <textarea
                      value={undoReason}
                      onChange={(e) => setUndoReason(e.target.value)}
                      placeholder="Masukkan detail alasan pembatalan..."
                      className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button onClick={() => { setConfirmStep({ step: null, type: 'done' }); setUndoReason(''); }} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Kembali
                  </button>
                  <button onClick={confirmMarkStep} className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-colors shadow-md ${confirmStep.type === 'done' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                    Ya, {confirmStep.type === 'done' ? 'Selesai' : 'Batalkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1e3a5f] to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Monitoring SubKegiatan</h2>
              <p className="text-blue-200 text-xs truncate max-w-[400px] mt-0.5">{subKegiatan.nama}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-white">{progress}%</div>
              <div className="text-blue-200 text-xs">{doneCount}/{steps.length} tahap selesai</div>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>



        {/* hidden file input — always mounted so ref works across all panels */}
        <input ref={fileInputRef} type="file" multiple className="hidden"
          onChange={(e) => handleUpload(e.target.files)} />

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT — vertical step timeline (always visible) */}
          <div className="w-60 flex-shrink-0 border-r border-gray-100 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tahapan</div>
              <div className="relative">
                <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gray-200" />
                <div className="space-y-1">
                  {steps.map((step, idx) => {
                    const isDone = step.selesai;
                    const isCurrent = idx === currentStepIdx;
                    const isLast = idx === steps.length - 1;
                    return (
                      <div
                        key={step.id}
                        className={`relative w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all group ${isCurrent ? 'bg-blue-50 hover:bg-blue-100' :
                            isDone ? 'hover:bg-emerald-50' : 'hover:bg-gray-100'
                          }`}
                      >
                        <div className={`relative z-10 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${isDone
                            ? isLast ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white'
                            : isCurrent ? 'bg-white border-blue-500 text-blue-600 shadow-md shadow-blue-100'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                          {isDone ? isLast ? <FileCheck className="w-5 h-5" /> : <Check className="w-5 h-5" strokeWidth={3} />
                            : isCurrent ? <Clock className="w-4 h-4 animate-pulse" />
                              : <span className="text-xs font-bold">{String.fromCharCode(65 + idx)}</span>}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className={`text-xs font-semibold leading-tight ${isDone ? isLast ? 'text-emerald-700' : 'text-blue-700'
                              : isCurrent ? 'text-blue-700' : 'text-gray-500'
                            }`}>{step.nama}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{getDesc(step.nama)}</div>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />Sedang Berjalan
                            </span>
                          )}
                          {isDone && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold">✓ Selesai</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── UPDATE PROGRESS ── */}
            {activePanel === 'progress' && (
              <div className="p-6 space-y-6">
                {/* Current step highlight */}
                {!allDone && currentStepIdx >= 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-blue-500 font-bold uppercase tracking-wide mb-1">Tahap Aktif Sekarang</div>
                      <div className="text-base font-bold text-blue-900">{steps[currentStepIdx]?.nama}</div>
                      <div className="text-sm text-blue-600 mt-0.5">{getDesc(steps[currentStepIdx]?.nama)}</div>
                    </div>
                    {!subKegiatan.isApproved ? (
                      user?.role === 'superadmin' ? (
                        <button
                          onClick={handleApprove}
                          className="flex-shrink-0 flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 shadow-md shadow-amber-200 transition-all hover:scale-105"
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                          Approve SubKegiatan
                        </button>
                      ) : (
                        <div className="text-sm text-amber-700 font-bold bg-amber-100 px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                          Menunggu Approval
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => handleMarkStepClick(steps[currentStepIdx], 'done')}
                        className="flex-shrink-0 flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:scale-105"
                      >
                        <Check className="w-4 h-4" strokeWidth={3} />
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-blue-700">{progress}%</span>
                  </div>

                  {/* Undo Previous Step Button */}
                  {currentStepIdx > 0 && subKegiatan.isApproved && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleMarkStepClick(steps[currentStepIdx - 1], 'undo')}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold underline flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Batalkan tahap sebelumnya ({steps[currentStepIdx - 1].nama})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {allDone && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-800">SubKegiatan Selesai Sempurna</div>
                      <div className="text-sm text-emerald-600">Semua tahap telah terverifikasi</div>
                    </div>
                  </div>
                  {subKegiatan.isApproved && steps.length > 0 && (
                    <button
                      onClick={() => handleMarkStepClick(steps[steps.length - 1], 'undo')}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold underline whitespace-nowrap transition-colors"
                    >
                      Batalkan tahap terakhir
                    </button>
                  )}
                </div>
              )}

              {/* Catatan & Info Detail */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Progress</label>
                  <div className="flex gap-2">
                    <textarea value={catatan} 
                      onChange={(e) => setCatatan(e.target.value)}
                      onBlur={() => updateSubKegiatanMetadata({ id: subKegiatan.id, catatanProgress: catatan })}
                      placeholder="Tulis catatan atau keterangan progress..."
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Penanggung Jawab</p>
                    <p className="text-sm font-semibold text-gray-900">{subKegiatan.penanggungJawab}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Anggota Tim</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {subKegiatan.anggota?.length > 0 ? subKegiatan.anggota.join(', ') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target Pagu</p>
                    <p className="text-sm font-semibold text-gray-900">{formatRp(subKegiatan.paguAnggaran)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Realisasi Anggaran</p>
                    <p className="text-sm font-semibold text-blue-700">{formatRp(subKegiatan.realisasiAnggaran)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Realisasi Fisik</p>
                    <p className="text-sm font-semibold text-emerald-600">{subKegiatan.progress}%</p>
                  </div>
                </div>
              </div>

              {/* Dokumen */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Dokumen Terlampir</h3>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 mb-3 text-center cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Drag & drop atau klik untuk upload (PDF, Word, Excel, Foto)</p>
                </div>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group">
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{doc.nama}</div>
                        <div className="text-xs text-gray-500">{doc.ukuran} · {doc.uploadedAt}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {docs.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">Belum ada dokumen terlampir</div>
                  )}
                </div>
              </div>

              {/* Log */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Riwayat Perubahan / Log Aktivitas</h3>
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-100" />
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0 relative z-10">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="text-sm font-semibold text-gray-800">{log.keterangan}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{log.tanggal}, {log.jam} · {log.oleh}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={() => {
              updateSubKegiatanMetadata({ id: subKegiatan.id, catatanProgress: catatan });
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
            <Save className="w-4 h-4" strokeWidth={3} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

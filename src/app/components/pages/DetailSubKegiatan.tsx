import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Calendar, User, FileText, Clock, CheckCircle, Banknote } from 'lucide-react';
import { SubKegiatan } from '../../lib/data';
import { UpdateProgressModal } from '../modals/UpdateProgressModal';
import { SubKegiatanFormModal } from '../modals/SubKegiatanFormModal';
import { useAppData } from '../../hooks/AppDataContext';

export function DetailSubKegiatan() {
  const { id } = useParams();
  const { getSubKegiatanList, updateSubKegiatanMetadata, addRealisasi } = useAppData();
  
  const subKegiatans = getSubKegiatanList();
  const subKegiatan = subKegiatans.find((k) => k.id === id);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!subKegiatan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Detail Kegiatan tidak ditemukan</p>
        <Link to="/agenda" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Kembali ke Daftar Kegiatan
        </Link>
      </div>
    );
  }

  function handleToggleStep(stepId: string) {
    if (!subKegiatan) return;
    const newSteps = subKegiatan.steps.map((s) =>
      s.id === stepId ? { ...s, selesai: !s.selesai } : s
    );
    updateSubKegiatanMetadata({
      id: subKegiatan.id,
      penanggungJawab: subKegiatan.penanggungJawab,
      tanggalMulai: subKegiatan.tanggalMulai,
      tanggalSelesai: subKegiatan.tanggalSelesai,
      deskripsi: subKegiatan.deskripsi,
      sumberDana: subKegiatan.sumberDana,
      anggaranDiminta: subKegiatan.anggaranDiminta,
      steps: newSteps,
      isApproved: subKegiatan.isApproved
    });
  }

  function handleSaveRealisasi(amount: number) {
    if (!subKegiatan) return;
    addRealisasi(subKegiatan.id, amount);
  }


  const doneCount = subKegiatan.steps.filter((s) => s.selesai).length;
  const physicalProgress = subKegiatan.steps.length > 0 ? (doneCount / subKegiatan.steps.length) * 100 : 0;
  
  const progressPercentage = subKegiatan.paguAnggaran > 0 ? (subKegiatan.realisasiAnggaran / subKegiatan.paguAnggaran) * 100 : physicalProgress;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/agenda"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Kegiatan
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{subKegiatan.nama}</h1>
            <p className="text-gray-600">{subKegiatan.deskripsi}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
            subKegiatan.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
            subKegiatan.status === 'Berjalan' ? 'bg-blue-100 text-blue-700' :
            subKegiatan.status === 'Overdue' || subKegiatan.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {subKegiatan.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Penanggung Jawab</div>
              <div className="font-medium text-gray-900">{subKegiatan.penanggungJawab}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Tanggal Mulai</div>
              <div className="font-medium text-gray-900">
                {new Date(subKegiatan.tanggalMulai).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Tanggal Selesai</div>
              <div className="font-medium text-gray-900">
                {new Date(subKegiatan.tanggalSelesai).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Bidang/Kegiatan</div>
              <div className="font-medium text-gray-900">{subKegiatan.bidang}</div>
              <div className="text-sm text-gray-600">{subKegiatan.subKegiatan_parent}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Banknote className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Sumber Dana</div>
              <div className="font-medium text-gray-900">{subKegiatan.sumberDana || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Anggaran */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Anggaran Kegiatan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Pagu Anggaran</div>
            <div className="text-2xl font-bold text-gray-900">
              {subKegiatan.paguAnggaran > 0 ? `Rp ${subKegiatan.paguAnggaran.toLocaleString('id-ID')}` : '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Anggaran Diminta</div>
            <div className="text-2xl font-bold text-indigo-600">
              {subKegiatan.anggaranDiminta && subKegiatan.anggaranDiminta > 0 ? `Rp ${subKegiatan.anggaranDiminta.toLocaleString('id-ID')}` : '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Realisasi</div>
            <div className={`text-2xl font-bold ${
              progressPercentage >= 71 ? 'text-red-600' :
              progressPercentage >= 41 ? 'text-amber-500' : 'text-emerald-600'
            }`}>
              {subKegiatan.realisasiAnggaran > 0 ? `Rp ${subKegiatan.realisasiAnggaran.toLocaleString('id-ID')}` : '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Sisa Anggaran</div>
            <div className={`text-2xl font-bold ${
              (subKegiatan.paguAnggaran - subKegiatan.realisasiAnggaran) <= 0 ? 'text-red-600' :
              (subKegiatan.paguAnggaran - subKegiatan.realisasiAnggaran) / subKegiatan.paguAnggaran < 0.20 ? 'text-amber-600' :
              'text-emerald-600'
            }`}>
              {(subKegiatan.paguAnggaran - subKegiatan.realisasiAnggaran) > 0 ? `Rp ${(subKegiatan.paguAnggaran - subKegiatan.realisasiAnggaran).toLocaleString('id-ID')}` : '0'}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Persentase Realisasi</span>
            <span className={`text-sm font-bold ${
              progressPercentage >= 71 ? 'text-red-600' :
              progressPercentage >= 41 ? 'text-amber-500' : 'text-emerald-600'
            }`}>{progressPercentage.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                progressPercentage >= 71 ? 'bg-red-500' :
                progressPercentage >= 41 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Timeline Step Progress ({subKegiatan.steps.length} Tahap)</h2>
        
        <div className="relative">
          {subKegiatan.steps.map((step, index) => {
            const isCompleted = step.selesai;
            const currentStepIdx = subKegiatan.steps.findIndex((s) => !s.selesai);
            const isCurrent = index === (currentStepIdx === -1 ? subKegiatan.steps.length : currentStepIdx);
            const isLast = index === subKegiatan.steps.length - 1;

            return (
              <div key={step.id} className="relative flex gap-4 pb-8">
                {/* Vertical Line */}
                {!isLast && (
                  <div className={`absolute left-[15px] top-[32px] w-0.5 h-full ${
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}

                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-emerald-500' :
                  isCurrent ? 'bg-blue-500' :
                  'bg-gray-200'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-sm font-medium text-white">{String.fromCharCode(65 + index)}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${
                    isCurrent ? 'text-blue-600' :
                    isCompleted ? 'text-emerald-600' :
                    'text-gray-600'
                  }`}>
                    {step.nama}
                    {isCurrent && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sedang Berjalan</span>}
                    {isCompleted && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Selesai</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dokumen Terlampir */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Dokumen Terlampir</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Dokumen Perencanaan.pdf</div>
                <div className="text-sm text-gray-600">Diupload 2 hari yang lalu</div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Surat Undangan.pdf</div>
                <div className="text-sm text-gray-600">Diupload 1 hari yang lalu</div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Riwayat Aktivitas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Perubahan / Log Aktivitas</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="text-sm text-gray-600 w-32">12 Jun 2026, 10:30</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Status diubah menjadi "Berjalan"</div>
              <div className="text-sm text-gray-600">oleh Administrator Utama</div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-sm text-gray-600 w-32">10 Jun 2026, 14:15</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Dokumen "Surat Undangan.pdf" ditambahkan</div>
              <div className="text-sm text-gray-600">oleh Administrator Utama</div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-sm text-gray-600 w-32">8 Jun 2026, 09:00</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">SubKegiatan dibuat</div>
              <div className="text-sm text-gray-600">oleh Administrator Utama</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowProgressModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer animate-none"
        >
          Progres
        </button>

        <button
          onClick={() => setShowEditModal(true)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer animate-none"
        >
          Edit Kegiatan
        </button>
      </div>

      {showProgressModal && (
        <UpdateProgressModal
          subKegiatan={subKegiatan}
          steps={subKegiatan.steps}
          progress={subKegiatan.progress}
          onClose={() => setShowProgressModal(false)}
          onToggleStep={handleToggleStep}
          onSaveRealisasi={handleSaveRealisasi}
        />
      )}

      {showEditModal && (
        <SubKegiatanFormModal
          mode="edit"
          initialData={subKegiatan}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  RefreshCw, Building2, Wallet, Megaphone, Gavel, Archive, HelpCircle, RotateCcw,
  Briefcase, Lightbulb, Target, Zap, Rocket, Layers, Compass, Globe, CheckCircle
} from 'lucide-react';
import { SubKegiatan } from '../../lib/data';
import { UpdateProgressModal } from '../modals/UpdateProgressModal';
import { useAppData } from '../../hooks/AppDataContext';

const VIBRANT_COLORS = [
  { bg: 'bg-rose-500', border: 'border-rose-600 ring-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)] bg-rose-50/10' },
  { bg: 'bg-violet-500', border: 'border-violet-600 ring-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-violet-50/10' },
  { bg: 'bg-fuchsia-500', border: 'border-fuchsia-600 ring-fuchsia-500/10 shadow-[0_0_15px_rgba(217,70,239,0.15)] bg-fuchsia-50/10' },
  { bg: 'bg-cyan-500', border: 'border-cyan-600 ring-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-cyan-50/10' },
  { bg: 'bg-amber-500', border: 'border-amber-600 ring-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-50/10' },
  { bg: 'bg-lime-500', border: 'border-lime-600 ring-lime-500/10 shadow-[0_0_15px_rgba(132,204,22,0.15)] bg-lime-50/10' },
  { bg: 'bg-teal-500', border: 'border-teal-600 ring-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-teal-50/10' },
  { bg: 'bg-indigo-500', border: 'border-indigo-600 ring-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-indigo-50/10' },
];

const UNIVERSAL_ICONS = [
  Briefcase, Lightbulb, Target, Zap, Rocket, Layers, Compass, Globe, Wallet
];

function getDynamicConfig(name: string = '') {
  if (!name) return { iconBg: 'bg-gray-500', borderActive: 'ring-2 border-gray-600', icon: Briefcase };
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIdx = Math.abs(hash) % VIBRANT_COLORS.length;
  const iconIdx = Math.abs(hash) % UNIVERSAL_ICONS.length;
  
  return {
    iconBg: VIBRANT_COLORS[colorIdx].bg,
    borderActive: `ring-2 ${VIBRANT_COLORS[colorIdx].border}`,
    icon: UNIVERSAL_ICONS[iconIdx]
  };
}

const CARDS_CONFIG: Record<string, {
  label: string;
  desc: string;
  icon: any;
  iconBg: string;
  iconText: string;
  borderActive: string;
}> = {
  'Sekretariat DPRD': {
    label: 'Sekretariat DPRD',
    desc: 'Humas, Perlengkapan, dll',
    icon: Building2,
    iconBg: 'bg-emerald-500',
    iconText: 'text-white',
    borderActive: 'border-emerald-600 ring-2 ring-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-50/10',
  },
  'Bagian Humas': {
    label: 'Bagian Humas',
    desc: 'Protokol & Publikasi',
    icon: Megaphone,
    iconBg: 'bg-orange-500',
    iconText: 'text-white',
    borderActive: 'border-orange-600 ring-2 ring-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-orange-50/10',
  },
  'Bagian Persidangan': {
    label: 'Bagian Persidangan',
    desc: 'Fasilitasi & Risalah Rapat',
    icon: Gavel,
    iconBg: 'bg-purple-500',
    iconText: 'text-white',
    borderActive: 'border-purple-600 ring-2 ring-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-50/10',
  },
  'Bagian Umum': {
    label: 'Bagian Umum',
    desc: 'TU, Kepegawaian & RT',
    icon: Archive,
    iconBg: 'bg-blue-500',
    iconText: 'text-white',
    borderActive: 'border-blue-600 ring-2 ring-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-50/10',
  },
};

export function ProgressSubKegiatan() {
  const { getSubKegiatanList, addRealisasi, updateSubKegiatanMetadata, getBagianList, dataUraian } = useAppData();
  const subKegiatans = getSubKegiatanList();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const bagianList = getBagianList();

  const userBidang = user?.role === 'superadmin'
    ? null
    : bagianList.find(b => b.id === user?.bidangKode)?.nama;

  const allBidangList = dataUraian.filter(u => u.level === 1).map(u => u.uraian);
  const CARDS_ORDER = userBidang ? [userBidang] : allBidangList;

  const [selectedBagian, setSelectedBagian] = useState<string>(CARDS_ORDER.length > 0 ? CARDS_ORDER[0] : 'Sekretariat DPRD');
  const [filterSubBagian, setFilterSubBagian] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterTahun, setFilterTahun] = useState<string>('Semua');
  const [updateProgressFor, setUpdateProgressFor] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSubBagian, filterStatus, filterTahun, selectedBagian]);

  function toggleStep(subKegiatanId: string, stepId: string) {
    const k = subKegiatans.find(x => x.id === subKegiatanId);
    if (!k) return;
    const newSteps = k.steps.map((s) =>
      s.id === stepId ? { ...s, selesai: !s.selesai } : s
    );
    updateSubKegiatanMetadata({
      id: subKegiatanId,
      penanggungJawab: k.penanggungJawab,
      tanggalMulai: k.tanggalMulai,
      tanggalSelesai: k.tanggalSelesai,
      deskripsi: k.deskripsi,
      steps: newSteps
    });
  }

  function handleSaveRealisasi(subKegiatanId: string, amount: number) {
    addRealisasi(subKegiatanId, amount);
  }

  function handleSaveEdit(subKegiatanId: string, updatedFields: Partial<SubKegiatan>) {
    const k = subKegiatans.find(x => x.id === subKegiatanId);
    if (!k) return;

    updateSubKegiatanMetadata({
      id: subKegiatanId,
      penanggungJawab: updatedFields.penanggungJawab !== undefined ? updatedFields.penanggungJawab : k.penanggungJawab,
      tanggalMulai: updatedFields.tanggalMulai !== undefined ? updatedFields.tanggalMulai : k.tanggalMulai,
      tanggalSelesai: updatedFields.tanggalSelesai !== undefined ? updatedFields.tanggalSelesai : k.tanggalSelesai,
      deskripsi: updatedFields.deskripsi !== undefined ? updatedFields.deskripsi : k.deskripsi,
      steps: updatedFields.steps || k.steps
    });
  }

  // Get active subKegiatan data for selected department (only Leaf nodes / Kegiatan)
  const currentDeptKegiatans = subKegiatans.filter((k) => k.bidang === selectedBagian && !k.isWadah);

  // Calculate average progress for selected department
  const selectedBagianProgress = currentDeptKegiatans.length > 0
    ? Math.round(currentDeptKegiatans.reduce((acc, k) => acc + k.progress, 0) / currentDeptKegiatans.length)
    : 0;

  // Get unique sub-bagian for filtering
  const uniqueSubBagian = Array.from(new Set(currentDeptKegiatans.map((k) => k.subKegiatan_parent)));
  
  // Get unique years for filtering
  const uniqueYears = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - 3 + i).toString());

  // Filtered subKegiatan to display in table
  const filteredKegiatans = currentDeptKegiatans
    .filter((k) => k.id.split('.').length > 1) // Exclude Bidang (Level 1)
    .filter((k) => filterSubBagian === 'Semua' || k.subKegiatan_parent === filterSubBagian)
    .filter((k) => filterStatus === 'Semua' || k.status === filterStatus)
    .filter((k) => filterTahun === 'Semua' || new Date(k.tanggalMulai).getFullYear().toString() === filterTahun);

  // Sort by urgency
  const sortedKegiatans = [...filteredKegiatans].sort((a, b) => {
    const priority: Record<string, number> = { 'Terlambat': 1, 'Belum Mulai': 2, 'Berjalan': 3, 'Selesai': 4 };
    return (priority[a.status] || 99) - (priority[b.status] || 99);
  });

  const totalPages = Math.ceil(sortedKegiatans.length / itemsPerPage);
  const paginatedKegiatans = sortedKegiatans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const updateKegiatan = updateProgressFor ? subKegiatans.find((k) => k.id === updateProgressFor) : null;

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS_ORDER.map((bagianNama, index) => {
          const defaultDynamic = getDynamicConfig(bagianNama);
          const config = CARDS_CONFIG[bagianNama] || {
            label: bagianNama,
            desc: 'Kegiatan ' + bagianNama,
            icon: defaultDynamic.icon,
            iconBg: defaultDynamic.iconBg,
            iconText: 'text-white',
            borderActive: defaultDynamic.borderActive,
          };

          const IconComponent = config.icon;
          const isSelected = selectedBagian === bagianNama;

          // Calculate stats for this card
          const cardKegiatans = subKegiatans.filter((k) => k.bidang === bagianNama);
          const uniqueSubDepts = Array.from(new Set(cardKegiatans.map((k) => k.subKegiatan_parent)));
          const progressVal = cardKegiatans.length > 0
            ? Math.round(cardKegiatans.reduce((acc, k) => acc + k.progress, 0) / cardKegiatans.length)
            : 0;

          const progressColorClass = progressVal >= 71 ? 'text-emerald-600' :
            progressVal >= 41 ? 'text-amber-500' : 'text-red-600';

          return (
            <div
              key={bagianNama}
              onClick={() => {
                setSelectedBagian(bagianNama);
                setFilterSubBagian('Semua');
                setFilterStatus('Semua');
                setFilterTahun('Semua');
              }}
              className={`p-4 bg-white rounded-xl border transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between shadow-sm ${isSelected
                ? `${config.borderActive} transform scale-[1.02] shadow-md`
                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50/20'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-2 min-w-0">
                  <div className="text-sm font-bold text-gray-900 leading-tight truncate">
                    {index + 1}. {config.label}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">{config.desc}</div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${config.iconBg} ${config.iconText}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">{uniqueSubDepts.length} Sub-Bagian</span>
                  <span className={`font-bold ${progressColorClass}`}>{progressVal}% Progres</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      progressVal >= 71 ? 'bg-emerald-500' :
                      progressVal >= 41 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
            Rincian Per Kegiatan {(selectedBagian || '').replace('Bagian ', '').toUpperCase()}:
          </span>
          <div className="flex items-center gap-3">
            <select
              value={filterSubBagian}
              onChange={(e) => setFilterSubBagian(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="Semua">Semua Kegiatan</option>
              {uniqueSubBagian.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="Semua">Semua Tahun</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Kegiatan</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Progress</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-28">Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedKegiatans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium">Tidak ada kegiatan di bagian/filter ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedKegiatans.map((k) => (
                  <tr key={k.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/agenda/${k.id}`} className="text-sm font-bold text-gray-800 hover:text-blue-600 hover:underline transition-colors">{k.nama}</Link>
                        <span title={k.deskripsi}><HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        PJ: <span className="font-semibold text-gray-600">{k.penanggungJawab}</span> • {new Date(k.tanggalMulai).toLocaleDateString('id-ID')} – {new Date(k.tanggalSelesai).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      {new Date(k.tanggalSelesai).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden flex-shrink-0">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              k.progress >= 71 ? 'bg-emerald-500' :
                              k.progress >= 41 ? 'bg-amber-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${k.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{k.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                        k.status === 'Berjalan' ? 'bg-blue-100 text-blue-700' :
                          k.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => setUpdateProgressFor(k.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold text-white transition-all hover:scale-105 shadow-sm ${k.status === 'Selesai' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                          k.status === 'Terlambat' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                            'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                          }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Progres
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border-gray-300 rounded-md text-xs py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={75}>75</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-gray-600">data</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-gray-600">
              Hal {currentPage} dari {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Update Progress Modal */}
      {updateProgressFor && updateKegiatan && (
        <UpdateProgressModal
          subKegiatan={updateKegiatan}
          steps={updateKegiatan.steps}
          progress={updateKegiatan.progress}
          onClose={() => setUpdateProgressFor(null)}
          onToggleStep={(stepId) => toggleStep(updateKegiatan.id, stepId)}
          onSaveRealisasi={(amount) => handleSaveRealisasi(updateKegiatan.id, amount)}

        />
      )}
    </div>
  );
}

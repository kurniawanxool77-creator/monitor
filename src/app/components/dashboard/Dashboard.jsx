import { useState } from 'react';
import {
  FileText,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Save,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { notifikasiList } from '../../lib/data';
import { useAppData } from '../../hooks/AppDataContext';

const BIDANG_COLORS = {
  'Sekretariat DPRD': '#3b82f6', // blue
  'Bagian Umum': '#10b981', // emerald
  'Bagian Humbas': '#f59e0b', // amber
  'Bagian Persidangan': '#8b5cf6', // purple
  'Keuangan': '#ef4444', // red
};

const VIBRANT_HEX_COLORS = [
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#84cc16', // lime
  '#14b8a6', // teal
  '#6366f1', // indigo
];

function getDynamicHexColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return VIBRANT_HEX_COLORS[Math.abs(hash) % VIBRANT_HEX_COLORS.length];
}
const stepColors = {
  Persiapan: 'bg-gray-400',
  Koordinasi: 'bg-blue-400',
  Pelaksanaan: 'bg-amber-400',
  Evaluasi: 'bg-purple-400',
  Verifikasi: 'bg-emerald-400',
  Closed: 'bg-emerald-600',
};

export function Dashboard() {
  const { getBagianList, getSubKegiatanList, dataUraian, activityLogs } = useAppData();

  const bagianList = getBagianList();
  const subKegiatanList = getSubKegiatanList().filter(k => !k.isWadah);

  const [selectedBagian, setSelectedBagian] = useState(bagianList.length > 0 ? bagianList[0].nama : 'Sekretariat DPRD');
  const [expandedKegiatanId, setExpandedKegiatanId] = useState(null);
  const [catatanInputs, setCatatanInputs] = useState({});

  const { updateSubKegiatanMetadata } = useAppData();

  const level1Data = dataUraian.filter(u => u.level === 1);
  let totalPagu = 0;
  let totalRealisasi = 0;

  const realizationData = level1Data.map(u => {
    totalPagu += u.target;
    totalRealisasi += u.realisasi;
    return {
      name: u.uraian,
      value: u.realisasi,
      color: BIDANG_COLORS[u.uraian] || getDynamicHexColor(u.uraian),
    };
  });

  const sisa = totalPagu - totalRealisasi;
  if (sisa > 0) {
    realizationData.push({ name: 'Sisa Anggaran', value: sisa, color: '#e5e7eb' });
  }

  // Fallback for empty data so Recharts doesn't crash
  const chartRealizationData = realizationData.length > 0
    ? realizationData
    : [{ name: 'Belum ada data', value: 1, color: '#f3f4f6' }];

  const percentRealisasi = totalPagu > 0 ? ((totalRealisasi / totalPagu) * 100).toFixed(2) : '0';

  const jenisCounts = {};
  subKegiatanList.forEach(k => {
     jenisCounts[k.bidang] = (jenisCounts[k.bidang] || 0) + 1;
  });

  const jenisData = level1Data.map(u => ({
     name: u.uraian,
     value: jenisCounts[u.uraian] || 0,
     color: BIDANG_COLORS[u.uraian] || getDynamicHexColor(u.uraian)
  }));

  const chartJenisData = jenisData.length > 0
    ? jenisData
    : [{ name: 'Belum ada data', value: 1, color: '#f3f4f6' }];

  function safeFormatDate(dStr) {
    if (!dStr) return '-';
    try {
      return new Date(dStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr.split('T')[0];
    }
  }

  const subKegiatanPerBagian = subKegiatanList.reduce((acc, k) => {
    if (!acc[k.bidang]) acc[k.bidang] = [];
    acc[k.bidang].push({
      id: k.id,
      nama: k.nama,
      tanggal: `${safeFormatDate(k.tanggalMulai)} - ${safeFormatDate(k.tanggalSelesai)}`,
      progress: k.progress,
      status: k.status,
      step: k.step,
      penanggungJawab: k.penanggungJawab,
      sumberDana: k.sumberDana,
      steps: k.steps,
      catatanProgress: k.catatanProgress,
    });
    return acc;
  }, {});

  const subKegiatanBerjalan = (subKegiatanPerBagian[selectedBagian] ?? [])
    .filter(k => k.status !== 'Selesai')
    .sort((a, b) => {
      // Sort priority: Terlambat -> Belum Mulai -> Berjalan
      const priority = { 'Terlambat': 1, 'Belum Mulai': 2, 'Berjalan': 3 };
      return (priority[a.status] || 99) - (priority[b.status] || 99);
    });

  const statsCards = [
    {
      title: 'TOTAL KEGIATAN',
      value: subKegiatanList.length,
      subtitle: 'Bulan ini',
      detail: 'Aktivitas terdata',
      detailColor: 'text-emerald-600',
      icon: FileText,
      color: 'bg-blue-500',
      path: '/agenda',
    },
    {
      title: 'KEGIATAN BERJALAN',
      value: subKegiatanList.filter(k => k.status === 'Berjalan').length,
      subtitle: 'Sedang Berjalan',
      detail: 'Dalam proses',
      detailColor: 'text-emerald-600',
      icon: ShoppingCart,
      color: 'bg-emerald-500',
      path: '/progress',
    },
    {
      title: 'KEGIATAN SELESAI',
      value: subKegiatanList.filter(k => k.status === 'Selesai').length,
      subtitle: 'Selesai',
      detail: 'Selesai 100%',
      detailColor: 'text-emerald-600',
      icon: CheckCircle,
      color: 'bg-amber-500',
      path: '/laporan-kegiatan',
    },
    {
      title: 'BELUM MULAI / TERLAMBAT',
      value: subKegiatanList.filter(k => k.status === 'Terlambat' || k.status === 'Belum Mulai').length,
      subtitle: 'Perlu Perhatian',
      detail: 'Cek jadwal',
      detailColor: 'text-red-500',
      icon: AlertTriangle,
      color: 'bg-red-500',
      path: '/agenda',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.path}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 mb-1">{card.title}</div>
                  <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-1">{card.subtitle}</div>
              <div className={`text-xs font-medium ${card.detailColor}`}>{card.detail}</div>
            </Link>
          );
        })}
      </div>

      {/* Middle row: Progress Bagian (clickable) + SubKegiatan Prioritas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress per Bagian — clickable */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900">PROGRESS KEGIATAN SEKRETARIAT DPRD</h2>
            <p className="text-xs text-gray-500 mt-0.5">Klik bagian untuk melihat Kegiatan berjalan</p>
          </div>

          <div className="space-y-3">
            {bagianList.map((bagian) => {
              const isSelected = selectedBagian === bagian.nama;
              return (
                <button
                  key={bagian.id}
                  onClick={() => setSelectedBagian(bagian.nama)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                      {bagian.nama}
                    </span>
                    <span className={`font-bold ${
                      bagian.progress >= 71 ? 'text-emerald-600' :
                      bagian.progress >= 41 ? 'text-amber-500' : 'text-red-600'
                    }`}>
                      {bagian.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        bagian.progress >= 71 ? 'bg-emerald-500' :
                        bagian.progress >= 41 ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${bagian.progress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SubKegiatan Prioritas — filtered by selected bagian */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">KEGIATAN BERJALAN</h2>
              <p className="text-xs text-blue-600 font-medium mt-0.5">{selectedBagian}</p>
            </div>
            <Link
              to="/progress"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-2" style={{ scrollbarWidth: 'thin' }}>
            {subKegiatanBerjalan.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <CheckCircle className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm">Tidak ada Kegiatan berjalan</p>
              </div>
            ) : (
              subKegiatanBerjalan.map((kg) => (
                <div key={kg.id} className="rounded-lg border border-gray-100 hover:border-blue-200 transition-all overflow-hidden">
                  <div 
                    className="p-3 cursor-pointer hover:bg-blue-50/30 flex flex-col"
                    onClick={() => {
                      if (expandedKegiatanId === kg.id) {
                        setExpandedKegiatanId(null);
                      } else {
                        setExpandedKegiatanId(kg.id);
                        setCatatanInputs(prev => ({ ...prev, [kg.id]: kg.catatanProgress || '' }));
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 leading-tight flex-1">{kg.nama}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                          kg.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                          kg.status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {kg.status}
                        </span>
                        {expandedKegiatanId === kg.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            kg.progress >= 71 ? 'bg-emerald-500' :
                            kg.progress >= 41 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${kg.progress}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold min-w-[36px] text-right ${
                        kg.progress >= 71 ? 'text-emerald-600' :
                        kg.progress >= 41 ? 'text-amber-500' : 'text-red-600'
                      }`}>{kg.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{kg.tanggal}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        stepColors[kg.step] ?? 'bg-gray-200'
                      } text-white`}>
                        {kg.step}
                      </span>
                    </div>
                  </div>

                  {/* Detail Section */}
                  {expandedKegiatanId === kg.id && (
                    <div className="p-4 bg-slate-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                      {/* Progress Timeline */}
                      <div className="mb-8 px-6">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all" style={{ width: `${kg.progress}%` }}></div>
                          
                          {kg.steps?.map((step, idx) => {
                            const isDone = step.selesai;
                            return (
                              <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${isDone ? 'border-blue-500 text-blue-500' : 'border-gray-200 text-gray-400'}`}>
                                  {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <span className={`absolute top-9 text-[9px] text-center w-max max-w-[60px] leading-tight font-medium ${isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {step.nama}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Keterangan Progress */}
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-700 break-words whitespace-normal leading-relaxed">
                          <span className="font-bold">Ket : </span>
                          <span className={`${kg.catatanProgress ? 'font-medium' : 'italic'} text-gray-600`}>
                            {kg.catatanProgress ? kg.catatanProgress : 'Tidak ada keterangan'}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Notifikasi | Realisasi Anggaran | SubKegiatan Berdasarkan Jenis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifikasi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">NOTIFIKASI / PERINGATAN</h2>
            <Link to="/log-aktifitas" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">Belum ada aktifits</div>
            ) : (
              activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg flex-shrink-0 bg-blue-100">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{log.action}</h3>
                    <p className="text-xs text-gray-500 mb-1 leading-snug line-clamp-2">{log.details}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] font-medium text-gray-500">{log.user}</p>
                      <p className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Realisasi Anggaran */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900">PAGU KEGIATAN</h2>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartRealizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartRealizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-2xl font-bold text-gray-900">{percentRealisasi}%</div>
                <div className="text-xs text-gray-500">Realisasi</div>
              </div>
            </div>

            <div className="mt-4 w-full space-y-2">
              {realizationData.filter(item => item.name !== 'Sisa Anggaran').map(item => (
                <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Rp {item.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
              {/* Sisa Anggaran selalu tampil */}
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-xs text-gray-500">Sisa Anggaran</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">Rp {Math.max(0, totalPagu - totalRealisasi).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 pt-2 mt-1 border-t-2 border-gray-200">
                <span className="text-xs font-bold text-gray-800">Pagu Kegiatan</span>
                <span className="text-xs font-bold text-gray-800">Rp {totalPagu.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SubKegiatan Berdasarkan Jenis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">KEGIATAN BERDASARKAN JENIS</h2>
            <span className="text-xs text-gray-500">Tahun {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartJenisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartJenisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-2xl font-bold text-gray-900">{subKegiatanList.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>

            <div className="mt-4 w-full space-y-1.5">
              {jenisData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{item.value} Kegiatan</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

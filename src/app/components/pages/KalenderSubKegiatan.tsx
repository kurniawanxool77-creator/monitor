import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  MapPin, Clock, Users, Building2, ChevronRight as ChevronRightIcon,
  CheckCircle2, Circle, Tag,
} from 'lucide-react';
import { useAppData } from '../../hooks/AppDataContext';

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

type KalenderEvent = {
  id: string;
  date: string;
  title: string;
  color: string;
  bagian?: string;
  mulai?: string;
  akhir?: string;
  kategori?: string;
  tahapan?: { nama: string; selesai: boolean }[];
};

const STATUS_COLOR: Record<string, string> = {
  'Selesai': 'bg-emerald-600',
  'Berjalan': 'bg-blue-600',
  'Terlambat': 'bg-red-600',
  'Belum Mulai': 'bg-gray-500',
};

export function KalenderSubKegiatan() {
  const { getSubKegiatanList } = useAppData();
  const subKegiatanList = getSubKegiatanList();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Hanya tampilkan Kegiatan riil (bukan Agenda Induk / Bidang) di kalender
  const eventsExtended: KalenderEvent[] = subKegiatanList
    .filter(k => !k.isWadah)
    .map(k => {
      return {
        id: k.id,
        date: k.tanggalMulai,
        title: k.nama,
        color: k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
               k.status === 'Terlambat' ? 'bg-red-100 text-red-700 border-red-200' :
               k.status === 'Berjalan' ? 'bg-blue-100 text-blue-700 border-blue-200' :
               'bg-gray-100 text-gray-700 border-gray-200',
        bagian: k.bidang,
        mulai: k.tanggalMulai,
        akhir: k.tanggalSelesai,
        kategori: k.status,
        tahapan: k.steps
      };
    });

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filterBagian, setFilterBagian] = useState('semua');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<KalenderEvent | null>(null);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null); setSelectedEvent(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null); setSelectedEvent(null);
  };

  const isDateMatched = (dateStr: string, startStr: string, endStr: string) => {
    return dateStr === startStr || dateStr === endStr;
  };

  const getEventsForDate = (day: number): KalenderEvent[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventsExtended.filter(e => {
      if (filterBagian !== 'semua' && e.bagian && !e.bagian.toLowerCase().includes(filterBagian)) return false;
      return isDateMatched(dateStr, e.mulai || e.date, e.akhir || e.date);
    });
  };

  function handleDayClick(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const evs = getEventsForDate(day);
    setSelectedEvent(evs.length > 0 ? evs[0] : null);
  }

  const selectedDateEvents = selectedDate
    ? eventsExtended.filter(e => isDateMatched(selectedDate, e.mulai || e.date, e.akhir || e.date))
    : [];

  const formatDateLabel = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-28 bg-gray-50/50" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const events = getEventsForDate(day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = day === 12 && currentMonth === 5 && currentYear === 2025;
    const isSelected = selectedDate === dateStr;
    const hasEvents = events.length > 0;

    calendarDays.push(
      <div
        key={day}
        onClick={() => handleDayClick(day)}
        className={`h-28 border p-2 cursor-pointer transition-all select-none ${
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 ring-inset'
            : isToday
            ? 'bg-blue-50 border-blue-200'
            : hasEvents
            ? 'bg-white border-gray-200 hover:bg-blue-50/40 hover:border-blue-300'
            : 'bg-white border-gray-100 hover:bg-gray-50'
        }`}
      >
        <div className={`text-sm font-semibold mb-1.5 flex items-center gap-1.5 ${
          isSelected ? 'text-blue-700' : isToday ? 'text-blue-600' : 'text-gray-700'
        }`}>
          {isSelected ? (
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{day}</span>
          ) : isToday ? (
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">{day}</span>
          ) : day}
        </div>
        <div className="space-y-0.5">
          {events.slice(0, 2).map((event, idx) => (
            <div
              key={idx}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${event.color} truncate font-medium`}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
          {events.length > 2 && (
            <div className="text-[10px] text-gray-500 font-medium">+{events.length - 2} lagi</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">{months[currentMonth]} {currentYear}</h2>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {(!user || user.role === 'superadmin') && (
              <select value={filterBagian} onChange={(e) => setFilterBagian(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="semua">Semua Bidang</option>
                <option value="sekretariat">Sekretariat DPRD</option>
                <option value="humas">Humas</option>
                <option value="persidangan">Persidangan</option>
                <option value="umum">Umum</option>
                <option value="keuangan">Keuangan</option>
              </select>
            )}
            <div className="flex gap-1.5">
              {['Bulanan','Mingguan','Tahunan'].map((v, i) => (
                <button key={v} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  i === 0 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-gray-200">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wide">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-gray-200">
          {calendarDays}
        </div>
      </div>

      {/* ── PANEL BAWAH: muncul saat tanggal diklik ── */}
      {selectedDate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* KIRI — daftar subKegiatan pada tanggal terpilih */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-gray-200 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Kegiatan Tanggal {formatDateLabel(selectedDate)}
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <div className="text-sm">Tidak ada kegiatan pada tanggal ini</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {selectedDateEvents.map((ev, idx) => (
                  <button key={idx} onClick={() => setSelectedEvent(ev)} className={`w-full text-left px-5 py-4 hover:bg-blue-50 transition-all ${
                    selectedEvent === ev ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                            STATUS_COLOR[ev.kategori ?? ''] ?? 'bg-gray-500'
                          }`}>
                            {ev.kategori}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 leading-snug">{ev.title}</div>
                        {ev.bagian && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600">
                            <Building2 className="w-3 h-3" />
                            <span>{ev.bagian}</span>
                          </div>
                        )}
                        {ev.mulai && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Mulai: {ev.mulai}</span>
                            {ev.akhir && ev.akhir !== ev.mulai && <span> – Akhir: {ev.akhir}</span>}
                          </div>
                        )}
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KANAN — detail & tahapan subKegiatan terpilih */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-gray-200 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Progres & Tahapan Kegiatan</span>
            </div>

            {!selectedEvent ? (
              <div className="p-8 text-center text-gray-400">
                <ChevronRightIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <div className="text-sm">Pilih kegiatan di sebelah kiri untuk melihat detail</div>
              </div>
            ) : (
              <div className="p-5 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {/* Header subKegiatan */}
                <div className="mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white inline-block mb-2 ${
                    STATUS_COLOR[selectedEvent.kategori ?? ''] ?? 'bg-gray-500'
                  }`}>
                    {selectedEvent.kategori}
                  </span>
                  <div className="text-base font-black text-gray-900 mb-2">{selectedEvent.title}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {selectedEvent.bagian && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Building2 className="w-3 h-3" />
                        {selectedEvent.bagian}
                      </span>
                    )}
                    {selectedEvent.mulai && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Periode: {selectedEvent.mulai}
                        {selectedEvent.akhir && selectedEvent.akhir !== selectedEvent.mulai && ` s.d ${selectedEvent.akhir}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tahapan */}
                {(selectedEvent.tahapan?.length ?? 0) > 0 ? (
                  <div className="space-y-2.5 mt-4">
                    {selectedEvent.tahapan!.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {t.selesai
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        }
                        <div className="flex-1">
                          <div className={`text-sm font-semibold ${t.selesai ? 'text-gray-800' : 'text-gray-500'}`}>
                            {t.nama}
                          </div>
                          <div className={`text-[11px] mt-0.5 font-medium ${
                            t.selesai ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            {t.selesai ? '● Selesai' : '● Belum Mulai'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 mt-3">Tidak ada tahapan tercatat.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Keterangan Status</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(STATUS_COLOR).map(([k, c]) => (
            <div key={k} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${c}`} />
              <span className="text-xs text-gray-600 font-medium capitalize">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

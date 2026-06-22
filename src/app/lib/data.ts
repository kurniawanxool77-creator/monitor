// Mock data untuk sistem dashboard monitoring DPRD

export const anggotaData = [
  { id: '1', nama: 'AGUNG HARIYADI, SE, MM', jabatan: 'Sekretaris DPRD', bidang: 'Sekretariat DPRD' },
  { id: '2', nama: 'Drs. Bambang Setiawan, M.Si', jabatan: 'Kepala Bagian Umum', bidang: 'Bagian Umum' },
  { id: '3', nama: 'Hj. Sri Wahyuni, S.H', jabatan: 'Kepala Bagian Hubungan Masyarakat', bidang: 'Bagian Humas' },
  { id: '4', nama: 'Ir. Eko Nugroho, M.T', jabatan: 'Kepala Bagian Persidangan', bidang: 'Bagian Persidangan' },
  { id: '5', nama: 'Dra. Endah Kusumastuti', jabatan: 'Kepala Sub Bagian Keuangan', bidang: 'Keuangan' },
  { id: '6', nama: 'Ahmad Fauzi, S.E', jabatan: 'Bendahara Pengeluaran', bidang: 'Keuangan' },
  { id: '7', nama: 'Yuliana Dewi, A.Md', jabatan: 'Staf Persidangan', bidang: 'Bagian Persidangan' },
  { id: '8', nama: 'Rudi Hartanto, S.Sos', jabatan: 'Staf Hubungan Masyarakat', bidang: 'Bagian Humas' },
];

export interface BidangData {
  id: string;
  nama: string;
  pagu: number;
  kegiatan: KegiatanData[];
}

export interface KegiatanData {
  id: string;
  nama: string;
  paguDefault: number;
  subKegiatan: SubKegiatanTemplate[];
}

export interface SubSubKegiatanData {
  id: string;
  nama: string;
  pagu: number;
}

export interface SubKegiatanTemplate {
  id: string;
  nama: string;
  pagu: number;
  subSubKegiatan?: SubSubKegiatanData[];
}

// Sumber: E-controlling 2026 Rekap Progres Agenda – Sekretariat DPRD Provinsi Jawa Tengah
export const masterBidang: BidangData[] = [
  {
    id: 'bid-1',
    nama: 'Sekretariat DPRD',
    pagu: 168_376_593_000,
    kegiatan: [
      {
        id: 'sub-1',
        nama: 'Perencanaan & Evaluasi Kinerja',
        paguDefault: 712_581_000,
        subKegiatan: [
          { id: 'k-1', nama: 'Penyusunan Dokumen Perencanaan Perangkat Daerah', pagu: 442_601_000 },
          { id: 'k-2', nama: 'Evaluasi Kinerja Perangkat Daerah', pagu: 219_980_000 },
          { id: 'k-3', nama: 'Pengumpulan Data Statistik Sektoral Daerah', pagu: 25_000_000 },
          { id: 'k-4', nama: 'Penyelenggaraan Walidata Pendukung Statistik', pagu: 25_000_000 },
        ],
      },
      {
        id: 'sub-2',
        nama: 'Administrasi Keuangan Perangkat Daerah',
        paguDefault: 19_550_589_000,
        subKegiatan: [
          { id: 'k-5', nama: 'Penyediaan Gaji dan Tunjangan ASN', pagu: 18_570_007_000 },
          { id: 'k-6', nama: 'Penyediaan Administrasi Pelaksanaan Tugas ASN', pagu: 980_582_000 },
        ],
      },
      {
        id: 'sub-3',
        nama: 'Layanan Keuangan & Kesejahteraan DPRD',
        paguDefault: 148_113_423_000,
        subKegiatan: [
          { id: 'k-7', nama: 'Penyelenggaraan Administrasi Keuangan DPRD', pagu: 148_113_423_000 },
        ],
      },
    ],
  },
  {
    id: 'bid-2',
    nama: 'Bagian Umum',
    pagu: 58_216_639_000,
    kegiatan: [
      {
        id: 'sub-4',
        nama: 'Administrasi Umum Perangkat Daerah',
        paguDefault: 7_464_110_000,
        subKegiatan: [
          { id: 'k-8', nama: 'Penyediaan Komponen Instalasi Listrik / Penerangan', pagu: 244_485_000 },
          { id: 'k-9', nama: 'Penyediaan Bahan Logistik Kantor', pagu: 187_269_000 },
          { id: 'k-10', nama: 'Penyediaan Bahan Bacaan dan Peraturan Perundang-undangan', pagu: 96_565_000 },
          { id: 'k-11', nama: 'Fasilitasi Kunjungan Tamu', pagu: 6_141_465_000 },
          { id: 'k-12', nama: 'Rapat Koordinasi dan Konsultasi SKPD', pagu: 672_366_000 },
          { id: 'k-13', nama: 'Penatausahaan Arsip Dinamis pada SKPD', pagu: 121_960_000 },
        ],
      },
      {
        id: 'sub-5',
        nama: 'Administrasi Kepegawaian',
        paguDefault: 471_428_000,
        subKegiatan: [
          { id: 'k-14', nama: 'Pendataan dan Pengolahan Administrasi Kepegawaian', pagu: 141_168_000 },
          { id: 'k-15', nama: 'Pendidikan dan Pelatihan Pegawai', pagu: 330_260_000 },
        ],
      },
      {
        id: 'sub-6',
        nama: 'Pengadaan Barang Milik Daerah',
        paguDefault: 10_309_086_000,
        subKegiatan: [
          { id: 'k-16', nama: 'Pengadaan Kendaraan Perorangan Dinas / Jabatan', pagu: 4_002_240_000 },
          { id: 'k-17', nama: 'Pengadaan Mebel', pagu: 2_048_833_000 },
          { id: 'k-18', nama: 'Pengadaan Peralatan dan Mesin Lainnya', pagu: 1_443_188_000 },
          { id: 'k-19', nama: 'Pengadaan Sarana dan Prasarana Gedung Kantor', pagu: 2_814_825_000 },
        ],
      },
      {
        id: 'sub-7',
        nama: 'Pemeliharaan Barang Milik Daerah',
        paguDefault: 11_282_023_000,
        subKegiatan: [
          { id: 'k-20', nama: 'Pemeliharaan Kendaraan Dinas Jabatan', pagu: 596_253_000 },
          { id: 'k-21', nama: 'Pemeliharaan Kendaraan Dinas Operasional', pagu: 2_712_428_000 },
          { id: 'k-22', nama: 'Pemeliharaan Mebel', pagu: 86_425_000 },
          { id: 'k-23', nama: 'Pemeliharaan / Rehabilitasi Gedung Kantor', pagu: 5_191_084_000 },
          { id: 'k-24', nama: 'Pemeliharaan / Rehabilitasi Sarana Prasarana Gedung', pagu: 2_695_833_000 },
        ],
      },
      {
        id: 'sub-8',
        nama: 'Penyediaan Jasa Penunjang',
        paguDefault: 28_689_992_000,
        subKegiatan: [
          { id: 'k-25', nama: 'Penyediaan Jasa Surat Menyurat', pagu: 145_708_000 },
          { id: 'k-26', nama: 'Penyediaan Jasa Komunikasi, Air dan Listrik', pagu: 4_474_000_000 },
          { id: 'k-27', nama: 'Penyediaan Jasa Peralatan dan Perlengkapan Kantor', pagu: 900_761_000 },
          { id: 'k-28', nama: 'Penyediaan Jasa Pelayanan Umum Kantor', pagu: 23_169_523_000 },
        ],
      },
    ],
  },
  {
    id: 'bid-3',
    nama: 'Bagian Humas',
    pagu: 231_584_388_000,
    kegiatan: [
      {
        id: 'sub-9',
        nama: 'Peningkatan Kapasitas DPRD',
        paguDefault: 130_044_388_000,
        subKegiatan: [
          { id: 'k-29', nama: 'Penyediaan Kelompok Pakar dan Tim Ahli', pagu: 1_939_086_000 },
          { id: 'k-30', nama: 'Penyediaan Tenaga Ahli Fraksi', pagu: 418_741_000 },
          { id: 'k-31', nama: 'Penyelenggaraan Hubungan Masyarakat', pagu: 12_166_561_000 },
          { id: 'k-32', nama: 'Penyusunan Program Kerja DPRD', pagu: 115_520_000_000 },
        ],
      },
      {
        id: 'sub-10',
        nama: 'Pembahasan Kerja Sama Daerah',
        paguDefault: 101_540_000_000,
        subKegiatan: [
          { id: 'k-33', nama: 'Penyusunan Bahan Komunikasi dan Publikasi', pagu: 101_540_000_000 },
        ],
      },
    ],
  },
  {
    id: 'bid-4',
    nama: 'Bagian Persidangan',
    pagu: 97_960_085_000,
    kegiatan: [
      {
        id: 'sub-11',
        nama: 'Pembentukan Perda dan Peraturan DPRD',
        paguDefault: 7_206_440_000,
        subKegiatan: [
          { id: 'k-34', nama: 'Penyusunan dan Pembahasan Program Pembentukan Perda', pagu: 4_262_440_000 },
          { id: 'k-35', nama: 'Sosialisasi Peraturan Daerah Bersama DPRD & Pemerintah', pagu: 2_944_000_000 },
        ],
      },
      {
        id: 'sub-12',
        nama: 'Pembahasan Kebijakan Anggaran',
        paguDefault: 2_210_534_000,
        subKegiatan: [
          { id: 'k-36', nama: 'Pembahasan APBD', pagu: 2_210_534_000 },
        ],
      },
      {
        id: 'sub-13',
        nama: 'Pengawasan Penyelenggaraan Pemerintahan',
        paguDefault: 12_515_582_000,
        subKegiatan: [
          { id: 'k-37', nama: 'Pengawasan Bidang Pemerintahan dan Hukum', pagu: 1_850_000_000 },
          { id: 'k-38', nama: 'Pengawasan Bidang Infrastruktur', pagu: 1_850_000_000 },
          { id: 'k-39', nama: 'Pengawasan Bidang Kesejahteraan Rakyat', pagu: 1_850_000_000 },
          { id: 'k-40', nama: 'Pengawasan Bidang Perekonomian', pagu: 1_850_000_000 },
          { id: 'k-41', nama: 'Pengawasan Bidang Sumber Daya Alam', pagu: 1_850_000_000 },
          { id: 'k-42', nama: 'Pengawasan Penggunaan Anggaran', pagu: 2_095_860_000 },
          { id: 'k-43', nama: 'Pengawasan Tindak Lanjut Hasil Pemeriksaan BPK', pagu: 1_169_722_000 },
        ],
      },
      {
        id: 'sub-14',
        nama: 'Penyerapan Aspirasi Masyarakat',
        paguDefault: 49_184_524_000,
        subKegiatan: [
          { id: 'k-44', nama: 'Kunjungan Kerja dalam Daerah', pagu: 10_402_980_000 },
          { id: 'k-45', nama: 'Penyusunan Pokok-Pokok Pikiran DPRD', pagu: 175_000_000 },
          { id: 'k-46', nama: 'Pelaksanaan Reses', pagu: 38_606_544_000 },
        ],
      },
      {
        id: 'sub-15',
        nama: 'Peningkatan Kapasitas & Kode Etik DPRD',
        paguDefault: 5_532_000_000,
        subKegiatan: [
          { id: 'k-47', nama: 'Pendalaman Tugas DPRD', pagu: 4_380_000_000 },
          { id: 'k-48', nama: 'Penyusunan Kode Etik DPRD', pagu: 1_152_000_000 },
        ],
      },
      {
        id: 'sub-16',
        nama: 'Fasilitasi Tugas DPRD',
        paguDefault: 21_311_005_000,
        subKegiatan: [
          { id: 'k-49', nama: 'Koordinasi dan Konsultasi Pelaksanaan Tugas DPRD', pagu: 21_311_005_000 },
        ],
      },
    ],
  },
  {
    id: 'bid-5',
    nama: 'Keuangan',
    pagu: 168_376_593_000,
    kegiatan: [
      {
        id: 'sub-17',
        nama: 'Administrasi Keuangan',
        paguDefault: 19_550_589_000,
        subKegiatan: [
          { id: 'k-50', nama: 'Penyediaan Gaji dan Tunjangan ASN', pagu: 18_570_007_000 },
          { id: 'k-51', nama: 'Penyediaan Administrasi Pelaksanaan Tugas ASN', pagu: 980_582_000 },
        ],
      },
      {
        id: 'sub-18',
        nama: 'Layanan Keuangan DPRD',
        paguDefault: 148_113_423_000,
        subKegiatan: [
          { id: 'k-52', nama: 'Penyelenggaraan Administrasi Keuangan DPRD', pagu: 148_113_423_000 },
        ],
      },
      {
        id: 'sub-19',
        nama: 'Pelaporan & Akuntabilitas',
        paguDefault: 712_581_000,
        subKegiatan: [
          { id: 'k-53', nama: 'Penyusunan Dokumen Perencanaan Perangkat Daerah', pagu: 442_601_000 },
          { id: 'k-54', nama: 'Evaluasi Kinerja Perangkat Daerah', pagu: 219_980_000 },
        ],
      },
    ],
  },
];

export const sumberDanaList = [
  'APBD Provinsi',
  'APBD Kabupaten/Kota',
  'APBN',
  'Dana Alokasi Khusus (DAK)',
  'Dana Alokasi Umum (DAU)',
  'Dana Bagi Hasil (DBH)',
  'Dana Insentif Daerah (DID)',
  'Hibah',
];

export interface KegiatanStep {
  id: string;
  nama: string;
  selesai: boolean;
}

export interface SubKegiatan {
  id: string;
  nama: string;
  bidang: string;
  kegiatan_parent: string;
  subKegiatan_parent: string; // alias kegiatan_parent untuk kompatibilitas UI
  penanggungJawab: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'Belum Mulai' | 'Berjalan' | 'Selesai' | 'Overdue' | 'Terlambat';
  progress: number;
  paguAnggaran: number;
  realisasiAnggaran: number;
  deskripsi: string;
  step: 'Persiapan' | 'Koordinasi' | 'Pelaksanaan' | 'Evaluasi' | 'Verifikasi' | 'Closed';
  steps: KegiatanStep[];
  isWadah?: boolean;
  isApproved?: boolean;
  sumberDana?: string;
  anggaranDiminta?: number;
}

export interface Bagian {
  id: string;
  nama: string;
  progress: number;
  warna: string;
}

// Progress berdasarkan Realisasi Fisik S/D Mei 2026 (sumber: E-Controlling 2026)
// bagianList dynamically derived at the bottom of the file

// kegiatanList dynamically derived at the bottom of the file

export const notifikasiList = [
  {
    id: '1',
    type: 'overdue' as const,
    title: '7 kegiatan incidental / overdue',
    message: 'Segera lakukan tindak lanjut oleh Operator Bidang',
    time: '7 jam yang lalu',
  },
  {
    id: '2',
    type: 'belumSelesai' as const,
    title: '16 target belum diselesaikan',
    message: 'Segera lakukan tindak lanjut oleh Operator Bidang',
    time: '3 jam yang lalu',
  },
  {
    id: '3',
    type: 'deadline' as const,
    title: 'Sidang Paripurna hari ini pukul 10.00 WIB',
    message: 'Segera pastikan di Auditorium DPRD tentang rencana...',
    time: '2 jam yang lalu',
  },
  {
    id: '4',
    type: 'selesai' as const,
    title: 'Laporan kegiatan minggu lalu',
    message: 'Klik untuk melihat laporan dokumen',
    time: '1 hari yang lalu',
  },
];

// agendaHariIni dynamically derived at the bottom of the file

// kegiatanPerBagian dynamically derived at the bottom of the file

export const kegiatanPrioritas = [
  { id: '1', nama: 'Pembahasan Raperda APBD 2025-2029', komisi: 'Pimpinan', tanggal: '12 Mei 2025', progress: 100, status: 'Selesai' as const },
  { id: '2', nama: 'Publikasi & Dokumentasi Kegiatan', komisi: 'Komisi A', tanggal: '20 Mei 2025', progress: 45, status: 'Berjalan' as const },
];

export const kalenderEvents = [
  { date: '2025-06-02', title: 'Kunjungan Kerja', color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2025-06-10', title: 'Rapat Pimpinan Internal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { date: '2025-06-12', title: 'Sidang Paripurna', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { date: '2025-06-13', title: 'Sidang Paripurna', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { date: '2025-06-15', title: 'Sidang Paripurna', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { date: '2025-06-18', title: 'Kunjungan Kerja & Evaluasi', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { date: '2025-06-20', title: 'Hari Libur Nasional', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { date: '2025-06-22', title: 'Kunjungan Kerja Daerah Pemilihan', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { date: '2025-06-27', title: 'Kunjungan Kerja Ahli', color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2025-06-28', title: 'Kunjungan Kerja', color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2025-06-31', title: 'Masa Reses 2025', color: 'bg-red-100 text-red-700 border-red-200' },
];

// ─── ANGGARAN BULANAN ───────────────────────────────────────────────────────

export interface MonthlyBudget {
  bulan: string;
  singkatan: string;
  pagu: number;        // = totalPagu / 12
  realisasi: number;
  persentase: number;  // realisasi / pagu * 100
}

export interface UraianAnggaran {
  kode: string;
  uraian: string;
  level: 1 | 2 | 3 | 4; // 1=bidang, 2=subbidang, 3=kegiatan, 4=sub kegiatan
  target: number;
  realisasi: number;
}

// Sumber: E-Controlling 2026 – Total Anggaran Sekretariat DPRD Provinsi Jawa Tengah
export const PAGU_TOTAL = 559_427_180_000;

export const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

// Realisasi per bulan – estimasi dari total s/d Mei Rp 246.791.918.544
// (sumber: E-Controlling 2026, rata-rata ≈ Rp 49,4M per bulan)
export const realisasiPerBulan: number[] = [
  47_300_000_000, // Jan
  49_100_000_000, // Feb
  51_200_000_000, // Mar
  52_700_000_000, // Apr
  46_492_000_000, // Mei (real: Rp 47.461.572.961 bulan berjalan)
  0,              // Jun (belum)
  0, 0, 0, 0, 0, 0,
];

export function buildMonthlyBudget(paguTotal: number, realisasi: number[]): MonthlyBudget[] {
  const paguPerBulan = Math.round(paguTotal / 12);
  return BULAN_NAMES.map((bulan, i) => ({
    bulan,
    singkatan: BULAN_SINGKAT[i],
    pagu: paguPerBulan,
    realisasi: realisasi[i] ?? 0,
    persentase: realisasi[i] ? Math.round((realisasi[i] / paguPerBulan) * 100) : 0,
  }));
}

// Uraian anggaran – data nyata dari E-Controlling 2026, Sekretariat DPRD Prov. Jawa Tengah, s/d Mei 2026
export const uraianAnggaran: UraianAnggaran[] = [
  // ── 1. SEKRETARIAT DPRD (Sekretariat) ──────────────────────────────────────
  { kode: '1', uraian: 'Sekretariat DPRD', level: 1, target: 168_376_593_000, realisasi: 66_460_655_669 },
  { kode: '1.1', uraian: 'Perencanaan, Penganggaran & Evaluasi Kinerja', level: 2, target: 712_581_000, realisasi: 436_597_100 },
  { kode: '1.1.1', uraian: 'Penyusunan Dokumen Perencanaan Perangkat Daerah', level: 3, target: 442_601_000, realisasi: 300_242_400 },
  { kode: '1.1.1.1', uraian: 'Dokumen perencanaan perangkat daerah ASB', level: 4, target: 11_082_000, realisasi: 1_200_000 },
  { kode: '1.1.1.2', uraian: 'Dokumen perencanaan perangkat daerah bukan ASB', level: 4, target: 431_519_000, realisasi: 299_042_400 },
  { kode: '1.1.2', uraian: 'Evaluasi Kinerja Perangkat Daerah', level: 3, target: 219_980_000, realisasi: 133_066_700 },
  { kode: '1.1.2.1', uraian: 'Laporan evaluasi kinerja perangkat daerah', level: 4, target: 219_980_000, realisasi: 133_066_700 },
  { kode: '1.1.3', uraian: 'Pengumpulan Data Statistik Sektoral Daerah', level: 3, target: 25_000_000, realisasi: 0 },
  { kode: '1.1.4', uraian: 'Penyelenggaraan Walidata Pendukung Statistik Sektoral', level: 3, target: 25_000_000, realisasi: 3_288_000 },
  { kode: '1.2', uraian: 'Administrasi Keuangan Perangkat Daerah', level: 2, target: 19_550_589_000, realisasi: 8_223_751_698 },
  { kode: '1.2.1', uraian: 'Penyediaan Gaji dan Tunjangan ASN', level: 3, target: 18_570_007_000, realisasi: 7_789_297_798 },
  { kode: '1.2.1.1', uraian: 'Orang yang menerima gaji dan tunjangan ASN', level: 4, target: 18_570_007_000, realisasi: 7_789_297_798 },
  { kode: '1.2.2', uraian: 'Penyediaan Administrasi Pelaksanaan Tugas ASN', level: 3, target: 980_582_000, realisasi: 434_453_900 },
  { kode: '1.2.2.1', uraian: 'Dokumen hasil penyediaan administrasi pelaksanaan tugas ASN', level: 4, target: 980_582_000, realisasi: 434_453_900 },
  { kode: '1.3', uraian: 'Layanan Keuangan dan Kesejahteraan DPRD', level: 2, target: 148_113_423_000, realisasi: 57_800_306_871 },
  { kode: '1.3.1', uraian: 'Penyelenggaraan Administrasi Keuangan DPRD', level: 3, target: 148_113_423_000, realisasi: 57_800_306_871 },
  { kode: '1.3.1.1', uraian: 'Anggota DPRD yang menerima hak keuangan DPRD', level: 4, target: 148_113_423_000, realisasi: 57_800_306_871 },

  // ── 2. BAGIAN UMUM ────────────────────────────────────────────────────────
  { kode: '2', uraian: 'Bagian Umum', level: 1, target: 61_506_114_000, realisasi: 22_812_821_138 },
  { kode: '2.1', uraian: 'Administrasi Barang Milik Daerah', level: 2, target: 1_330_474_000, realisasi: 422_997_547 },
  { kode: '2.1.1', uraian: 'Pengamanan Barang Milik Daerah SKPD', level: 3, target: 1_330_474_000, realisasi: 422_997_547 },
  { kode: '2.1.1.1', uraian: 'Dokumen pengamanan barang milik daerah', level: 4, target: 1_330_474_000, realisasi: 422_997_547 },
  { kode: '2.2', uraian: 'Administrasi Kepegawaian Perangkat Daerah', level: 2, target: 471_428_000, realisasi: 52_919_800 },
  { kode: '2.2.1', uraian: 'Pendataan dan Pengolahan Administrasi Kepegawaian', level: 3, target: 141_168_000, realisasi: 52_919_800 },
  { kode: '2.2.1.1', uraian: 'Pendataan dan Pengolahan Administrasi Kepegawaian', level: 4, target: 141_168_000, realisasi: 52_919_800 },
  { kode: '2.2.2', uraian: 'Pendidikan dan Pelatihan Pegawai', level: 3, target: 330_260_000, realisasi: 0 },
  { kode: '2.2.2.1', uraian: 'Pegawai yang mengikuti pendidikan dan pelatihan', level: 4, target: 330_260_000, realisasi: 0 },
  { kode: '2.3', uraian: 'Administrasi Umum Perangkat Daerah', level: 2, target: 7_464_110_000, realisasi: 3_180_609_525 },
  { kode: '2.3.1', uraian: 'Penyediaan Komponen Instalasi Listrik / Penerangan', level: 3, target: 244_485_000, realisasi: 93_495_800 },
  { kode: '2.3.2', uraian: 'Penyediaan Bahan Logistik Kantor', level: 3, target: 187_269_000, realisasi: 75_079_300 },
  { kode: '2.3.3', uraian: 'Penyediaan Bahan Bacaan dan Peraturan Perundang-undangan', level: 3, target: 96_565_000, realisasi: 59_968_350 },
  { kode: '2.3.4', uraian: 'Fasilitasi Kunjungan Tamu', level: 3, target: 6_141_465_000, realisasi: 2_518_246_300 },
  { kode: '2.3.4.1', uraian: 'Laporan fasilitasi kunjungan tamu', level: 4, target: 6_141_465_000, realisasi: 2_518_246_300 },
  { kode: '2.3.5', uraian: 'Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD', level: 3, target: 672_366_000, realisasi: 328_210_575 },
  { kode: '2.3.5.1', uraian: 'Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD', level: 4, target: 672_366_000, realisasi: 328_210_575 },
  { kode: '2.3.6', uraian: 'Penatausahaan Arsip Dinamis pada SKPD', level: 3, target: 121_960_000, realisasi: 105_609_200 },
  { kode: '2.4', uraian: 'Pengadaan Barang Milik Daerah Penunjang', level: 2, target: 10_309_086_000, realisasi: 6_403_957_855 },
  { kode: '2.4.1', uraian: 'Pengadaan Kendaraan Perorangan Dinas / Jabatan', level: 3, target: 4_002_240_000, realisasi: 3_943_200_004 },
  { kode: '2.4.2', uraian: 'Pengadaan Mebel', level: 3, target: 2_048_833_000, realisasi: 26_375_000 },
  { kode: '2.4.3', uraian: 'Pengadaan Peralatan dan Mesin Lainnya', level: 3, target: 1_443_188_000, realisasi: 1_326_273_001 },
  { kode: '2.4.4', uraian: 'Pengadaan Sarana dan Prasarana Gedung Kantor', level: 3, target: 2_814_825_000, realisasi: 1_108_109_850 },
  { kode: '2.5', uraian: 'Penyediaan Jasa Penunjang Urusan Pemerintahan', level: 2, target: 28_689_992_000, realisasi: 9_374_333_179 },
  { kode: '2.5.1', uraian: 'Penyediaan Jasa Surat Menyurat', level: 3, target: 145_708_000, realisasi: 49_392_600 },
  { kode: '2.5.2', uraian: 'Penyediaan Jasa Komunikasi, Air dan Listrik', level: 3, target: 4_474_000_000, realisasi: 1_151_370_595 },
  { kode: '2.5.3', uraian: 'Penyediaan Jasa Peralatan dan Perlengkapan Kantor', level: 3, target: 900_761_000, realisasi: 414_955_000 },
  { kode: '2.5.4', uraian: 'Penyediaan Jasa Pelayanan Umum Kantor', level: 3, target: 23_169_523_000, realisasi: 7_758_614_984 },
  { kode: '2.5.4.1', uraian: 'Penyediaan Jasa Pelayanan Umum Kantor', level: 4, target: 20_134_371_484, realisasi: 6_601_605_496 },
  { kode: '2.5.4.2', uraian: 'Gaji PPPK Paruh Waktu Bagian Keuangan', level: 4, target: 180_000_000, realisasi: 75_000_000 },
  { kode: '2.5.4.3', uraian: 'Gaji PPPK Paruh Waktu Bagian Humas', level: 4, target: 925_380_000, realisasi: 326_150_000 },
  { kode: '2.5.4.4', uraian: 'Gaji PPPK Paruh Waktu Bagian Persidangan', level: 4, target: 86_460_000, realisasi: 36_025_000 },
  { kode: '2.5.4.5', uraian: 'Gaji PPPK Paruh Waktu Bagian Umum', level: 4, target: 1_658_400_000, realisasi: 675_053_333 },
  { kode: '2.6', uraian: 'Pemeliharaan Barang Milik Daerah Penunjang', level: 2, target: 11_282_023_000, realisasi: 2_871_833_232 },
  { kode: '2.6.1', uraian: 'Pemeliharaan Kendaraan Dinas Jabatan', level: 3, target: 596_253_000, realisasi: 244_867_099 },
  { kode: '2.6.2', uraian: 'Pemeliharaan Kendaraan Dinas Operasional', level: 3, target: 2_712_428_000, realisasi: 1_054_638_686 },
  { kode: '2.6.3', uraian: 'Pemeliharaan Mebel', level: 3, target: 86_425_000, realisasi: 50_140_000 },
  { kode: '2.6.4', uraian: 'Pemeliharaan / Rehabilitasi Gedung Kantor', level: 3, target: 5_191_084_000, realisasi: 380_988_447 },
  { kode: '2.6.5', uraian: 'Pemeliharaan / Rehabilitasi Sarana Prasarana Gedung', level: 3, target: 2_695_833_000, realisasi: 1_141_199_000 },
  { kode: '2.7', uraian: 'Layanan Keuangan dan Kesejahteraan DPRD (Umum)', level: 2, target: 1_959_001_000, realisasi: 506_170_000 },
  { kode: '2.7.1', uraian: 'Penyediaan Pakaian Dinas dan Atribut DPRD', level: 3, target: 1_392_880_000, realisasi: 506_170_000 },
  { kode: '2.7.2', uraian: 'Pelaksanaan Medical Check Up DPRD', level: 3, target: 566_121_000, realisasi: 0 },

  // ── 3. BAGIAN HUMAS ─────────────────────────────────────────
  { kode: '3', uraian: 'Bagian Humas', level: 1, target: 231_584_388_000, realisasi: 121_817_534_227 },
  { kode: '3.1', uraian: 'Peningkatan Kapasitas DPRD', level: 2, target: 130_044_388_000, realisasi: 68_041_841_227 },
  { kode: '3.1.1', uraian: 'Penyediaan Kelompok Pakar dan Tim Ahli', level: 3, target: 1_939_086_000, realisasi: 776_400_000 },
  { kode: '3.1.1.1', uraian: 'Orang dalam kelompok pakar dan tim ahli', level: 4, target: 1_939_086_000, realisasi: 776_400_000 },
  { kode: '3.1.2', uraian: 'Penyediaan Tenaga Ahli Fraksi', level: 3, target: 418_741_000, realisasi: 150_527_446 },
  { kode: '3.1.2.1', uraian: 'Tenaga Ahli Fraksi', level: 4, target: 418_741_000, realisasi: 150_527_446 },
  { kode: '3.1.3', uraian: 'Penyelenggaraan Hubungan Masyarakat', level: 3, target: 12_166_561_000, realisasi: 5_019_026_794 },
  { kode: '3.1.3.1', uraian: 'Dokumen hasil penyelenggaraan hubungan masyarakat', level: 4, target: 12_166_561_000, realisasi: 5_019_026_794 },
  { kode: '3.1.4', uraian: 'Penyusunan Program Kerja DPRD', level: 3, target: 115_520_000_000, realisasi: 62_095_886_987 },
  { kode: '3.1.4.1', uraian: 'Dokumen rencana kerja DPRD', level: 4, target: 115_520_000_000, realisasi: 62_095_886_987 },
  { kode: '3.2', uraian: 'Pembahasan Kerja Sama Daerah', level: 2, target: 101_540_000_000, realisasi: 53_775_693_000 },
  { kode: '3.2.1', uraian: 'Penyusunan Bahan Komunikasi dan Publikasi', level: 3, target: 101_540_000_000, realisasi: 53_775_693_000 },
  { kode: '3.2.1.1', uraian: 'Dokumen bahan komunikasi dan publikasi yang disusun', level: 4, target: 101_540_000_000, realisasi: 53_775_693_000 },

  // ── 4. BAGIAN PERSIDANGAN ─────────────────────────────────────────────────
  { kode: '4', uraian: 'Bagian Persidangan', level: 1, target: 97_960_085_000, realisasi: 35_700_907_510 },
  { kode: '4.1', uraian: 'Pembentukan Perda dan Peraturan DPRD', level: 2, target: 7_206_440_000, realisasi: 3_595_312_350 },
  { kode: '4.1.1', uraian: 'Penyusunan dan Pembahasan Program Pembentukan Perda', level: 3, target: 4_262_440_000, realisasi: 1_845_412_350 },
  { kode: '4.1.1.1', uraian: 'Dokumen hasil penyusunan dan pembahasan Raperda', level: 4, target: 4_262_440_000, realisasi: 1_845_412_350 },
  { kode: '4.1.2', uraian: 'Sosialisasi Peraturan Daerah Bersama DPRD dan Pemda', level: 3, target: 2_944_000_000, realisasi: 1_749_900_000 },
  { kode: '4.1.2.1', uraian: 'Orang yang mengikuti sosialisasi Peraturan Daerah', level: 4, target: 2_944_000_000, realisasi: 1_749_900_000 },
  { kode: '4.2', uraian: 'Pembahasan Kebijakan Anggaran', level: 2, target: 2_210_534_000, realisasi: 732_551_337 },
  { kode: '4.2.1', uraian: 'Pembahasan APBD', level: 3, target: 2_210_534_000, realisasi: 732_551_337 },
  { kode: '4.2.1.1', uraian: 'Dokumen hasil pembahasan APBD', level: 4, target: 2_210_534_000, realisasi: 732_551_337 },
  { kode: '4.3', uraian: 'Pengawasan Penyelenggaraan Pemerintahan', level: 2, target: 12_515_582_000, realisasi: 3_230_867_990 },
  { kode: '4.3.1', uraian: 'Pengawasan Bidang Pemerintahan dan Hukum', level: 3, target: 1_850_000_000, realisasi: 472_633_700 },
  { kode: '4.3.2', uraian: 'Pengawasan Bidang Infrastruktur', level: 3, target: 1_850_000_000, realisasi: 512_038_000 },
  { kode: '4.3.3', uraian: 'Pengawasan Bidang Kesejahteraan Rakyat', level: 3, target: 1_850_000_000, realisasi: 595_962_300 },
  { kode: '4.3.4', uraian: 'Pengawasan Bidang Perekonomian', level: 3, target: 1_850_000_000, realisasi: 529_423_550 },
  { kode: '4.3.5', uraian: 'Pengawasan Bidang Sumber Daya Alam', level: 3, target: 1_850_000_000, realisasi: 640_537_900 },
  { kode: '4.3.6', uraian: 'Pengawasan Tindak Lanjut Hasil Pemeriksaan BPK', level: 3, target: 1_169_722_000, realisasi: 0 },
  { kode: '4.3.7', uraian: 'Pengawasan Penggunaan Anggaran', level: 3, target: 2_095_860_000, realisasi: 480_272_540 },
  { kode: '4.4', uraian: 'Peningkatan Kapasitas DPRD (Persidangan)', level: 2, target: 4_380_000_000, realisasi: 818_416_022 },
  { kode: '4.4.1', uraian: 'Pendalaman Tugas DPRD', level: 3, target: 4_380_000_000, realisasi: 818_416_022 },
  { kode: '4.4.1.1', uraian: 'Dokumen hasil Pendalaman Tugas DPRD', level: 4, target: 4_380_000_000, realisasi: 818_416_022 },
  { kode: '4.5', uraian: 'Penyerapan dan Penghimpunan Aspirasi Masyarakat', level: 2, target: 49_184_524_000, realisasi: 15_784_115_600 },
  { kode: '4.5.1', uraian: 'Kunjungan Kerja dalam Daerah', level: 3, target: 10_402_980_000, realisasi: 3_745_743_400 },
  { kode: '4.5.1.1', uraian: 'Laporan hasil Kunjungan Kerja DPRD', level: 4, target: 10_402_980_000, realisasi: 3_745_743_400 },
  { kode: '4.5.2', uraian: 'Penyusunan Pokok-Pokok Pikiran DPRD', level: 3, target: 175_000_000, realisasi: 0 },
  { kode: '4.5.3', uraian: 'Pelaksanaan Reses', level: 3, target: 38_606_544_000, realisasi: 12_038_372_200 },
  { kode: '4.5.3.1', uraian: 'Dokumen hasil pelaksanaan Reses', level: 4, target: 38_606_544_000, realisasi: 12_038_372_200 },
  { kode: '4.6', uraian: 'Pelaksanaan dan Pengawasan Kode Etik DPRD', level: 2, target: 1_152_000_000, realisasi: 532_650_000 },
  { kode: '4.6.1', uraian: 'Penyusunan Kode Etik DPRD', level: 3, target: 1_152_000_000, realisasi: 532_650_000 },
  { kode: '4.7', uraian: 'Fasilitasi Tugas DPRD', level: 2, target: 21_311_005_000, realisasi: 11_006_994_211 },
  { kode: '4.7.1', uraian: 'Koordinasi dan Konsultasi Pelaksanaan Tugas DPRD', level: 3, target: 21_311_005_000, realisasi: 11_006_994_211 },
  { kode: '4.7.1.1', uraian: 'Dokumen hasil Koordinasi dan Konsultasi Pelaksanaan Tugas', level: 4, target: 21_311_005_000, realisasi: 11_006_994_211 },
];

// ── SSOT Wrapper & Helper Functions ──────────────────────────────────────────
export let uraianAnggaranData = [...uraianAnggaran];

export function addUraianItem(newItem: UraianAnggaran) {
  uraianAnggaranData = [...uraianAnggaranData, newItem];
}

export function addRealisasi(kode: string, amount: number) {
  let currentKode = kode;
  const newData = [...uraianAnggaranData];

  while (currentKode) {
    const index = newData.findIndex(u => u.kode === currentKode);
    if (index !== -1) {
      newData[index] = {
        ...newData[index],
        realisasi: newData[index].realisasi + amount
      };
    }
    const parts = currentKode.split('.');
    parts.pop();
    currentKode = parts.join('.');
  }

  uraianAnggaranData = newData;
}

// ─── DATA DETAIL SUB-SUB KEGIATAN (SSK) MOCKUP ────────────────────────────

export interface SSKBulanan {
  target: number;
  realisasi: number;
}

export interface DetailSSK {
  id: string;
  kodeSubKegiatan: string; // referensi ke uraianAnggaran level 4
  opd: string;
  bidang: string;
  program: string;
  kegiatan: string;
  subKegiatan: string;
  paguApbd: number;
  totalRab: number;
  paguVerifikasi: number;
  uraianSsk: string;
  indikator: string;
  jenis: string;
  sumberAnggaran: string;
  jenisIku: string;
  bobot: number;
  statusSesuai: boolean;
  statusSelesai: boolean;
  bulanan: SSKBulanan[]; // Array 12 elemen (Jan-Des)
}

export const detailSSKMock: DetailSSK = {
  id: 'ssk-1',
  kodeSubKegiatan: '4.3.3.1', // Mock kode level 4
  opd: 'Sekretariat DPRD',
  bidang: 'Bagian Persidangan',
  program: 'PROGRAM DUKUNGAN PELAKSANAAN TUGAS...',
  kegiatan: 'Pengawasan Penyelenggaraan Pemerinta...',
  subKegiatan: 'Pengawasan Urusan Pemerintahan Bidang Kesejahteraan Rakyat',
  paguApbd: 1850000000,
  totalRab: 1850000000,
  paguVerifikasi: 1850000000,
  uraianSsk: 'laporan hasil Pengawasan Urusan Pemerintahan Bidang Kesejahteraan Rakyat',
  indikator: 'Jumlah Laporan Pengawasan Urusan Pemerintahan Bidang Kesejahteraan Rakyat',
  jenis: 'NON FISIK',
  sumberAnggaran: 'PAD & DAU',
  jenisIku: 'Indeks Reformasi Birokrasi',
  bobot: 100,
  statusSesuai: false,
  statusSelesai: false,
  bulanan: [
    { target: 5.41, realisasi: 9.17 },
    { target: 8.49, realisasi: 8.83 },
    { target: 5.57, realisasi: 0.47 },
    { target: 6.22, realisasi: 6.22 },
    { target: 5.85, realisasi: 6.55 },
    { target: 8.27, realisasi: 0 },
    { target: 6.22, realisasi: 0 },
    { target: 8.49, realisasi: 0 },
    { target: 6.88, realisasi: 0 },
    { target: 11.18, realisasi: 0 },
    { target: 10.85, realisasi: 0 },
    { target: 15.27, realisasi: 0 }
  ]
};

// ─── DYNAMICALLY DERIVED MOCK LISTS FROM URAIAN ANGGARAN ────────────────────

export const bagianList: Bagian[] = uraianAnggaran
  .filter(u => u.level === 1)
  .map(u => {
    const progress = u.target > 0 ? Math.round((u.realisasi / u.target) * 100) : 0;
    let color = 'bg-gray-500';
    if (u.uraian.includes('Sekretariat')) color = 'bg-blue-500';
    if (u.uraian.includes('Umum')) color = 'bg-emerald-500';
    if (u.uraian.includes('Humas')) color = 'bg-orange-500';
    if (u.uraian.includes('Persidangan')) color = 'bg-purple-500';
    return {
      id: u.kode,
      nama: u.uraian,
      progress,
      warna: color
    };
  });

export const subKegiatanList: SubKegiatan[] = uraianAnggaran
  .filter(u => u.level === 3)
  .map((u, i) => {
    const subBidangKode = u.kode.split('.').slice(0, 2).join('.');
    const parentSubBidang = uraianAnggaran.find(x => x.kode === subBidangKode);
    const bidangKode = u.kode.split('.').slice(0, 1).join('.');
    const parentBidang = uraianAnggaran.find(x => x.kode === bidangKode);

    const progress = u.target > 0 ? Math.round((u.realisasi / u.target) * 100) : 0;
    const status = progress >= 100 ? 'Selesai' : progress > 0 ? 'Berjalan' : 'Belum Mulai';
    const step = progress >= 100 ? 'Closed' : progress > 50 ? 'Pelaksanaan' : 'Persiapan';

    return {
      id: u.kode,
      nama: u.uraian,
      bidang: parentBidang?.uraian || 'Unknown',
      kegiatan_parent: parentSubBidang?.uraian || 'Unknown',
      subKegiatan_parent: parentSubBidang?.uraian || 'Unknown',
      penanggungJawab: 'Pejabat Pembuat Komitmen',
      tanggalMulai: `${new Date().getFullYear()}-01-01`,
      tanggalSelesai: `${new Date().getFullYear()}-12-31`,
      status,
      progress,
      paguAnggaran: u.target,
      realisasiAnggaran: u.realisasi,
      deskripsi: `Pelaksanaan kegiatan ${u.uraian}`,
      step,
      steps: [
        { id: `s${i}-1`, nama: 'Persiapan', selesai: progress >= 20 },
        { id: `s${i}-2`, nama: 'Pelaksanaan', selesai: progress >= 60 },
        { id: `s${i}-3`, nama: 'Evaluasi', selesai: progress >= 100 },
        { id: `s${i}-4`, nama: 'Verifikasi Dokumen', selesai: false },
      ],
      isWadah: false,
      isApproved: true,
      sumberDana: 'APBD Provinsi',
      anggaranDiminta: u.target,
    };
  });

export const subKegiatanPerBagian = subKegiatanList.reduce((acc, k) => {
  if (!acc[k.bidang]) acc[k.bidang] = [];
  acc[k.bidang].push({
    id: k.id,
    nama: k.nama,
    tanggal: `${k.tanggalMulai} - ${k.tanggalSelesai}`,
    progress: k.progress,
    status: k.status,
    step: k.step
  });
  return acc;
}, {} as Record<string, { id: string; nama: string; tanggal: string; progress: number; status: string; step: string }[]>);

export const agendaHariIni = subKegiatanList.slice(0, 4).map((k, i) => ({
  id: k.id,
  waktu: `${9 + i}:00`,
  status: i < 2 ? 'berlangsung' as const : 'terjadwal' as const,
  nama: k.nama,
  lokasi: 'Ruang Rapat',
  badge: i < 2 ? 'Berlangsung' : 'Terjadwal',
}));

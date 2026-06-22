// Mock data untuk sistem dashboard monitoring DPRD

export const anggotaData = [
  { id: '1', nama: 'AGUNG HARIYADI, SE, MM', jabatan: 'Sekretaris DPRD', bidang: 'Sekretariat DPRD' },
  { id: '2', nama: 'Drs. Bambang Setiawan, M.Si', jabatan: 'Kepala Bagian Umum', bidang: 'Bagian Umum' },
  { id: '3', nama: 'Hj. Sri Wahyuni, S.H', jabatan: 'Kepala Bagian Hubungan Masyarakat', bidang: 'Bagian Humbg' },
  { id: '4', nama: 'Ir. Eko Nugroho, M.T', jabatan: 'Kepala Bagian Persidangan', bidang: 'Bagian Persidangan' },
  { id: '5', nama: 'Dra. Endah Kusumastuti', jabatan: 'Kepala Sub Bagian Keuangan', bidang: 'Keuangan' },
  { id: '6', nama: 'Ahmad Fauzi, S.E', jabatan: 'Bendahara Pengeluaran', bidang: 'Keuangan' },
  { id: '7', nama: 'Yuliana Dewi, A.Md', jabatan: 'Staf Persidangan', bidang: 'Bagian Persidangan' },
  { id: '8', nama: 'Rudi Hartanto, S.Sos', jabatan: 'Staf Hubungan Masyarakat', bidang: 'Bagian Humbg' },
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

export const PAGU_TOTAL = 559_427_180_000;

export const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

// Realisasi per bulan - estimasi dari total s/d Mei Rp 246.791.918.544
export const realisasiPerBulan = [
  47_300_000_000, // Jan
  49_100_000_000, // Feb
  51_200_000_000, // Mar
  52_700_000_000, // Apr
  46_492_000_000, // Mei
  0,              // Jun (belum)
  0, 0, 0, 0, 0, 0,
];

// Uraian anggaran - data nyata dari E-Controlling 2026, Sekretariat DPRD Prov. Jawa Tengah, s/d Mei 2026
export const uraianAnggaran = [
  // 1. SEKRETARIAT
  { kode: '1', uraian: 'Sekretariat DPRD', level: 1, target: 168_376_593_000, realisasi: 66_460_655_669 },
  { kode: '1.1', uraian: 'Perencanaan, Penganggaran & Evaluasi Kinerja', level: 2, target: 712_581_000, realisasi: 436_597_100 },
  { kode: '1.2', uraian: 'Administrasi Keuangan Perangkat Daerah', level: 2, target: 19_550_589_000, realisasi: 8_223_751_698 },
  { kode: '1.3', uraian: 'Layanan Keuangan dan Kesejahteraan DPRD', level: 2, target: 148_113_423_000, realisasi: 57_800_306_871 },

  // 2. BAGIAN UMUM
  { kode: '2', uraian: 'Bagian Umum', level: 1, target: 61_506_114_000, realisasi: 22_812_821_138 },
  { kode: '2.1', uraian: 'Administrasi Barang Milik Daerah', level: 2, target: 1_330_474_000, realisasi: 422_997_547 },
  { kode: '2.2', uraian: 'Administrasi Kepegawaian Perangkat Daerah', level: 2, target: 471_428_000, realisasi: 52_919_800 },
  { kode: '2.3', uraian: 'Administrasi Umum Perangkat Daerah', level: 2, target: 7_464_110_000, realisasi: 3_180_609_525 },
  { kode: '2.4', uraian: 'Pengadaan Barang Milik Daerah Penunjang', level: 2, target: 10_309_086_000, realisasi: 6_403_957_855 },
  { kode: '2.5', uraian: 'Penyediaan Jasa Penunjang Urusan Pemerintahan', level: 2, target: 28_689_992_000, realisasi: 9_374_333_179 },
  { kode: '2.6', uraian: 'Pemeliharaan Barang Milik Daerah Penunjang', level: 2, target: 11_282_023_000, realisasi: 2_871_833_232 },
  { kode: '2.7', uraian: 'Layanan Keuangan dan Kesejahteraan DPRD (Umum)', level: 2, target: 1_959_001_000, realisasi: 506_170_000 },

  // 3. BAGIAN HUMAS
  { kode: '3', uraian: 'Bagian Humbg', level: 1, target: 231_584_388_000, realisasi: 121_817_534_227 },
  { kode: '3.1', uraian: 'Peningkatan Kapasitas DPRD', level: 2, target: 130_044_388_000, realisasi: 68_041_841_227 },
  { kode: '3.2', uraian: 'Pembahasan Kerja Sama Daerah', level: 2, target: 101_540_000_000, realisasi: 53_775_693_000 },

  // 4. BAGIAN PERSIDANGAN
  { kode: '4', uraian: 'Bagian Persidangan', level: 1, target: 97_960_085_000, realisasi: 35_700_907_510 },
  { kode: '4.1', uraian: 'Pembentukan Perda dan Peraturan DPRD', level: 2, target: 7_206_440_000, realisasi: 3_595_312_350 },
  { kode: '4.2', uraian: 'Pembahasan Kebijakan Anggaran', level: 2, target: 2_210_534_000, realisasi: 732_551_337 },
  { kode: '4.3', uraian: 'Pengawasan Penyelenggaraan Pemerintahan', level: 2, target: 12_515_582_000, realisasi: 3_230_867_990 },
  { kode: '4.4', uraian: 'Peningkatan Kapasitas DPRD (Persidangan)', level: 2, target: 4_380_000_000, realisasi: 818_416_022 },
  { kode: '4.5', uraian: 'Penyerapan dan Penghimpunan Aspirasi Masyarakat', level: 2, target: 49_184_524_000, realisasi: 15_784_115_600 },
  { kode: '4.6', uraian: 'Pelaksanaan dan Pengawasan Kode Etik DPRD', level: 2, target: 1_152_000_000, realisasi: 532_650_000 },
  { kode: '4.7', uraian: 'Fasilitasi Tugas DPRD', level: 2, target: 21_311_005_000, realisasi: 11_006_994_211 },
];

export const notifikasiList = [
  { id: '1', type: 'overdue', title: '7 kegiatan incidental / overdue', message: 'Segera lakukan tindak lanjut oleh Operator Bidang', time: '7 jam yang lalu' },
  { id: '2', type: 'belumSelesai', title: '16 target belum diselesaikan', message: 'Segera lakukan tindak lanjut oleh Operator Bidang', time: '3 jam yang lalu' },
  { id: '3', type: 'deadline', title: 'Sidang Paripurng hari ini pukul 10.00 WIB', message: 'Segera pastikan di Auditorium DPRD tentang rencana...', time: '2 jam yang lalu' },
  { id: '4', type: 'selesai', title: 'Laporan kegiatan minggu lalu', message: 'Klik untuk melihat laporan dokumen', time: '1 hari yang lalu' },
];

export const kalenderEvents = [
  { date: '2025-06-02', title: 'Kunjungan Kerja', color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2025-06-10', title: 'Rapat Pimpinan Internal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { date: '2025-06-12', title: 'Sidang Paripurng', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { date: '2025-06-13', title: 'Sidang Paripurng', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { date: '2025-06-15', title: 'Sidang Paripurng', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { date: '2025-06-18', title: 'Kunjungan Kerja & Evaluasi', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { date: '2025-06-20', title: 'Hari Libur Nasional', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { date: '2025-06-22', title: 'Kunjungan Kerja Daerah Pemilihan', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { date: '2025-06-27', title: 'Kunjungan Kerja Ahli', color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2025-06-28', title: 'Kunjungan Kerja', color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2025-06-31', title: 'Masa Reses 2025', color: 'bg-red-100 text-red-700 border-red-200' },
];

// Sub Kegiatan List (derived from uraianAnggaran level 2)
export const subKegiatanList = uraianAnggaran
  .filter(u => u.level === 2)
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

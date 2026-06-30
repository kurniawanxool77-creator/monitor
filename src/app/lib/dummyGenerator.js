export function generateComplexDummyData() {
  const currentYear = 2026;

  // 1. MASTER BIDANG
  const bidangs = [
    { kode: '1', uraian: 'Sekretariat DPRD', level: 1, target: 200_000_000_000, realisasi: 0 },
    { kode: '2', uraian: 'Persidangan', level: 1, target: 200_000_000_000, realisasi: 0 },
    { kode: '3', uraian: 'Humas', level: 1, target: 200_000_000_000, realisasi: 0 },
    { kode: '4', uraian: 'Umum', level: 1, target: 200_000_000_000, realisasi: 0 },
  ];

  // 2. MASTER PERSONEL (40 Orang)
  const namaOrang = [
    "Budi Santoso", "Andi Wijaya", "Siti Aminah", "Ayu Lestari", "Rudi Hermawan", "Dwi Cahyono", "Eko Prasetyo", "Tri Wahyuni",
    "Agus Setiawan", "Rina Marlina", "Iwan Setiawan", "Rizky Ramadhan", "Hendra Gunawan", "Fajar Nugroho", "Maya Sari", "Nita Kusuma",
    "Doni Kusuma", "Ahmad Fauzi", "Dewi Sartika", "Putri Rahma", "Yudi Pratama", "Surya Saputra", "Tari Handayani", "Wahyu Hidayat",
    "Yoga Pratama", "Zainal Abidin", "Linda Wati", "Mira Lesmana", "Nina Safitri", "Oka Antara", "Panca Putra", "Qori Nabila",
    "Rafi Ahmad", "Samsul Bahri", "Teguh Pambudi", "Ujang Sudrajat", "Vera Damayanti", "Wawan Kurniawan", "Yanti Susanti", "Zulfikar Ali"
  ];
  const anggotaList = namaOrang.map((nama, idx) => ({
    id: `ang-dummy-${idx}`,
    nama: nama,
    jabatan: idx % 5 === 0 ? 'Penanggung Jawab' : 'Anggota', // 8 PJ, 32 Anggota
    bidang: bidangs[idx % 4].uraian
  }));

  // 3. MASTER SUMBER DANA (5 Sumber Dana)
  const sumberDanaNamas = [
    "APBD Provinsi Jawa Tengah", 
    "Dana Alokasi Khusus (DAK)", 
    "Dana Bagi Hasil (DBH)", 
    "APBN", 
    "Penerimaan Daerah Lainnya"
  ];
  const sumberDanaList = sumberDanaNamas.map((nama, idx) => ({
    id: `sd-dummy-${idx + 1}`,
    nama: nama,
    aktif: true
  }));

  // 4. PAGU ANGGARAN (800 Miliar Total) -> 160 Miliar per SD
  const PAGU_PER_SD = 160_000_000_000;
  const paguSumberDana = {
    [currentYear]: {}
  };
  sumberDanaList.forEach(sd => {
    paguSumberDana[currentYear][sd.id] = PAGU_PER_SD;
  });

  // Alokasi ke Bidang -> 4 Bidang -> 40 Miliar per Bidang per SD
  const PAGU_PER_BIDANG_SD = 40_000_000_000;
  const paguBidangSumberDana = {};
  bidangs.forEach(b => {
    paguBidangSumberDana[b.kode] = {};
    sumberDanaList.forEach(sd => {
      paguBidangSumberDana[b.kode][sd.id] = PAGU_PER_BIDANG_SD;
    });
  });

  // 5. STATUS DISTRIBUSI (24 Selesai, 16 mixed)
  const statusDist = [];
  for(let i=0; i<24; i++) statusDist.push('Selesai');
  for(let i=0; i<6; i++) statusDist.push('Berjalan');
  for(let i=0; i<5; i++) statusDist.push('Baru Mulai');
  for(let i=0; i<5; i++) statusDist.push('Terlambat');

  // Shuffle status array
  for (let i = statusDist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusDist[i], statusDist[j]] = [statusDist[j], statusDist[i]];
  }

  // Helper untuk random tanggal Mei - Juli 2026
  const randomDate = (startMonth, endMonth) => {
    const month = Math.floor(Math.random() * (endMonth - startMonth + 1)) + startMonth; // 5, 6, 7
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(currentYear, month - 1, day);
    return date;
  };

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 6. KEGIATAN & METADATA (10 per Bidang = 40 Total)
  const kegiatanList = [];
  const subKegiatanMeta = [];
  
  let statusIndex = 0;

  // Track allocation per Bidang and SD to not exceed PAGU_PER_BIDANG_SD
  const currentAlloc = {}; 

  bidangs.forEach(b => {
    currentAlloc[b.kode] = {};
    for (let i = 1; i <= 10; i++) {
      const kodeKegiatan = `${b.kode}.${i}`;
      const status = statusDist[statusIndex++];
      
      // Pilih Sumber Dana Acak (0 - 4)
      const randSdIdx = Math.floor(Math.random() * 5);
      const chosenSd = sumberDanaList[randSdIdx];

      // Tentukan pagu (misal 5 M - 15 M)
      // Since 10 items can easily fit in 160M (40M x 4 funds?), wait.
      // 10 activities per bidang. Total Bidang has 40M * 5 = 200M total.
      // So average per activity is 200M / 10 = 20M.
      // Let's set target around 8M to 15M to be safe.
      const targetPagu = Math.floor(Math.random() * 8 + 8) * 1_000_000_000; 

      // Initialize alloc tracking
      if (!currentAlloc[b.kode][chosenSd.id]) currentAlloc[b.kode][chosenSd.id] = 0;
      
      // Safety check to not exceed 40M per SD per Bidang
      let finalTarget = targetPagu;
      if (currentAlloc[b.kode][chosenSd.id] + finalTarget > PAGU_PER_BIDANG_SD) {
        finalTarget = PAGU_PER_BIDANG_SD - currentAlloc[b.kode][chosenSd.id];
      }
      currentAlloc[b.kode][chosenSd.id] += finalTarget;

      // Calculate Realisasi based on Status
      let realisasi = 0;
      if (status === 'Selesai') realisasi = finalTarget;
      else if (status === 'Berjalan') realisasi = Math.floor(finalTarget * (Math.random() * 0.4 + 0.3)); // 30-70%
      else if (status === 'Terlambat') realisasi = Math.floor(finalTarget * (Math.random() * 0.2 + 0.1)); // 10-30%
      else if (status === 'Baru Mulai') realisasi = 0;

      // Bikin nama kegiatan yang wajar
      const activityNames = [
        "Rapat Koordinasi", "Evaluasi Kinerja", "Bimbingan Teknis", "Kunjungan Kerja",
        "Penyusunan Laporan", "FGD Sinkronisasi", "Workshop Perencanaan", "Penyusunan Draft Regulasi",
        "Pemeliharaan Sistem", "Pengadaan Alat Tulis"
      ];
      const uraianStr = `${activityNames[(i-1) % activityNames.length]} ${b.uraian} Ke-${i}`;

      kegiatanList.push({
        kode: kodeKegiatan,
        uraian: uraianStr,
        level: 2,
        target: finalTarget,
        realisasi: realisasi
      });

      // Tanggal (Mei - Juli)
      const tglMulai = randomDate(5, 7);
      const tglSelesai = new Date(tglMulai);
      tglSelesai.setDate(tglMulai.getDate() + 14); // durasi ~14 hari

      // Personel
      const pjCandidates = anggotaList.filter(a => a.bidang === b.uraian && a.jabatan === 'Penanggung Jawab');
      const pj = pjCandidates.length > 0 ? pjCandidates[0].nama : "Budi Santoso";
      const members = anggotaList.filter(a => a.bidang === b.uraian && a.jabatan !== 'Penanggung Jawab').map(a => a.nama).slice(0, 3); // max 3 members

      subKegiatanMeta.push({
        id: kodeKegiatan,
        penanggungJawab: pj,
        anggota: members,
        tanggalMulai: formatDate(tglMulai),
        tanggalSelesai: formatDate(tglSelesai),
        deskripsi: `Kegiatan ${uraianStr} yang dibiayai menggunakan ${chosenSd.nama} dengan durasi 14 hari kerja.`,
        isWadah: false,
        steps: [
          { id: `step-1`, nama: 'Perencanaan', selesai: realisasi > 0 },
          { id: `step-2`, nama: 'Pelaksanaan', selesai: status === 'Selesai' || status === 'Berjalan' },
          { id: `step-3`, nama: 'Laporan', selesai: status === 'Selesai' },
          { id: `step-4`, nama: 'Verifikasi Dokumen', selesai: status === 'Selesai' }
        ],
        isApproved: true,
        createdByRole: 'superadmin',
        sumberDana: chosenSd.nama,
        anggaranDiminta: finalTarget,
        realisasiAnggaran: realisasi
      });
    }
  });

  // Gabungkan Bidang dan Kegiatan
  const uraianAnggaran = [...bidangs, ...kegiatanList];

  return {
    uraianAnggaran,
    subKegiatanMeta,
    anggotaList,
    sumberDanaList,
    paguSumberDana,
    paguBidangSumberDana
  };
}

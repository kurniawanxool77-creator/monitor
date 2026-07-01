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
    for (let i = 1; i <= 3; i++) {
      const kodeKegiatan = `${b.kode}.${i}`;
      
      const activityNames = [
        "Rapat Koordinasi", "Evaluasi Kinerja", "Bimbingan Teknis", "Kunjungan Kerja",
        "Penyusunan Laporan", "FGD Sinkronisasi", "Workshop Perencanaan", "Penyusunan Draft Regulasi",
        "Pemeliharaan Sistem", "Pengadaan Alat Tulis"
      ];
      const uraianKegiatan = `${activityNames[(i-1) % activityNames.length]} ${b.uraian} Ke-${i}`;

      // Tambahkan Kegiatan (Level 2) - Sebagai Wadah
      kegiatanList.push({
        kode: kodeKegiatan,
        uraian: uraianKegiatan,
        level: 2,
        target: 0, // akan diakumulasi
        realisasi: 0 // akan diakumulasi
      });

      subKegiatanMeta.push({
        id: kodeKegiatan,
        isWadah: true,
        steps: []
      });

      // Tambahkan 3 Sub Kegiatan (Level 3) per Kegiatan
      for (let j = 1; j <= 3; j++) {
        const kodeSubKegiatan = `${kodeKegiatan}.${j}`;
        const status = statusDist[statusIndex++];
        
        const randSdIdx = Math.floor(Math.random() * 5);
        const chosenSd = sumberDanaList[randSdIdx];

        const targetPagu = Math.floor(Math.random() * 8 + 8) * 1_000_000_000; 

        if (!currentAlloc[b.kode][chosenSd.id]) currentAlloc[b.kode][chosenSd.id] = 0;
        
        let finalTarget = targetPagu;
        if (currentAlloc[b.kode][chosenSd.id] + finalTarget > PAGU_PER_BIDANG_SD) {
          finalTarget = PAGU_PER_BIDANG_SD - currentAlloc[b.kode][chosenSd.id];
        }
        currentAlloc[b.kode][chosenSd.id] += finalTarget;

        let realisasi = 0;
        if (status === 'Selesai') realisasi = finalTarget;
        else if (status === 'Berjalan') realisasi = Math.floor(finalTarget * (Math.random() * 0.4 + 0.3));
        else if (status === 'Terlambat') realisasi = Math.floor(finalTarget * (Math.random() * 0.2 + 0.1));
        else if (status === 'Baru Mulai') realisasi = 0;

        const uraianSubKegiatan = `Pelaksanaan ${uraianKegiatan} Bagian ${j}`;

        kegiatanList.push({
          kode: kodeSubKegiatan,
          uraian: uraianSubKegiatan,
          level: 3,
          target: finalTarget,
          realisasi: realisasi
        });

        const tglMulai = randomDate(5, 7);
        const tglSelesai = new Date(tglMulai);
        tglSelesai.setDate(tglMulai.getDate() + 14);

        const pjCandidates = anggotaList.filter(a => a.bidang === b.uraian && a.jabatan === 'Penanggung Jawab');
        const pj = pjCandidates.length > 0 ? pjCandidates[0].nama : "Budi Santoso";
        const members = anggotaList.filter(a => a.bidang === b.uraian && a.jabatan !== 'Penanggung Jawab').map(a => a.nama).slice(0, 3);

        subKegiatanMeta.push({
          id: kodeSubKegiatan,
          penanggungJawab: pj,
          anggota: members,
          tanggalMulai: formatDate(tglMulai),
          tanggalSelesai: formatDate(tglSelesai),
          deskripsi: `Kegiatan ${uraianSubKegiatan} yang dibiayai menggunakan ${chosenSd.nama} dengan durasi 14 hari kerja.`,
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

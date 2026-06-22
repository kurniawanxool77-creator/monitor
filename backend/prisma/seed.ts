import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default superadmin
  const superadminPassword = await bcrypt.hash('admin123', 12);
  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@dprd.go.id' },
    update: {},
    create: {
      email: 'admin@dprd.go.id',
      password: superadminPassword,
      nama: 'Administrator Sistem',
      role: 'SUPERADMIN',
      aktif: true,
      bidangKode: null, // Superadmin akses semua bidang
    },
  });
  console.log('✅ Created superadmin:', superadmin.email);

  // Create default admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'operator@dprd.go.id' },
    update: {},
    create: {
      email: 'operator@dprd.go.id',
      password: adminPassword,
      nama: 'Operator Sistem',
      role: 'ADMIN',
      aktif: true,
      bidangKode: null, // Admin akses semua bidang
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create default user dengan bidangKode
  const userPassword = await bcrypt.hash('user123', 12);
  const userBidangSKR = await prisma.user.upsert({
    where: { email: 'skr@dprd.go.id' },
    update: {},
    create: {
      email: 'skr@dprd.go.id',
      password: userPassword,
      nama: 'Staff Sekretariat',
      role: 'USER',
      aktif: true,
      bidangKode: '1', // Hanya akses Sekretariat
    },
  });
  console.log('✅ Created user bidang SKR:', userBidangSKR.email);

  // Create default bidang (from original data)
  const bidangData = [
    { kode: 'SKR', nama: 'Sekretariat DPRD' },
    { kode: 'UMUM', nama: 'Bagian Umum' },
    { kode: 'HUMAS', nama: 'Bagian humas' },
    { kode: 'SID', nama: 'Bagian Persidangan' },
    { kode: 'KEU', nama: 'Keuangan' },
  ];

  const createdBidang: Record<string, any> = {};
  for (const bidang of bidangData) {
    const created = await prisma.bidang.upsert({
      where: { kode: bidang.kode },
      update: {},
      create: {
        kode: bidang.kode,
        nama: bidang.nama,
        aktif: true,
      },
    });
    createdBidang[bidang.kode] = created;
  }
  console.log('✅ Created 5 bidang');

  // Create uraian hierarchy (simplified from original data)
  const currentYear = new Date().getFullYear();

  // Level 1 - Sekretariat DPRD
  const skrBidang = createdBidang['SKR'];

  const uraianSKR1 = await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '1',
      nama: 'Sekretariat DPRD',
      level: 1,
      bidangId: skrBidang.id,
      pagu: 168376593000,
      activeYear: currentYear,
    },
  });

  await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '1.1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '1.1',
      nama: 'Perencanaan & Evaluasi Kinerja',
      level: 2,
      parentId: uraianSKR1.id,
      pagu: 712581000,
      activeYear: currentYear,
    },
  });

  await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '1.1.1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '1.1.1',
      nama: 'Penyusunan Dokumen Perencanaan Perangkat Daerah',
      level: 3,
      parentId: (await prisma.uraian.findFirst({ where: { kode: '1.1', activeYear: currentYear } }))?.id,
      pagu: 442601000,
      activeYear: currentYear,
    },
  });

  // Level 1 - Bagian Umum
  const umumBidang = createdBidang['UMUM'];
  const uraianUMUM1 = await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '2', activeYear: currentYear } },
    update: {},
    create: {
      kode: '2',
      nama: 'Bagian Umum',
      level: 1,
      bidangId: umumBidang.id,
      pagu: 58216639000,
      activeYear: currentYear,
    },
  });

  await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '2.1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '2.1',
      nama: 'Administrasi Umum Perangkat Daerah',
      level: 2,
      parentId: uraianUMUM1.id,
      pagu: 7464110000,
      activeYear: currentYear,
    },
  });

  // Level 1 - Bagian humas
  const humasBidang = createdBidang['HUMAS'];
  const uraianHUMAS1 = await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '3', activeYear: currentYear } },
    update: {},
    create: {
      kode: '3',
      nama: 'Bagian humas',
      level: 1,
      bidangId: humasBidang.id,
      pagu: 231584388000,
      activeYear: currentYear,
    },
  });

  await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '3.1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '3.1',
      nama: 'Peningkatan Kapasitas DPRD',
      level: 2,
      parentId: uraianHUMAS1.id,
      pagu: 130044388000,
      activeYear: currentYear,
    },
  });

  // Level 1 - Bagian Persidangan
  const sidBidang = createdBidang['SID'];
  const uraianSID1 = await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '4', activeYear: currentYear } },
    update: {},
    create: {
      kode: '4',
      nama: 'Bagian Persidangan',
      level: 1,
      bidangId: sidBidang.id,
      pagu: 97960085000,
      activeYear: currentYear,
    },
  });

  await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '4.1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '4.1',
      nama: 'Pembentukan Perda dan Peraturan DPRD',
      level: 2,
      parentId: uraianSID1.id,
      pagu: 7206440000,
      activeYear: currentYear,
    },
  });

  // Level 1 - Keuangan
  const keuBidang = createdBidang['KEU'];
  const uraianKEU1 = await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '5', activeYear: currentYear } },
    update: {},
    create: {
      kode: '5',
      nama: 'Keuangan',
      level: 1,
      bidangId: keuBidang.id,
      pagu: 168376593000,
      activeYear: currentYear,
    },
  });

  await prisma.uraian.upsert({
    where: { kode_activeYear: { kode: '5.1', activeYear: currentYear } },
    update: {},
    create: {
      kode: '5.1',
      nama: 'Administrasi Keuangan',
      level: 2,
      parentId: uraianKEU1.id,
      pagu: 19550589000,
      activeYear: currentYear,
    },
  });

  console.log('✅ Created uraian hierarchy');

  // Create default sumber dana
  const sumberDanaData = [
    'APBD Provinsi',
    'APBD Kabupaten/Kota',
    'APBN',
    'Dana Alokasi Khusus (DAK)',
    'Dana Alokasi Umum (DAU)',
    'Dana Bagi Hasil (DBH)',
    'Dana Insentif Daerah (DID)',
    'Hibah'
  ];

  for (const nama of sumberDanaData) {
    await prisma.sumberDana.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  console.log('✅ Created sumber dana');

  console.log('🎉 Seed completed!');
  console.log('\n📋 Default Credentials:');
  console.log('   Superadmin: admin@dprd.go.id / admin123');
  console.log('   Admin: operator@dprd.go.id / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

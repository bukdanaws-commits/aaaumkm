import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sponsors = [
  {
    name: 'Bank Indonesia',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/BI_Logo.png',
    category: 'Lembaga Negara',
    website: 'https://www.bi.go.id',
    sortOrder: 1,
  },
  {
    name: 'Otoritas Jasa Keuangan',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/OJK_Logo.png',
    category: 'Lembaga Negara',
    website: 'https://www.ojk.go.id',
    sortOrder: 2,
  },
  {
    name: 'Danantara Indonesia',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Danantara_Indonesia_%28no_SW%29.svg',
    category: 'Holding BUMN',
    website: 'https://danantara.id',
    sortOrder: 3,
  },
  {
    name: 'BUMN Untuk Indonesia',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Logo_BUMN_Untuk_Indonesia_2020.svg/200px-Logo_BUMN_Untuk_Indonesia_2020.svg.png',
    category: 'BUMN',
    website: 'https://bumn.go.id',
    sortOrder: 4,
  },
  {
    name: 'Kementerian UMKM',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Logo_Kementerian_Usaha_Mikro%2C_Kecil%2C_dan_Menengah_Republik_Indonesia_%282025%29.svg',
    category: 'Kementerian',
    website: 'https://kemenkopukm.go.id',
    sortOrder: 5,
  },
  {
    name: 'Pertamina',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pertamina_Logo.svg',
    category: 'BUMN Energi',
    website: 'https://www.pertamina.com',
    sortOrder: 6,
  },
  {
    name: 'Bank Negara Indonesia',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg',
    category: 'Bank BUMN',
    website: 'https://www.bni.co.id',
    sortOrder: 7,
  },
  {
    name: 'PLN',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png',
    category: 'BUMN Energi',
    website: 'https://www.pln.co.id',
    sortOrder: 8,
  },
  {
    name: 'Kereta Api Indonesia',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Logo_PT_Kereta_Api_Indonesia_%28Persero%29_2020.svg',
    category: 'BUMN Transportasi',
    website: 'https://www.kai.id',
    sortOrder: 9,
  },
];

async function main() {
  console.log('🌱 Seeding sponsors...\n');

  // Delete existing sponsors
  const deleteResult = await prisma.sponsor.deleteMany({});
  console.log(`🗑️  Deleted ${deleteResult.count} existing sponsors\n`);

  // Create new sponsors
  let createdCount = 0;
  for (const sponsor of sponsors) {
    try {
      await prisma.sponsor.create({
        data: sponsor,
      });
      console.log(`✅ Created: ${sponsor.name}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${sponsor.name}:`, error);
    }
  }

  console.log(`\n✨ Successfully seeded ${createdCount} sponsors!`);

  // Verify
  const allSponsors = await prisma.sponsor.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  console.log('\n📋 Current sponsors in database:');
  allSponsors.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.name} (${s.category})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding sponsors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

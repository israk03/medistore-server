import 'dotenv/config';
import { PrismaClient, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  // ── 1. Admin ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medistore.com' },
    update: {},
    create: {
      name: 'MediStore Admin',
      email: 'admin@medistore.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // ── 2. Seller ────────────────────────────────────────────
  const sellerPassword = await bcrypt.hash('seller123', 10);

  const seller = await prisma.user.upsert({
    where: { email: 'seller@medistore.com' },
    update: {},
    create: {
      name: 'Square Pharma',
      email: 'seller@medistore.com',
      password: sellerPassword,
      role: Role.SELLER,
    },
  });

  // ── 3. Customer ──────────────────────────────────────────
  const customerPassword = await bcrypt.hash('customer123', 10);

  await prisma.user.upsert({
    where: { email: 'customer@medistore.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'customer@medistore.com',
      password: customerPassword,
      role: Role.CUSTOMER,
    },
  });

  // ── 4. Categories ────────────────────────────────────────
  const categoryNames = [
  'Pain Relief',
  'Antibiotics',
  'Vitamins & Supplements',
  'Allergy & Cold',
  'Digestive Health',
  'Skin Care',
  'Eye Care',
  'First Aid',
  'Diabetes Care',
  'Heart & Blood Pressure',
  'Women Care',
  'Men Care',
  'Baby Care',
  'Respiratory Care',
  'Mental Health',
  'Oral Care',
];

  const categories: Record<string, string> = {};

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    categories[name] = category.id;
  }

  // ── 5. Medicines ─────────────────────────────────────────
  const medicines = [
  // ── Pain Relief ─────────────────
  {
    name: 'Paracetamol 500mg',
    description: 'Used for reducing fever and relieving mild to moderate pain such as headaches, toothaches, and muscle pain. It works by affecting the brain signals that cause pain and helps regulate body temperature. Safe when used within recommended dosage.',
    price: 25,
    stock: 200,
    manufacturer: 'Square Pharma',
    category: 'Pain Relief',
    imageUrl: 'https://images.unsplash.com/photo-1580281657521-1b2e5c3f0b2f',
  },
  {
    name: 'Ibuprofen 400mg',
    description: 'A non-steroidal anti-inflammatory drug (NSAID) that reduces inflammation, pain, and fever. Commonly used for joint pain, menstrual cramps, and injuries. Should be taken with food to prevent stomach irritation.',
    price: 45,
    stock: 150,
    manufacturer: 'Beximco Pharma',
    category: 'Pain Relief',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5',
  },

  // ── Antibiotics ─────────────────
  {
    name: 'Amoxicillin 500mg',
    description: 'Broad-spectrum antibiotic used to treat bacterial infections such as respiratory, skin, and urinary tract infections. Must be taken as prescribed and full course should be completed.',
    price: 120,
    stock: 80,
    manufacturer: 'ACI Limited',
    category: 'Antibiotics',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88',
  },
  {
    name: 'Azithromycin 250mg',
    description: 'Effective antibiotic used for throat, chest, and sinus infections. Works by stopping bacterial growth. Typically taken once daily for a short course.',
    price: 180,
    stock: 70,
    manufacturer: 'Incepta Pharma',
    category: 'Antibiotics',
    imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8',
  },

  // ── Vitamins ─────────────────
  {
    name: 'Vitamin C 1000mg',
    description: 'Supports immune system, improves skin health, and acts as an antioxidant. Ideal during seasonal illness or recovery phase.',
    price: 180,
    stock: 300,
    manufacturer: 'Renata Limited',
    category: 'Vitamins & Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2',
  },
  {
    name: 'Multivitamin Tablets',
    description: 'Provides essential daily vitamins and minerals to support overall health, energy, and immunity. Suitable for regular use.',
    price: 250,
    stock: 200,
    manufacturer: 'Square Pharma',
    category: 'Vitamins & Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1615486369242-4a0c44a7d3bb',
  },

  // ── Allergy ─────────────────
  {
    name: 'Cetirizine 10mg',
    description: 'Antihistamine used to treat allergy symptoms like sneezing, itching, and runny nose. Provides quick and long-lasting relief.',
    price: 35,
    stock: 180,
    manufacturer: 'Square Pharma',
    category: 'Allergy & Cold',
    imageUrl: 'https://images.unsplash.com/photo-1588774069410-84ae30757c8e',
  },
  {
    name: 'Loratadine 10mg',
    description: 'Non-drowsy allergy medication that relieves seasonal allergies and skin reactions without causing sleepiness.',
    price: 50,
    stock: 120,
    manufacturer: 'Beximco Pharma',
    category: 'Allergy & Cold',
    imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde',
  },

  // ── Digestive ─────────────────
  {
    name: 'Omeprazole 20mg',
    description: 'Reduces stomach acid production and provides relief from heartburn, acid reflux, and ulcers. Best taken before meals.',
    price: 90,
    stock: 120,
    manufacturer: 'Incepta Pharma',
    category: 'Digestive Health',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
  },
  {
    name: 'ORS Powder',
    description: 'Oral rehydration solution used to prevent dehydration caused by diarrhea or vomiting. Restores lost fluids and electrolytes.',
    price: 20,
    stock: 300,
    manufacturer: 'Renata Limited',
    category: 'Digestive Health',
    imageUrl: 'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9',
  },

  // ── Skin Care ─────────────────
  {
    name: 'Hydrocortisone Cream',
    description: 'Used to relieve itching, redness, and inflammation from skin conditions like eczema, rashes, and insect bites.',
    price: 65,
    stock: 90,
    manufacturer: 'GSK',
    category: 'Skin Care',
    imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd',
  },
  {
    name: 'Acne Treatment Gel',
    description: 'Helps reduce acne, control oil, and prevent breakouts. Suitable for daily skincare routine.',
    price: 140,
    stock: 80,
    manufacturer: 'Square Pharma',
    category: 'Skin Care',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  },

  // ── Eye Care ─────────────────
  {
    name: 'Eye Drop Refresh',
    description: 'Lubricates dry and irritated eyes. Ideal for people working long hours on screens or wearing contact lenses.',
    price: 110,
    stock: 75,
    manufacturer: 'Opsonin Pharma',
    category: 'Eye Care',
    imageUrl: 'https://images.unsplash.com/photo-1580281658629-7d8c46fba3c4',
  },

  // ── First Aid ─────────────────
  {
    name: 'Antiseptic Cream',
    description: 'Prevents infection in minor cuts, burns, and wounds. Essential for home first aid kits.',
    price: 55,
    stock: 160,
    manufacturer: 'Beximco Pharma',
    category: 'First Aid',
    imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b',
  },

  // ── Diabetes ─────────────────
  {
    name: 'Metformin 500mg',
    description: 'Helps control blood sugar levels in type 2 diabetes patients. Improves insulin sensitivity.',
    price: 110,
    stock: 150,
    manufacturer: 'Beximco Pharma',
    category: 'Diabetes Care',
    imageUrl: 'https://images.unsplash.com/photo-1580281780460-82d277d5b66d',
  },

  // ── Heart ─────────────────
  {
    name: 'Amlodipine 5mg',
    description: 'Used to treat high blood pressure and prevent chest pain. Helps improve blood flow.',
    price: 95,
    stock: 130,
    manufacturer: 'ACI Limited',
    category: 'Heart & Blood Pressure',
    imageUrl: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435',
  },

  // ── Women Care ─────────────────
  {
    name: 'Iron Supplement Tablets',
    description: 'Helps treat iron deficiency and supports healthy blood levels. Commonly used during pregnancy.',
    price: 150,
    stock: 140,
    manufacturer: 'Renata Limited',
    category: 'Women Care',
    imageUrl: 'https://images.unsplash.com/photo-1588776813677-77aaf5595f7c',
  },

  // ── Men Care ─────────────────
  {
    name: 'Men Multivitamin',
    description: 'Supports energy, stamina, and overall male health with essential nutrients.',
    price: 280,
    stock: 100,
    manufacturer: 'Square Pharma',
    category: 'Men Care',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5',
  },

  // ── Baby Care ─────────────────
  {
    name: 'Baby Lotion',
    description: 'Gentle moisturizing lotion for baby skin. Keeps skin soft and hydrated.',
    price: 250,
    stock: 100,
    manufacturer: 'Johnson & Johnson',
    category: 'Baby Care',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
  },

  // ── Respiratory ─────────────────
  {
    name: 'Salbutamol Inhaler',
    description: 'Provides quick relief from asthma and breathing difficulties. Works by opening airways.',
    price: 300,
    stock: 60,
    manufacturer: 'GSK',
    category: 'Respiratory Care',
    imageUrl: 'https://images.unsplash.com/photo-1588776814107-9f0c0f57c1c4',
  },

  // ── Mental Health ─────────────────
  {
    name: 'Melatonin Tablets',
    description: 'Helps regulate sleep cycle and improve sleep quality. Ideal for insomnia and jet lag.',
    price: 220,
    stock: 90,
    manufacturer: 'Renata Limited',
    category: 'Mental Health',
    imageUrl: 'https://images.unsplash.com/photo-1582719471386-41d06a2f7fd3',
  },

  // ── Oral Care ─────────────────
  {
    name: 'Medicated Toothpaste',
    description: 'Helps prevent cavities, gum disease, and strengthens enamel. Suitable for daily use.',
    price: 180,
    stock: 200,
    manufacturer: 'Pepsodent',
    category: 'Oral Care',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-ec7e36b46e9d',
  },
];

  for (const med of medicines) {
  const categoryId = categories[med.category];

  if (!categoryId) {
    throw new Error(`Category not found: ${med.category}`);
  }

  await prisma.medicine.upsert({
    where: {
      name_sellerId: {
        name: med.name,
        sellerId: seller.id,
      },
    },
    update: {
      description: med.description,
      price: new Prisma.Decimal(med.price),
      stock: med.stock,
      manufacturer: med.manufacturer,
      imageUrl: med.imageUrl,
      categoryId,
    },
    create: {
      name: med.name,
      description: med.description,
      price: new Prisma.Decimal(med.price),
      stock: med.stock,
      manufacturer: med.manufacturer,
      imageUrl: med.imageUrl,
      categoryId,
      sellerId: seller.id,
    },
  });
}

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
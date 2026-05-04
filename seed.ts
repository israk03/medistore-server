import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medistore.com' },
    update: {},
    create: {
      name: 'MediStore Admin',
      email: 'admin@medistore.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin seeded:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
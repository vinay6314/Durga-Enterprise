import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users in dev.db:', users.length);
  users.forEach((u) => {
    console.log(`- ID: ${u.id} | Email: '${u.email}' | Role: ${u.role} | Name: ${u.name}`);
  });
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

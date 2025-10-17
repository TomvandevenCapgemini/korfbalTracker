import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.match.createMany({
    data: [
      { date: '2025-10-01', homeTeam: 'Team A', awayTeam: 'Team B', homeScore: 12, awayScore: 10 },
      { date: '2025-10-08', homeTeam: 'Team C', awayTeam: 'Team D', homeScore: 8, awayScore: 9 }
    ]
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

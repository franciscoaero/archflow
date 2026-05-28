import { PrismaClient } from "@prisma/client";
import { startOfWeek, addDays, format } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.create({
    data: {
      name: "Demo Architect",
      hourlyRate: 35,
      currency: "USD",
    },
  });

  const fremont = await prisma.project.create({
    data: {
      name: "27201 Fremont",
      code: "27201",
      client: "Acme Design Studio",
      color: "#3B82F6",
      status: "active",
      profileId: profile.id,
      parts: {
        create: [
          { name: "Cozinha", estimatedHours: 25 },
          { name: "Banheiro", estimatedHours: 20 },
          { name: "Lavanderia", estimatedHours: 12 },
          { name: "3D" },
          { name: "CAD" },
          { name: "Reunião" },
          { name: "Lista de Compras" },
        ],
      },
    },
    include: { parts: true },
  });

  const saoJose = await prisma.project.create({
    data: {
      name: "1415 São José",
      code: "1415",
      client: "Acme Design Studio",
      color: "#10B981",
      status: "active",
      profileId: profile.id,
      parts: {
        create: [
          { name: "Iluminação", estimatedHours: 15 },
          { name: "Mood Board" },
          { name: "3D" },
          { name: "Reunião" },
        ],
      },
    },
    include: { parts: true },
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const entries = [
    { day: 0, start: "09:00", end: "12:00", project: fremont, part: "CAD" },
    { day: 0, start: "13:00", end: "17:00", project: fremont, part: "Cozinha" },
    { day: 1, start: "09:00", end: "11:30", project: fremont, part: "3D" },
    { day: 1, start: "14:00", end: "17:00", project: saoJose, part: "Iluminação" },
    { day: 2, start: "09:00", end: "12:30", project: fremont, part: "3D" },
    { day: 2, start: "13:30", end: "16:00", project: saoJose, part: "Mood Board" },
    { day: 2, start: "16:30", end: "18:00", project: fremont, part: "Reunião" },
    { day: 3, start: "09:00", end: "11:00", project: saoJose, part: "3D" },
    { day: 3, start: "14:00", end: "17:00", project: fremont, part: "Cozinha" },
    { day: 4, start: "09:00", end: "11:30", project: fremont, part: "CAD" },
    { day: 4, start: "13:00", end: "15:40", project: saoJose, part: "Iluminação" },
  ];

  for (const entry of entries) {
    const date = addDays(weekStart, entry.day);
    const part = entry.project.parts.find((p) => p.name === entry.part);
    const [startH, startM] = entry.start.split(":").map(Number);
    const [endH, endM] = entry.end.split(":").map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);

    await prisma.timeEntry.create({
      data: {
        date,
        startTime: entry.start,
        endTime: entry.end,
        duration,
        projectId: entry.project.id,
        partId: part?.id,
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

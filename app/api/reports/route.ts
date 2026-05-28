import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  const entries = await prisma.timeEntry.findMany({
    where: {
      date: {
        gte: new Date(`${startDate}T00:00:00`),
        lte: new Date(`${endDate}T23:59:59`),
      },
    },
    include: { project: true, part: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const totalMinutes = entries.reduce((acc, e) => acc + e.duration, 0);

  const projectMap = new Map<
    string,
    { name: string; color: string; minutes: number; parts: Map<string, number> }
  >();

  for (const entry of entries) {
    const existing = projectMap.get(entry.projectId);
    const partName = entry.part?.name || "Sem part";

    if (existing) {
      existing.minutes += entry.duration;
      existing.parts.set(partName, (existing.parts.get(partName) || 0) + entry.duration);
    } else {
      const parts = new Map<string, number>();
      parts.set(partName, entry.duration);
      projectMap.set(entry.projectId, {
        name: entry.project.name,
        color: entry.project.color,
        minutes: entry.duration,
        parts,
      });
    }
  }

  const projects = Array.from(projectMap.entries())
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .map(([id, p]) => ({
      id,
      name: p.name,
      color: p.color,
      minutes: p.minutes,
      parts: Array.from(p.parts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, mins]) => ({ name, minutes: mins })),
    }));

  return NextResponse.json({
    startDate,
    endDate,
    totalMinutes,
    entryCount: entries.length,
    projects,
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      duration: e.duration,
      description: e.description,
      projectName: e.project.name,
      partName: e.part?.name || null,
    })),
  });
}

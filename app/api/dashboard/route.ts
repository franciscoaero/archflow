import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/get-profile";
import { NextRequest, NextResponse } from "next/server";
import { startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const referenceDate = dateParam ? new Date(dateParam) : new Date();
  const profileId = await getProfileId(request);

  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(weekStart, 1);
  const prevWeekEnd = subWeeks(weekEnd, 1);

  const profileFilter = profileId ? { project: { profileId } } : {};

  const [entries, prevEntries] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { date: { gte: weekStart, lte: weekEnd }, ...profileFilter },
      include: { project: true, part: true },
    }),
    prisma.timeEntry.findMany({
      where: { date: { gte: prevWeekStart, lte: prevWeekEnd }, ...profileFilter },
    }),
  ]);

  const totalMinutes = entries.reduce((acc, e) => acc + e.duration, 0);
  const prevTotalMinutes = prevEntries.reduce((acc, e) => acc + e.duration, 0);

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dailyData = days.map((day) => {
    const dayEntries = entries.filter(
      (e) => format(e.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );
    const minutes = dayEntries.reduce((acc, e) => acc + e.duration, 0);
    return {
      day: format(day, "EEE", { locale: ptBR }),
      hours: Math.round((minutes / 60) * 100) / 100,
      minutes,
    };
  });

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

  const projectData = Array.from(projectMap.values())
    .sort((a, b) => b.minutes - a.minutes)
    .map((p) => ({
      name: p.name,
      color: p.color,
      hours: Math.round((p.minutes / 60) * 100) / 100,
      minutes: p.minutes,
      parts: Array.from(p.parts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, mins]) => ({ name, minutes: mins })),
    }));

  const weekLabel = `${format(weekStart, "dd MMM", { locale: ptBR })} — ${format(weekEnd, "dd MMM yyyy", { locale: ptBR })}`;

  return NextResponse.json({
    weekLabel,
    weekStart: weekStart.toISOString(),
    totalMinutes,
    prevTotalMinutes,
    dailyData,
    projectData,
  });
}

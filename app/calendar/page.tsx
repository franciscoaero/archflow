"use client";

import { apiFetch } from "@/lib/api-client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar-view";
import { startOfWeek, addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDuration } from "@/lib/utils";

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string | null;
  project: { name: string; color: string };
  part: { name: string } | null;
}

interface DayData {
  label: string;
  date: string;
  entries: TimeEntry[];
  totalMinutes: number;
}

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [days, setDays] = useState<DayData[]>([]);
  const [weekTotal, setWeekTotal] = useState(0);
  const [weekLabel, setWeekLabel] = useState("");

  const fetchWeek = useCallback(async () => {
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    const ws = startOfWeek(ref, { weekStartsOn: 1 });

    const dayList: DayData[] = [];
    let total = 0;

    for (let i = 0; i < 7; i++) {
      const day = addDays(ws, i);
      const dateStr = format(day, "yyyy-MM-dd");
      const res = await apiFetch(`/api/time-entries?date=${dateStr}`);
      const entries: TimeEntry[] = await res.json();
      const dayTotal = entries.reduce((acc, e) => acc + e.duration, 0);
      total += dayTotal;

      dayList.push({
        label: format(day, "EEE dd", { locale: ptBR }),
        date: dateStr,
        entries,
        totalMinutes: dayTotal,
      });
    }

    setDays(dayList);
    setWeekTotal(total);
    setWeekLabel(
      `${format(ws, "dd MMM", { locale: ptBR })} — ${format(addDays(ws, 6), "dd MMM yyyy", { locale: ptBR })}`
    );
  }, [weekOffset]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">
            Semana: {formatDuration(weekTotal)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[200px] text-center">
          {weekLabel}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset >= 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
            Hoje
          </Button>
        )}
      </div>

      {days.length > 0 && <CalendarView days={days} />}
    </div>
  );
}

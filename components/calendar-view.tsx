"use client";

import { formatDuration } from "@/lib/utils";

interface TimeEntry {
  id: string;
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

interface CalendarViewProps {
  days: DayData[];
}

const HOUR_START = 7;
const HOUR_END = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function CalendarView({ days }: CalendarViewProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
        <div className="p-2" />
        {days.map((day) => (
          <div key={day.date} className="p-2 text-center border-l">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              {day.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {day.totalMinutes > 0 && formatDuration(day.totalMinutes)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[60px_repeat(7,1fr)] relative" style={{ height: `${TOTAL_HOURS * 48}px` }}>
        {hours.map((hour) => (
          <div
            key={hour}
            className="col-span-full grid grid-cols-[60px_repeat(7,1fr)] border-b border-dashed border-muted"
            style={{ height: "48px" }}
          >
            <div className="px-2 text-[10px] text-muted-foreground leading-none pt-0.5">
              {hour}:00
            </div>
            {days.map((day) => (
              <div key={day.date} className="border-l" />
            ))}
          </div>
        ))}

        {days.map((day, dayIdx) => (
          <div key={day.date} className="absolute" style={{
            left: `calc(60px + ${dayIdx} * ((100% - 60px) / 7))`,
            width: `calc((100% - 60px) / 7)`,
            top: 0,
            height: "100%",
          }}>
            {day.entries.map((entry) => {
              const startMins = timeToMinutes(entry.startTime);
              const endMins = timeToMinutes(entry.endTime);
              const topOffset = ((startMins - HOUR_START * 60) / (TOTAL_HOURS * 60)) * 100;
              const height = ((endMins - startMins) / (TOTAL_HOURS * 60)) * 100;

              if (topOffset < 0 || height <= 0) return null;

              return (
                <div
                  key={entry.id}
                  className="absolute left-1 right-1 rounded px-1.5 py-0.5 overflow-hidden text-[10px] leading-tight border"
                  style={{
                    top: `${topOffset}%`,
                    height: `${height}%`,
                    backgroundColor: entry.project.color + "20",
                    borderColor: entry.project.color + "60",
                    minHeight: "18px",
                  }}
                >
                  <div className="font-medium truncate" style={{ color: entry.project.color }}>
                    {entry.part?.name || entry.description || entry.project.name}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {entry.project.name}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDuration(entry.duration)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

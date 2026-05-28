"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string | null;
  project: { id: string; name: string; color: string };
  part: { id: string; name: string } | null;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
}

export function TimeEntryList({ entries, onDelete }: TimeEntryListProps) {
  const totalMinutes = entries.reduce((acc, e) => acc + e.duration, 0);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhuma entrada hoje. Use o timer ou adicione manualmente.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Entradas do dia</h3>
        <span className="text-sm font-medium text-primary">
          Total: {formatDuration(totalMinutes)}
        </span>
      </div>
      <div className="divide-y">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-4 px-4 py-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.project.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {entry.project.name}
                </span>
                {entry.part && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {entry.part.name}
                  </span>
                )}
              </div>
              {entry.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {entry.description}
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {entry.startTime} — {entry.endTime}
            </div>
            <div className="text-sm font-medium w-16 text-right">
              {formatDuration(entry.duration)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

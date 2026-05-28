"use client";

import { useState } from "react";
import { Trash2, Copy, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, calculateDuration } from "@/lib/utils";

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
  onDuplicate: (entry: TimeEntry) => void;
  onEdit: (id: string, data: { startTime: string; endTime: string; description: string | null }) => void;
}

export function TimeEntryList({ entries, onDelete, onDuplicate, onEdit }: TimeEntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const totalMinutes = entries.reduce((acc, e) => acc + e.duration, 0);

  function startEdit(entry: TimeEntry) {
    setEditingId(entry.id);
    setEditStart(entry.startTime);
    setEditEnd(entry.endTime);
    setEditDesc(entry.description || "");
  }

  function saveEdit() {
    if (!editingId || !editStart || !editEnd) return;
    const duration = calculateDuration(editStart, editEnd);
    if (duration <= 0) return;
    onEdit(editingId, { startTime: editStart, endTime: editEnd, description: editDesc || null });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

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
          <div key={entry.id} className="px-4 py-3">
            {editingId === entry.id ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.project.color }}
                />
                <input
                  type="time"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className="h-8 w-28 rounded-md border bg-background px-2 text-sm"
                />
                <span className="text-muted-foreground">—</span>
                <input
                  type="time"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  className="h-8 w-28 rounded-md border bg-background px-2 text-sm"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Descrição..."
                  className="h-8 flex-1 rounded-md border bg-background px-2 text-sm"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={saveEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
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
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(entry)}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onDuplicate(entry)}
                    title="Duplicar"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(entry.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

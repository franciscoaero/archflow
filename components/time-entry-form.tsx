"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDuration } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  color: string;
  parts: { id: string; name: string }[];
}

interface TimeEntryFormProps {
  projects: Project[];
  onEntrySaved: () => void;
}

export function TimeEntryForm({ projects, onEntrySaved }: TimeEntryFormProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [projectId, setProjectId] = useState("");
  const [partId, setPartId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProject = projects.find((p) => p.id === projectId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !startTime || !endTime) return;

    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) return;

    setSaving(true);
    await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        startTime,
        endTime,
        duration,
        description: description || null,
        projectId,
        partId: partId || null,
      }),
    });

    setStartTime("");
    setEndTime("");
    setDescription("");
    setSaving(false);
    onEntrySaved();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Entrada Manual</h3>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Início</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fim</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Projeto</label>
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPartId("");
            }}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            required
          >
            <option value="">Projeto...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Part</label>
          <select
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            disabled={!projectId}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Opcional...</option>
            {selectedProject?.parts.map((part) => (
              <option key={part.id} value={part.id}>{part.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional..."
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <Button type="submit" disabled={saving || !projectId || !startTime || !endTime} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </form>
  );
}

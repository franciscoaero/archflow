"use client";

import { apiFetch } from "@/lib/api-client";

import { useState, useEffect, useCallback } from "react";
import { Play, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getTimerState,
  saveTimerState,
  clearTimerState,
  getElapsedSeconds,
  formatElapsed,
} from "@/lib/timer-store";
import { calculateDuration } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  color: string;
  parts: { id: string; name: string }[];
}

interface TimerWidgetProps {
  projects: Project[];
  onEntrySaved: () => void;
}

export function TimerWidget({ projects, onEntrySaved }: TimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [partId, setPartId] = useState("");
  const [description, setDescription] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const selectedProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    const stored = getTimerState();
    if (stored?.isRunning) {
      setIsRunning(true);
      setProjectId(stored.projectId);
      setPartId(stored.partId || "");
      setDescription(stored.description);
      setStartedAt(stored.startedAt);
      setElapsed(getElapsedSeconds(stored.startedAt));
    }
  }, []);

  useEffect(() => {
    if (!isRunning || !startedAt) return;
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const handleStart = useCallback(() => {
    if (!projectId) return;
    const now = Date.now();
    setIsRunning(true);
    setStartedAt(now);
    setElapsed(0);
    saveTimerState({
      isRunning: true,
      projectId,
      partId: partId || null,
      description,
      startedAt: now,
    });
  }, [projectId, partId, description]);

  const handleStop = useCallback(async () => {
    if (!startedAt || !projectId) return;

    const startDate = new Date(startedAt);
    const endDate = new Date();
    const startTime = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;
    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
    const duration = calculateDuration(startTime, endTime);

    if (duration <= 0) {
      clearTimerState();
      setIsRunning(false);
      setElapsed(0);
      setStartedAt(null);
      return;
    }

    await apiFetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: startDate.toISOString().split("T")[0],
        startTime,
        endTime,
        duration,
        description: description || null,
        projectId,
        partId: partId || null,
      }),
    });

    clearTimerState();
    setIsRunning(false);
    setElapsed(0);
    setStartedAt(null);
    onEntrySaved();
  }, [startedAt, projectId, partId, description, onEntrySaved]);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPartId("");
            }}
            disabled={isRunning}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Selecione projeto...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            disabled={isRunning || !projectId}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Part (opcional)...</option>
            {selectedProject?.parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
            placeholder="Descrição..."
            className="h-10 rounded-md border bg-background px-3 text-sm"
          />

          <div className="flex items-center gap-3">
            <div className="font-mono text-2xl font-bold tabular-nums flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {formatElapsed(elapsed)}
            </div>
          </div>
        </div>

        {!isRunning ? (
          <Button
            onClick={handleStart}
            disabled={!projectId}
            size="icon"
            className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            size="icon"
            className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
          >
            <Square className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { TimerWidget } from "@/components/timer-widget";
import { TimeEntryForm } from "@/components/time-entry-form";
import { TimeEntryList } from "@/components/time-entry-list";

interface Part {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  parts: Part[];
}

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

export default function TimerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  }, []);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/time-entries?date=${selectedDate}`);
    const data = await res.json();
    setEntries(data);
  }, [selectedDate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function handleDelete(id: string) {
    await fetch(`/api/time-entries?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Timer</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <TimerWidget projects={projects} onEntrySaved={fetchEntries} />

      <TimeEntryForm projects={projects} onEntrySaved={fetchEntries} />

      <TimeEntryList entries={entries} onDelete={handleDelete} />
    </div>
  );
}

"use client";

import { apiFetch } from "@/lib/api-client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardSummary } from "@/components/dashboard-summary";

interface DailyData {
  day: string;
  hours: number;
  minutes: number;
}

interface ProjectPart {
  name: string;
  minutes: number;
}

interface ProjectData {
  name: string;
  color: string;
  hours: number;
  minutes: number;
  parts: ProjectPart[];
}

interface DashboardData {
  weekLabel: string;
  weekStart: string;
  totalMinutes: number;
  prevTotalMinutes: number;
  dailyData: DailyData[];
  projectData: ProjectData[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchDashboard = useCallback(async () => {
    const date = new Date();
    date.setDate(date.getDate() + weekOffset * 7);
    const res = await apiFetch(`/api/dashboard?date=${date.toISOString()}`);
    const json = await res.json();
    setData(json);
  }, [weekOffset]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {data.weekLabel}
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
      </div>

      <DashboardSummary
        totalMinutes={data.totalMinutes}
        prevTotalMinutes={data.prevTotalMinutes}
        projectCount={data.projectData.length}
      />

      <DashboardCharts
        dailyData={data.dailyData}
        projectData={data.projectData}
      />
    </div>
  );
}

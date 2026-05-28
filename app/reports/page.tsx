"use client";

import { apiFetch } from "@/lib/api-client";

import { useState, useCallback } from "react";
import { FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportView } from "@/components/report-view";
import { generateReportPDF, generateCSV } from "@/lib/pdf-export";
import { formatDuration } from "@/lib/utils";
import { startOfWeek, endOfWeek, format } from "date-fns";

interface ProjectReport {
  id: string;
  name: string;
  color: string;
  minutes: number;
  parts: { name: string; minutes: number }[];
}

interface ReportData {
  startDate: string;
  endDate: string;
  totalMinutes: number;
  entryCount: number;
  projects: ProjectReport[];
  entries: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    description: string | null;
    projectName: string;
    partName: string | null;
  }[];
}

export default function ReportsPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [startDate, setStartDate] = useState(format(weekStart, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(weekEnd, "yyyy-MM-dd"));
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch(`/api/reports?start=${startDate}&end=${endDate}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [startDate, endDate]);

  function handleExportPDF() {
    if (!data) return;
    generateReportPDF(
      {
        startDate: data.startDate,
        endDate: data.endDate,
        totalMinutes: data.totalMinutes,
        projects: data.projects,
      },
      "Demo Architect"
    );
  }

  function handleExportCSV() {
    if (!data) return;
    const headers = ["Data", "Projeto", "Part", "Início", "Fim", "Duração", "Descrição"];
    const rows = data.entries.map((e) => [
      new Date(e.date).toLocaleDateString("pt-BR"),
      e.projectName,
      e.partName || "",
      e.startTime,
      e.endTime,
      formatDuration(e.duration),
      e.description || "",
    ]);
    generateCSV(headers, rows);
  }

  function setThisWeek() {
    setStartDate(format(weekStart, "yyyy-MM-dd"));
    setEndDate(format(weekEnd, "yyyy-MM-dd"));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        {data && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileDown className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-end gap-3 rounded-lg border bg-card p-4">
        <div>
          <label className="text-xs text-muted-foreground">Data Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block h-9 rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Data Fim</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block h-9 rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <Button onClick={fetchReport} disabled={loading}>
          {loading ? "Gerando..." : "Gerar Relatório"}
        </Button>
        <Button variant="ghost" size="sm" onClick={setThisWeek}>
          Esta semana
        </Button>
      </div>

      {data && (
        <ReportView
          startDate={data.startDate}
          endDate={data.endDate}
          totalMinutes={data.totalMinutes}
          entryCount={data.entryCount}
          projects={data.projects}
        />
      )}
    </div>
  );
}

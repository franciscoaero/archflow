"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Clock, FolderKanban, TrendingUp } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface DashboardSummaryProps {
  totalMinutes: number;
  prevTotalMinutes: number;
  projectCount: number;
}

export function DashboardSummary({
  totalMinutes,
  prevTotalMinutes,
  projectCount,
}: DashboardSummaryProps) {
  const diff = totalMinutes - prevTotalMinutes;
  const diffPositive = diff >= 0;
  const workedDays = totalMinutes > 0 ? Math.max(1, Math.ceil(totalMinutes / 480)) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total da Semana</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(totalMinutes)}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {diff !== 0 && (
              <>
                {diffPositive ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                {formatDuration(Math.abs(diff))} vs. semana anterior
              </>
            )}
            {diff === 0 && "Igual à semana anterior"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectCount}</div>
          <p className="text-xs text-muted-foreground">nesta semana</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(workedDays > 0 ? Math.round(totalMinutes / 5) : 0)}
          </div>
          <p className="text-xs text-muted-foreground">por dia útil (5 dias)</p>
        </CardContent>
      </Card>
    </div>
  );
}

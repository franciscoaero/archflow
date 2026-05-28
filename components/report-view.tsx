"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

interface ProjectReport {
  id: string;
  name: string;
  color: string;
  minutes: number;
  parts: { name: string; minutes: number }[];
}

interface ReportViewProps {
  startDate: string;
  endDate: string;
  totalMinutes: number;
  entryCount: number;
  projects: ProjectReport[];
}

export function ReportView({
  startDate,
  endDate,
  totalMinutes,
  entryCount,
  projects,
}: ReportViewProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhuma entrada encontrada neste período.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Resumo do Período</CardTitle>
            <span className="text-sm text-muted-foreground">
              {new Date(startDate).toLocaleDateString("pt-BR")} —{" "}
              {new Date(endDate).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de Horas</p>
              <p className="text-2xl font-bold">{formatDuration(totalMinutes)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="text-2xl font-bold">{entryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <CardTitle className="text-base">{project.name}</CardTitle>
              </div>
              <span className="font-medium">{formatDuration(project.minutes)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.parts.map((part) => (
                <div key={part.name} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{part.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(part.minutes / project.minutes) * 100}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {formatDuration(part.minutes)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

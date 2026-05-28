"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

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

interface DashboardChartsProps {
  dailyData: DailyData[];
  projectData: ProjectData[];
}

export function DashboardCharts({ dailyData, projectData }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Horas por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [`${value}h`, "Horas"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    dataKey="hours"
                    nameKey="name"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}h`, "Horas"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhuma entrada nesta semana
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {projectData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhamento por Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projectData.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium text-sm">{project.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {formatDuration(project.minutes)}
                    </span>
                  </div>
                  <div className="ml-5 space-y-1">
                    {project.parts.map((part) => (
                      <div
                        key={part.name}
                        className="flex justify-between text-xs text-muted-foreground"
                      >
                        <span>{part.name}</span>
                        <span>{formatDuration(part.minutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

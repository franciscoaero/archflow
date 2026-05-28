"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/project-form";
import { PartList } from "@/components/part-list";

interface Part {
  id: string;
  name: string;
  estimatedHours: number | null;
}

interface Project {
  id: string;
  name: string;
  code: string | null;
  client: string | null;
  color: string;
  status: string;
  parts: Part[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects?all=true");
    const data = await res.json();
    setProjects(data);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function handleEdit(project: Project) {
    setEditingProject(project);
    setShowForm(true);
  }

  async function handleArchive(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProject(undefined);
    fetchProjects();
  }

  const activeProjects = projects.filter((p) => p.status === "active");
  const finishedProjects = projects.filter((p) => p.status === "finished");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Projetos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {activeProjects.length === 0 && finishedProjects.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhum projeto criado. Clique em "Novo Projeto" para começar.
        </div>
      )}

      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ativos</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleArchive(project.id)}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {project.client && (
                    <p className="text-sm text-muted-foreground">{project.client}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <PartList
                    projectId={project.id}
                    parts={project.parts}
                    onUpdate={fetchProjects}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {finishedProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-muted-foreground">Finalizados</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {finishedProjects.map((project) => (
              <Card key={project.id} className="opacity-70">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">finalizado</span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleFormClose}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(undefined);
          }}
        />
      )}
    </div>
  );
}

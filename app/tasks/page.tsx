"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  text: string;
  done: boolean;
  project: Project | null;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newText, setNewText] = useState("");
  const [newProjectId, setNewProjectId] = useState("");

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
  }, []);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: newText.trim(),
        projectId: newProjectId || null,
      }),
    });

    setNewText("");
    fetchTasks();
  }

  async function toggleDone(id: string, done: boolean) {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
    fetchTasks();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  }

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Tarefas</h2>

      <form onSubmit={handleAdd} className="flex gap-3 rounded-lg border bg-card p-4">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Nova tarefa..."
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm"
        />
        <select
          value={newProjectId}
          onChange={(e) => setNewProjectId(e.target.value)}
          className="h-9 w-48 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Sem projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Button type="submit" disabled={!newText.trim()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </form>

      {pending.length === 0 && completed.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhuma tarefa. Adicione itens acima para organizar seu trabalho.
        </div>
      )}

      {pending.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pendentes ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {pending.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded px-2 py-2 hover:bg-muted">
                <button
                  onClick={() => toggleDone(task.id, task.done)}
                  className="h-5 w-5 rounded border-2 border-muted-foreground/50 flex items-center justify-center hover:border-primary"
                />
                <span className="flex-1 text-sm">{task.text}</span>
                {task.project && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: task.project.color + "20", color: task.project.color }}
                  >
                    {task.project.name}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">
              Concluídas ({completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {completed.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded px-2 py-2 hover:bg-muted opacity-60">
                <button
                  onClick={() => toggleDone(task.id, task.done)}
                  className="h-5 w-5 rounded border-2 border-primary bg-primary flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </button>
                <span className="flex-1 text-sm line-through">{task.text}</span>
                {task.project && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {task.project.name}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PROJECT_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    code: string | null;
    client: string | null;
    color: string;
    status: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "");
  const [code, setCode] = useState(project?.code || "");
  const [client, setClient] = useState(project?.client || "");
  const [color, setColor] = useState(project?.color || PROJECT_COLORS[0]);
  const [status, setStatus] = useState(project?.status || "active");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    if (project) {
      await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, client, color, status }),
      });
    } else {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, client, color }),
      });
    }

    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {project ? "Editar Projeto" : "Novo Projeto"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: 27201 Fremont"
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Código</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: 27201"
                className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ex: Acme Design Studio"
                className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Cor</label>
            <div className="mt-1 flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {project && (
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="active">Ativo</option>
                <option value="finished">Finalizado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving || !name.trim()} className="flex-1">
              {project ? "Salvar" : "Criar Projeto"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

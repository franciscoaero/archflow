"use client";

import { apiFetch } from "@/lib/api-client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Part {
  id: string;
  name: string;
  estimatedHours: number | null;
}

interface PartListProps {
  projectId: string;
  parts: Part[];
  onUpdate: () => void;
}

const DEFAULT_PARTS = [
  "Cozinha", "Banheiro", "Lavanderia", "3D", "CAD",
  "Mood Board", "Reunião", "Lista de Compras",
];

export function PartList({ projectId, parts, onUpdate }: PartListProps) {
  const [newName, setNewName] = useState("");
  const [newHours, setNewHours] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    await apiFetch(`/api/projects/${projectId}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        estimatedHours: newHours ? parseFloat(newHours) : null,
      }),
    });

    setNewName("");
    setNewHours("");
    setAdding(false);
    onUpdate();
  }

  async function handleDelete(partId: string) {
    await apiFetch(`/api/projects/${projectId}/parts?partId=${partId}`, {
      method: "DELETE",
    });
    onUpdate();
  }

  async function addDefaults() {
    const existingNames = parts.map((p) => p.name.toLowerCase());
    const toAdd = DEFAULT_PARTS.filter(
      (name) => !existingNames.includes(name.toLowerCase())
    );

    for (const name of toAdd) {
      await apiFetch(`/api/projects/${projectId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
    onUpdate();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Parts ({parts.length})</h4>
        {parts.length === 0 && (
          <Button variant="ghost" size="sm" onClick={addDefaults} className="text-xs">
            + Adicionar padrão
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {parts.map((part) => (
          <div
            key={part.id}
            className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted"
          >
            <span className="text-sm">{part.name}</span>
            <div className="flex items-center gap-2">
              {part.estimatedHours && (
                <span className="text-xs text-muted-foreground">
                  ~{part.estimatedHours}h
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(part.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nova part..."
          className="h-8 flex-1 rounded-md border bg-background px-2 text-sm"
        />
        <input
          type="number"
          value={newHours}
          onChange={(e) => setNewHours(e.target.value)}
          placeholder="Horas est."
          step="0.5"
          className="h-8 w-20 rounded-md border bg-background px-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={adding || !newName.trim()}>
          <Plus className="h-3 w-3" />
        </Button>
      </form>
    </div>
  );
}

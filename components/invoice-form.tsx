"use client";

import { apiFetch } from "@/lib/api-client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { startOfWeek, endOfWeek, format } from "date-fns";

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string | null;
  projectName: string;
  partName: string | null;
}

interface InvoiceFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function InvoiceForm({ onSave, onCancel }: InvoiceFormProps) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [startDate, setStartDate] = useState(format(weekStart, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(weekEnd, "yyyy-MM-dd"));
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [startDate, endDate]);

  async function fetchEntries() {
    setLoading(true);
    const res = await apiFetch(`/api/reports?start=${startDate}&end=${endDate}`);
    const data = await res.json();
    setEntries(data.entries || []);
    const unbilled = (data.entries || []).filter((e: TimeEntry & { invoiceId?: string }) => !e.invoiceId);
    setSelectedIds(new Set(unbilled.map((e: TimeEntry) => e.id)));
    setLoading(false);
  }

  async function handleCreate() {
    if (selectedIds.size === 0) return;
    setSaving(true);

    await apiFetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        periodStart: startDate,
        periodEnd: endDate,
        entryIds: Array.from(selectedIds),
      }),
    });

    setSaving(false);
    onSave();
  }

  const totalMinutes = entries
    .filter((e) => selectedIds.has(e.id))
    .reduce((acc, e) => acc + e.duration, 0);

  function toggleAll() {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Novo Invoice</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Período Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block h-9 rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Período Fim</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block h-9 rounded-md border bg-background px-3 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando entradas...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma entrada no período.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedIds.size === entries.length ? "Desmarcar todas" : "Selecionar todas"}
                </Button>
                <span className="text-sm font-medium">
                  {selectedIds.size} entradas | {formatDuration(totalMinutes)}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
                {entries.map((entry) => (
                  <label
                    key={entry.id}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => {
                        const next = new Set(selectedIds);
                        if (next.has(entry.id)) next.delete(entry.id);
                        else next.add(entry.id);
                        setSelectedIds(next);
                      }}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground w-20">
                      {new Date(entry.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-sm flex-1 truncate">
                      {entry.projectName}
                      {entry.partName && ` / ${entry.partName}`}
                    </span>
                    <span className="text-xs font-medium">
                      {formatDuration(entry.duration)}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreate}
              disabled={saving || selectedIds.size === 0}
              className="flex-1"
            >
              Criar Invoice ({formatDuration(totalMinutes)})
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

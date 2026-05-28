"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, X, ArrowRight } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { generateInvoicePDF } from "@/lib/pdf-export";

interface InvoiceEntry {
  id: string;
  duration: number;
  project: { name: string };
  part: { name: string } | null;
}

interface InvoiceDetailProps {
  invoice: {
    id: string;
    number: number;
    status: string;
    periodStart: string;
    periodEnd: string;
    totalHours: number;
    totalAmount: number | null;
    entries: InvoiceEntry[];
    profile: { name: string; hourlyRate: number | null; currency: string };
  };
  onStatusChange: (id: string, status: string) => void;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  paid: "Pago",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  paid: "bg-purple-100 text-purple-700",
};

const NEXT_STATUS: Record<string, string> = {
  draft: "sent",
  sent: "approved",
  approved: "paid",
};

export function InvoiceDetail({ invoice, onStatusChange, onClose }: InvoiceDetailProps) {
  const projectMap = new Map<string, { parts: Map<string, number>; total: number }>();

  for (const entry of invoice.entries) {
    const projectName = entry.project.name;
    const partName = entry.part?.name || "Geral";
    const existing = projectMap.get(projectName);

    if (existing) {
      existing.parts.set(partName, (existing.parts.get(partName) || 0) + entry.duration);
      existing.total += entry.duration;
    } else {
      const parts = new Map<string, number>();
      parts.set(partName, entry.duration);
      projectMap.set(projectName, { parts, total: entry.duration });
    }
  }

  function handleExportPDF() {
    generateInvoicePDF(invoice);
  }

  const nextStatus = NEXT_STATUS[invoice.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              Invoice #{invoice.number.toString().padStart(4, "0")}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[invoice.status]}`}>
              {STATUS_LABELS[invoice.status]}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Período: {new Date(invoice.periodStart).toLocaleDateString("pt-BR")} —{" "}
            {new Date(invoice.periodEnd).toLocaleDateString("pt-BR")}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(projectMap.entries()).map(([projectName, data]) => (
                  <div key={projectName}>
                    <div className="flex justify-between font-medium text-sm">
                      <span>{projectName}</span>
                      <span>{formatDuration(data.total)}</span>
                    </div>
                    <div className="ml-4 space-y-1 mt-1">
                      {Array.from(data.parts.entries()).map(([partName, mins]) => (
                        <div
                          key={partName}
                          className="flex justify-between text-xs text-muted-foreground"
                        >
                          <span>{partName}</span>
                          <span>{formatDuration(mins)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between font-bold">
                <span>Total</span>
                <div className="text-right">
                  <div>{formatDuration(Math.round(invoice.totalHours * 60))}</div>
                  {invoice.totalAmount && (
                    <div className="text-sm font-normal text-muted-foreground">
                      {invoice.profile.currency} {invoice.totalAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-2">
            {nextStatus && (
              <Button
                className="flex-1"
                onClick={() => onStatusChange(invoice.id, nextStatus)}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Marcar como {STATUS_LABELS[nextStatus]}
              </Button>
            )}
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

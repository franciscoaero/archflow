"use client";

import { apiFetch } from "@/lib/api-client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoiceDetail } from "@/components/invoice-detail";
import { formatDuration } from "@/lib/utils";

interface InvoiceEntry {
  id: string;
  duration: number;
  project: { name: string };
  part: { name: string } | null;
}

interface Invoice {
  id: string;
  number: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  totalAmount: number | null;
  createdAt: string;
  entries: InvoiceEntry[];
  profile: { name: string; hourlyRate: number | null; currency: string };
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    const res = await apiFetch("/api/invoices");
    const data = await res.json();
    setInvoices(data);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  async function handleStatusChange(id: string, status: string) {
    await apiFetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchInvoices();
    setSelectedInvoice(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhum invoice criado. Clique em "Novo Invoice" para gerar a partir das horas registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedInvoice(invoice)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium">
                      #{invoice.number.toString().padStart(4, "0")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[invoice.status]}`}>
                      {STATUS_LABELS[invoice.status]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(invoice.periodStart).toLocaleDateString("pt-BR")} —{" "}
                      {new Date(invoice.periodEnd).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatDuration(Math.round(invoice.totalHours * 60))}
                    </div>
                    {invoice.totalAmount && (
                      <div className="text-sm text-muted-foreground">
                        {invoice.profile.currency} {invoice.totalAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <InvoiceForm
          onSave={() => {
            setShowForm(false);
            fetchInvoices();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onStatusChange={handleStatusChange}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDuration } from "./utils";

interface ProjectReport {
  name: string;
  minutes: number;
  parts: { name: string; minutes: number }[];
}

interface ReportData {
  startDate: string;
  endDate: string;
  totalMinutes: number;
  projects: ProjectReport[];
}

export function generateReportPDF(data: ReportData, profileName: string): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Relatório de Horas", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Profissional: ${profileName}`, 14, 28);
  doc.text(`Período: ${data.startDate} a ${data.endDate}`, 14, 34);
  doc.text(`Total: ${formatDuration(data.totalMinutes)}`, 14, 40);

  let y = 50;

  for (const project of data.projects) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${project.name} — ${formatDuration(project.minutes)}`, 14, y);
    y += 6;

    const rows = project.parts.map((part) => [
      part.name,
      formatDuration(part.minutes),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Part", "Horas"]],
      body: rows,
      theme: "plain",
      styles: { fontSize: 9 },
      headStyles: { fontStyle: "bold", textColor: [80, 80, 80] },
      margin: { left: 20 },
      tableWidth: 100,
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  doc.save(`relatorio_${data.startDate}_${data.endDate}.pdf`);
}

interface InvoiceEntry {
  project: { name: string };
  part: { name: string } | null;
  duration: number;
}

interface InvoiceData {
  number: number;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  totalAmount: number | null;
  entries: InvoiceEntry[];
  profile: { name: string; hourlyRate: number | null; currency: string };
}

export function generateInvoicePDF(data: InvoiceData): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("INVOICE", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`#${data.number.toString().padStart(4, "0")}`, 14, 28);
  doc.text(`Profissional: ${data.profile.name}`, 14, 36);
  doc.text(
    `Período: ${new Date(data.periodStart).toLocaleDateString("pt-BR")} a ${new Date(data.periodEnd).toLocaleDateString("pt-BR")}`,
    14,
    42
  );

  const projectMap = new Map<
    string,
    { parts: Map<string, number>; total: number }
  >();

  for (const entry of data.entries) {
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

  const rows: string[][] = [];
  Array.from(projectMap.entries()).forEach(([projectName, project]) => {
    Array.from(project.parts.entries()).forEach(([partName, minutes]) => {
      const hours = minutes / 60;
      const rate = data.profile.hourlyRate || 0;
      rows.push([
        projectName,
        partName,
        formatDuration(minutes),
        rate > 0 ? `${data.profile.currency} ${rate.toFixed(2)}` : "-",
        rate > 0 ? `${data.profile.currency} ${(hours * rate).toFixed(2)}` : "-",
      ]);
    });
  });

  autoTable(doc, {
    startY: 52,
    head: [["Projeto", "Part", "Horas", "Valor/h", "Total"]],
    body: rows,
    foot: [[
      "",
      "",
      formatDuration(Math.round(data.totalHours * 60)),
      "",
      data.totalAmount
        ? `${data.profile.currency} ${data.totalAmount.toFixed(2)}`
        : "-",
    ]],
    theme: "striped",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fontStyle: "bold" },
  });

  doc.save(`invoice_${data.number.toString().padStart(4, "0")}.pdf`);
}

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function generateCSV(
  headers: string[],
  rows: string[][]
): void {
  const csv = [
    headers.map(escapeCSVField).join(","),
    ...rows.map((r) => r.map(escapeCSVField).join(",")),
  ].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio.csv";
  link.click();
  URL.revokeObjectURL(url);
}

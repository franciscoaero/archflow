import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "Profile" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "hourlyRate" REAL, "currency" TEXT NOT NULL DEFAULT 'USD', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Project" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "code" TEXT, "client" TEXT, "color" TEXT NOT NULL DEFAULT '#3B82F6', "status" TEXT NOT NULL DEFAULT 'active', "profileId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Part" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "estimatedHours" REAL, "projectId" TEXT NOT NULL, CONSTRAINT "Part_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Task" ("id" TEXT NOT NULL PRIMARY KEY, "text" TEXT NOT NULL, "done" BOOLEAN NOT NULL DEFAULT false, "projectId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Invoice" ("id" TEXT NOT NULL PRIMARY KEY, "number" INTEGER NOT NULL, "profileId" TEXT NOT NULL, "periodStart" DATETIME NOT NULL, "periodEnd" DATETIME NOT NULL, "totalHours" REAL NOT NULL, "totalAmount" REAL, "status" TEXT NOT NULL DEFAULT 'draft', "paidAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Invoice_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "TimeEntry" ("id" TEXT NOT NULL PRIMARY KEY, "date" DATETIME NOT NULL, "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL, "duration" INTEGER NOT NULL, "description" TEXT, "projectId" TEXT NOT NULL, "partId" TEXT, "invoiceId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "TimeEntry_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "TimeEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
];

export async function POST() {
  try {
    for (const sql of SCHEMA_STATEMENTS) {
      await prisma.$executeRawUnsafe(sql);
    }
    return NextResponse.json({ success: true, tables: SCHEMA_STATEMENTS.length });
  } catch (error) {
    console.error("Init DB error:", error);
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createEntrySchema = z.object({
  date: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().positive(),
  description: z.string().nullable().optional(),
  projectId: z.string().min(1),
  partId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const where = date
      ? {
          date: {
            gte: new Date(`${date}T00:00:00`),
            lt: new Date(`${date}T23:59:59`),
          },
        }
      : {};

    const entries = await prisma.timeEntry.findMany({
      where,
      include: { project: true, part: true },
      orderBy: { startTime: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createEntrySchema.parse(body);

    const entry = await prisma.timeEntry.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        description: data.description || null,
        projectId: data.projectId,
        partId: data.partId || null,
      },
      include: { project: true, part: true },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.timeEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

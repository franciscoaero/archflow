import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { getProfileId } from "@/lib/get-profile";
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

    const profileId = await getProfileId(request);
    const where: Record<string, unknown> = {};
    if (date) {
      where.date = {
        gte: new Date(`${date}T00:00:00.000Z`),
        lt: new Date(`${date}T23:59:59.999Z`),
      };
    }
    if (profileId) {
      where.project = { profileId };
    }

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
        date: new Date(`${data.date}T00:00:00.000Z`),
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, startTime, endTime, description } = body;

    if (!id || !startTime || !endTime) {
      return NextResponse.json({ error: "id, startTime, endTime required" }, { status: 400 });
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);

    if (duration <= 0) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: { startTime, endTime, duration, description: description || null },
      include: { project: true, part: true },
    });
    return NextResponse.json(entry);
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

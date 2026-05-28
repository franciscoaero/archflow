import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { getProfileId } from "@/lib/get-profile";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createTaskSchema = z.object({
  text: z.string().min(1).max(500),
  projectId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const profileId = await getProfileId(request);
    const tasks = await prisma.task.findMany({
      where: profileId
        ? { OR: [{ project: { profileId } }, { projectId: null }] }
        : {},
      include: { project: true },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createTaskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        text: data.text,
        projectId: data.projectId || null,
      },
      include: { project: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, done, text } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(done !== undefined && { done }),
        ...(text !== undefined && { text }),
      },
      include: { project: true },
    });
    return NextResponse.json(task);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

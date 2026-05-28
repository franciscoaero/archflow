import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().max(50).nullable().optional(),
  client: z.string().max(200).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  status: z.enum(["active", "finished", "archived"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { parts: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: { parts: true },
    });
    return NextResponse.json(project);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.update({
      where: { id: params.id },
      data: { status: "archived" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

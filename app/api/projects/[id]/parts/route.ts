import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createPartSchema = z.object({
  name: z.string().min(1).max(100),
  estimatedHours: z.number().positive().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = createPartSchema.parse(body);

    const part = await prisma.part.create({
      data: {
        name: data.name,
        estimatedHours: data.estimatedHours || null,
        projectId: params.id,
      },
    });
    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partId = searchParams.get("partId");

    if (!partId) {
      return NextResponse.json({ error: "partId required" }, { status: 400 });
    }

    await prisma.part.delete({ where: { id: partId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  hourlyRate: z.number().positive().nullable().optional(),
  currency: z.enum(["USD", "BRL", "EUR"]).optional(),
});

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(profiles);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createProfileSchema.parse(body);

    const profile = await prisma.profile.create({
      data: {
        name: data.name,
        hourlyRate: data.hourlyRate || null,
        currency: data.currency || "USD",
      },
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;
    const data = createProfileSchema.parse(rest);

    const profile = await prisma.profile.update({
      where: { id },
      data: {
        name: data.name,
        hourlyRate: data.hourlyRate || null,
        currency: data.currency || "USD",
      },
    });
    return NextResponse.json(profile);
  } catch (error) {
    return errorResponse(error);
  }
}

import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { getProfileId } from "@/lib/get-profile";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).nullable().optional(),
  client: z.string().max(200).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  profileId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";
    const profileId = await getProfileId(request);

    const where: Record<string, unknown> = {};
    if (!includeAll) where.status = { not: "archived" };
    if (profileId) where.profileId = profileId;

    const projects = await prisma.project.findMany({
      where,
      include: {
        parts: true,
        entries: { select: { duration: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = projects.map((p) => ({
      ...p,
      totalMinutes: p.entries.reduce((acc, e) => acc + e.duration, 0),
      entries: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    let profile = data.profileId || await getProfileId(request) || (await prisma.profile.findFirst())?.id;

    if (!profile) {
      const newProfile = await prisma.profile.create({
        data: { name: "My Profile", currency: "USD" },
      });
      profile = newProfile.id;
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        code: data.code || null,
        client: data.client || null,
        color: data.color || "#3B82F6",
        profileId: profile,
      },
      include: { parts: true },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

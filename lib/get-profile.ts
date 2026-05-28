import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export async function getProfileId(request: NextRequest): Promise<string> {
  const headerProfileId = request.headers.get("x-profile-id");
  if (headerProfileId) return headerProfileId;

  const profile = await prisma.profile.findFirst();
  return profile?.id || "";
}

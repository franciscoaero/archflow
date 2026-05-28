import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { getProfileId } from "@/lib/get-profile";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createInvoiceSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  entryIds: z.array(z.string().min(1)).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const profileId = await getProfileId(request);
    const invoices = await prisma.invoice.findMany({
      where: profileId ? { profileId } : {},
      include: {
        entries: { include: { project: true, part: true } },
        profile: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInvoiceSchema.parse(body);

    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({
        data: { name: "My Profile", currency: "USD" },
      });
    }

    const entries = await prisma.timeEntry.findMany({
      where: { id: { in: data.entryIds } },
    });

    if (entries.length === 0) {
      return NextResponse.json({ error: "No valid entries found" }, { status: 400 });
    }

    const totalMinutes = entries.reduce((acc, e) => acc + e.duration, 0);
    const totalHours = totalMinutes / 60;
    const totalAmount = profile.hourlyRate ? totalHours * profile.hourlyRate : null;

    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { number: "desc" },
    });
    const nextNumber = (lastInvoice?.number || 0) + 1;

    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        profileId: profile.id,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        totalHours,
        totalAmount,
        entries: {
          connect: data.entryIds.map((id) => ({ id })),
        },
      },
      include: {
        entries: { include: { project: true, part: true } },
        profile: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

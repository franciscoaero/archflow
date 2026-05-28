import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["draft", "sent", "approved", "paid"]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        entries: { include: { project: true, part: true } },
        profile: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
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
    const data = updateStatusSchema.parse(body);

    const updateData: { status: string; paidAt?: Date } = { status: data.status };
    if (data.status === "paid") {
      updateData.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        entries: { include: { project: true, part: true } },
        profile: true,
      },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.timeEntry.updateMany({
      where: { invoiceId: params.id },
      data: { invoiceId: null },
    });
    await prisma.invoice.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.issues },
      { status: 400 }
    );
  }

  if (error instanceof Error && error.message.includes("Record to")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  console.error("API Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

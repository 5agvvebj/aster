import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, readJsonBody } from "@/lib/api/errors";
import { calculatePanchang, panchangCities } from "@/lib/panchang";

const requestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
  city: z.enum(Object.keys(panchangCities) as [keyof typeof panchangCities, ...(keyof typeof panchangCities)[]]),
});

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, requestSchema);
    return NextResponse.json(calculatePanchang(body.date, body.city), {
      headers: { "cache-control": "public, max-age=300, stale-while-revalidate=900" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

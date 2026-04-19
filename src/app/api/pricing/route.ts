import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getActivePricing } from "@/lib/pricing";

export async function GET() {
  try {
    const pricing = await getActivePricing();
    if (!pricing) {
      return NextResponse.json(
        { phase: "standard", price_cents: 199900, label: "Precio regular", valid_until: null },
        { status: 200 }
      );
    }
    return NextResponse.json(pricing);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

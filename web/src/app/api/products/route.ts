export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { mapPageToProduct, queryAllProductsPages } from "@/lib/notion";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const category = (searchParams.get("category") || "").trim();

    const pages = await queryAllProductsPages();
    const items = pages.map(mapPageToProduct);

    const filtered = items.filter((p) => {
      const matchCat = !category || category === "All" || p.categories.includes(category);
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase?.().includes(q);
      return matchCat && matchQ;
    });

    return NextResponse.json({ ok: true, total: filtered.length, items: filtered });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GET /api/products error", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

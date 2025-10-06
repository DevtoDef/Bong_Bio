import { NextResponse } from "next/server";
import { mapPageToProduct, queryAllProductsPages } from "@/src/lib/notion";

export async function GET() {
  try {
    const pages = await queryAllProductsPages();
    const items = pages.map(mapPageToProduct);

    const map = new Map<string, number>();
    for (const p of items) {
      const cats = p.categories?.length ? p.categories : ["Khác"];
      for (const c of cats) {
        map.set(c, (map.get(c) || 0) + 1);
      }
    }
    const categories = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ ok: true, total: categories.length, items: categories });
  } catch (e: any) {
    console.error("GET /api/categories error", e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}

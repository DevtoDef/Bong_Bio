import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export const DB_PRODUCTS = process.env.NOTION_DB_PRODUCTS as string;

/** Tên cột đúng theo Notion của bạn */
const P = {
  name: "Tên sản phẩm",
  cat: "Categorie",
  code: "Mã sản phẩm",
  shopee: "Link shopee",
  tiktok: "Link TikTok",
  images: "Images",
} as const;

/* ==== Types gọn đủ dùng cho các field bạn đọc ==== */
type RichTextItem = { plain_text?: string };
type RT = RichTextItem[];

interface NotionFileRef {
  file?: { url: string };
  external?: { url: string };
}
interface NotionProperty {
  id?: string;
  type?: string;
  title?: RT;
  rich_text?: RT;
  number?: number | null;
  url?: string | null;
  multi_select?: Array<{ name: string }>;
  select?: { name: string } | null;
  files?: NotionFileRef[];
}
export interface NotionPage {
  id: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
}

export interface ProductMapped {
  id: string;
  name: string;
  categories: string[];
  code: string;
  links: { shopee: string; tiktok: string };
  images: string[];
  lastEdited: string;
}

/* ==== Helpers ==== */
const textFromRich = (rt?: RT): string =>
  (rt || []).map((r) => r?.plain_text || "").join(" ").trim();

function propByName(
  props: Record<string, NotionProperty> | undefined,
  key: string
): NotionProperty | undefined {
  if (!props) return undefined;
  const entries = Object.entries(props);
  const found = entries.find(
    ([k]) => k.trim().toLowerCase() === key.trim().toLowerCase()
  );
  return found ? found[1] : undefined;
}

function getSelectNames(prop?: NotionProperty): string[] {
  if (!prop) return [];
  if (prop.multi_select) return prop.multi_select.map((x) => x?.name).filter(Boolean) as string[];
  if (prop.select?.name) return [prop.select.name];
  const t = textFromRich(prop.rich_text);
  return t ? [t] : [];
}

function extractUrl(prop?: NotionProperty): string {
  if (!prop) return "";
  if (prop.url) return String(prop.url).trim();
  const txt = textFromRich(prop.rich_text) || "";
  const m = txt.match(/https?:\/\/[^\s,]+/i);
  return m ? m[0].replace(/[),.;]+$/, "") : "";
}

function extractImages(prop?: NotionProperty): string[] {
  if (!prop) return [];
  const txt = textFromRich(prop.rich_text) || "";
  const tokens = txt
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
  if (tokens.length) return tokens;

  if (prop.url && /^https?:\/\//i.test(prop.url)) return [prop.url];

  if (prop.files?.length) {
    return prop.files
      .map((f) => f?.file?.url || f?.external?.url)
      .filter((u): u is string => typeof u === "string");
  }
  return [];
}

/* ==== Notion IO ==== */
export async function queryAllProductsPages(): Promise<NotionPage[]> {
  if (!DB_PRODUCTS) throw new Error("Missing NOTION_DB_PRODUCTS");
  const pages: NotionPage[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res = (await notion.databases.query({
      database_id: DB_PRODUCTS,
      start_cursor: cursor,
      page_size: 100,
    })) as unknown as {
      results: NotionPage[];
      has_more: boolean;
      next_cursor?: string | null;
    };

    pages.push(...res.results);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}

export function mapPageToProduct(page: NotionPage): ProductMapped {
  const props = page.properties || {};
  const nameProp = propByName(props, P.name);
  const catProp = propByName(props, P.cat);
  const codeProp = propByName(props, P.code);
  const shopeeProp = propByName(props, P.shopee);
  const tiktokProp = propByName(props, P.tiktok);
  const imagesProp = propByName(props, P.images);

  const name =
    nameProp?.title?.[0]?.plain_text ||
    textFromRich(nameProp?.rich_text) ||
    "";

  const categories = getSelectNames(catProp);
  const codeVal =
    typeof codeProp?.number === "number"
      ? String(codeProp.number)
      : textFromRich(codeProp?.rich_text);

  const images = extractImages(imagesProp);
  const shopee = extractUrl(shopeeProp);
  const tiktok = extractUrl(tiktokProp);

  return {
    id: page.id,
    name,
    categories: categories.length ? categories : ["Khác"],
    code: (codeVal || "").trim(),
    links: { shopee, tiktok },
    images,
    lastEdited: page.last_edited_time,
  };
}

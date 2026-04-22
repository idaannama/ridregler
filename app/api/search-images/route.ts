import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface ImageEntry {
  filename: string;
  url: string;
  pdf: string;
  category: string;
  page: number;
  description: string;
  keywords: string[];
  equipment_type: string;
}

let catalog: ImageEntry[] | null = null;

function loadCatalog(): ImageEntry[] {
  if (catalog) return catalog;
  const catalogPath = join(process.cwd(), "lib", "image-catalog.json");
  if (!existsSync(catalogPath)) return [];
  catalog = JSON.parse(readFileSync(catalogPath, "utf-8")) as ImageEntry[];
  return catalog;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9\s]/g, " ");
}

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  if (!query?.trim()) {
    return NextResponse.json({ images: [] });
  }

  const entries = loadCatalog();
  const queryWords = normalize(query).split(/\s+/).filter(Boolean);

  const scored = entries
    .filter((e) => e.description)
    .map((e) => {
      const haystack = normalize(
        [e.description, ...e.keywords, e.equipment_type, e.pdf, e.category].join(" ")
      );
      const score = queryWords.reduce(
        (acc, word) => acc + (haystack.includes(word) ? 1 : 0),
        0
      );
      return { ...e, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return NextResponse.json({
    images: scored.map(({ filename, url, description, pdf, page }) => ({
      filename,
      url,
      description,
      source: `${pdf}, sida ${page}`,
    })),
  });
}

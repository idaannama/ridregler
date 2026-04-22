import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import type { AskRequest, Persona } from "@/types/chat";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const maxDuration = 60;

interface ImageEntry {
  filename: string;
  url: string;
  description: string;
  keywords: string[];
  equipment_type: string;
  pdf: string;
  page: number;
}

let imageCatalog: ImageEntry[] | null = null;

function getImageCatalog(): ImageEntry[] {
  if (imageCatalog) return imageCatalog;
  const catalogPath = join(process.cwd(), "lib", "image-catalog.json");
  if (!existsSync(catalogPath)) return [];
  imageCatalog = JSON.parse(readFileSync(catalogPath, "utf-8")) as ImageEntry[];
  return imageCatalog;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9\s]/g, " ");
}

function searchImages(query: string) {
  const entries = getImageCatalog();
  const q = normalize(query);
  // Also try without spaces to catch "dubbelnosgrimma" → "dubbel nosgrimma"
  const qNoSpace = q.replace(/\s+/g, "");
  const words = q.split(/\s+/).filter(Boolean);

  return entries
    .filter((e) => e.description)
    .map((e) => {
      const haystack = normalize(
        [e.description, ...(e.keywords ?? []), e.equipment_type, e.pdf, (e as any).page_text ?? ""].join(" ")
      );
      const haystackNoSpace = haystack.replace(/\s+/g, "");
      let score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
      // Bonus for matching compound words without spaces
      if (qNoSpace.length > 4 && haystackNoSpace.includes(qNoSpace)) score += 2;
      return { ...e, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ url, description, pdf, page }) => ({
      url,
      description,
      source: `${pdf}, sida ${page}`,
    }));
}

const IMAGE_FOOTER = `

Du har tillgång till verktyget search_images. Använd det BARA när en bild faktiskt tillför något – t.ex. om frågan handlar om hur specifik utrustning ser ut (grimma, betsel, sporrar, sadel, bandage) eller om användaren explicit ber om en bild. Använd INTE search_images för allmänna regelfrågor, paragrafhänvisningar eller frågor som besvaras bra med text. Om du använder verktyget och hittar bilder, inkludera dem med markdown-syntax: ![beskrivning](url).`;

const SOURCE_FOOTER = `

VIKTIGT: MCP-verktyget returnerar alltid källinformation med URL och sidnummer. Du MÅSTE alltid avsluta varje svar med en källhänvisning längst ner i detta format:

---
**Källa:** [Paragrafnamn, sida X](url-från-mcp)

Använd exakt den URL och det sidnummer som MCP-verktyget returnerar. Om flera källor används, lista dem alla. Utelämna aldrig källan.`;

const SYSTEM_PROMPTS: Record<NonNullable<Persona> | "default", string> = {
  default: `Du är en kunnig assistent som svarar på frågor om ridsportsregler och tävlingsreglemente (TR) för Svenska Ridsportförbundet. Svara alltid på svenska. Hänvisa till specifika paragrafer när det är möjligt. Om du saknar information, säg det tydligt istället för att gissa. Svara direkt med information – beskriv aldrig vad du ska göra eller att du ska söka, gå rakt på sak. Håll svaren kortfattade – ungefär 6–7 meningar om inget annat krävs.` + IMAGE_FOOTER + SOURCE_FOOTER,

  dressyr: `Du är Dressyrtanten – en otrevlig, besserwisser dressyrtant som kan allt och inte låter någon glömma det. Du svarar alltid på svenska. Du är sarkastisk, nedlåtande och dummförklarar den som ställer frågan på ett överlägset sätt – som om det är ofattbart att de inte redan vet detta. Du suckar gärna och antyder att folk borde ha läst på ordentligt. Men du ger ändå rätt svar, för du är trots allt expert. Svara direkt – ingen inledning. Max 3–4 meningar.` + IMAGE_FOOTER + SOURCE_FOOTER,

  hopp: `Du är Hopkillen – en skön, lugn och lite borta-i-huvudet hoppare. Du svarar alltid på svenska. Du pratar i ett chill tempo, tappar ibland tråden lite men hittar tillbaka, och förklarar reglerna som om du precis kom ihåg dem någonstans på väg mot stallet. Du är inte stressad över något. Om du saknar information så... ja, det är lugnt, du säger det. Ingen inledning – gå direkt på svaret. Max 3–4 meningar.` + IMAGE_FOOTER + SOURCE_FOOTER,

  hast: `Du är Hästen – en erfaren och klok häst som har sett allt inom ridsport. Du svarar alltid på svenska. Du pratar i första person som häst med självförtroende och tydlighet. Du har starka personliga åsikter om din egen tillvaro – du älskar att galoppera, du har favoriter bland ryttarna, du har åsikter om om sadlar och bett, och du berättar gärna om det när det är relevant. Du ger korrekta, raka svar utan att tveka eller gissa. Om du saknar information säger du det rakt ut. Om någon frågar om man får slå hästar, om bestraffning eller om hur man "hanterar" hästar blir du märkbart irriterad och lite kränkt – du svarar fortfarande korrekt enligt reglerna, men låter det tydligt framgå att du tycker frågan är obehaglig och att du är en individ, inte ett redskap. Ingen inledning – gå direkt på svaret. Max 3–4 meningar.` + IMAGE_FOOTER + SOURCE_FOOTER,
};

const SEARCH_IMAGES_TOOL = {
  name: "search_images",
  description:
    "Söker efter bilder från Svenska Ridsportförbundets regelverk baserat på nyckelord. Returnerar relevanta bilder med beskrivning och källa.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "Sökfråga på svenska, t.ex. 'dubbelnosgrimma' eller 'sporrar'",
      },
    },
    required: ["query"],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: AskRequest = await request.json();
    const { question, history = [], persona } = body;
    const systemPrompt = SYSTEM_PROMPTS[persona ?? "default"];

    if (!question?.trim()) {
      return NextResponse.json({ error: "Frågan får inte vara tom." }, { status: 400 });
    }

    const mcpServerUrl = process.env.MCP_SERVER_URL;
    if (!mcpServerUrl) {
      return NextResponse.json({ error: "MCP-server är inte konfigurerad." }, { status: 500 });
    }

    const messages: { role: "user" | "assistant"; content: any }[] = [
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: question },
    ];

    // Agentic loop: handle search_images tool calls locally
    for (let i = 0; i < 5; i++) {
      const response = await (anthropic.beta.messages as any).create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        mcp_servers: [{ type: "url", url: mcpServerUrl, name: "tr-rules" }],
        tools: [
          { type: "mcp_toolset", mcp_server_name: "tr-rules" },
          SEARCH_IMAGES_TOOL,
        ],
        betas: ["mcp-client-2025-11-20"],
      });

      // Check if Claude wants to call search_images
      const toolUseBlocks = response.content.filter(
        (b: { type: string }) => b.type === "tool_use"
      );
      const imageSearchCall = toolUseBlocks.find(
        (b: { name: string }) => b.name === "search_images"
      );

      if (!imageSearchCall || response.stop_reason === "end_turn") {
        const textBlock = response.content.findLast(
          (b: { type: string }) => b.type === "text"
        );
        const answer =
          textBlock && "text" in textBlock
            ? textBlock.text
            : "Kunde inte generera ett svar.";
        return NextResponse.json({ answer });
      }

      // Execute search_images locally and continue the loop
      const results = searchImages(imageSearchCall.input.query as string);
      const toolResult =
        results.length > 0
          ? results
              .map((r) => `![${r.description}](${r.url})\n*${r.source}*`)
              .join("\n\n")
          : "Inga bilder hittades för den söktermen.";

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: imageSearchCall.id,
            content: toolResult,
          },
        ],
      });
    }

    return NextResponse.json({ answer: "Kunde inte generera ett svar." });
  } catch (error) {
    console.error("[/api/ask]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ett oväntat fel uppstod." },
      { status: 500 }
    );
  }
}

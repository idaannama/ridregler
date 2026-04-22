#!/usr/bin/env python3
"""
Uses Claude Haiku vision to describe each extracted image and generate
a searchable catalog saved to lib/image-catalog.json.

Run after extract-images.py.
"""
import anthropic
import base64
import json
import os
import time

MANIFEST_PATH = "/Users/ida.franzen/Documents/App/lib/image-manifest.json"
CATALOG_PATH = "/Users/ida.franzen/Documents/App/lib/image-catalog.json"
IMAGES_DIR = "/Users/ida.franzen/Documents/App/public/images"

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

with open(MANIFEST_PATH, encoding="utf-8") as f:
    manifest = json.load(f)

# Load existing catalog to resume if interrupted
if os.path.exists(CATALOG_PATH):
    with open(CATALOG_PATH, encoding="utf-8") as f:
        existing = {e["filename"]: e for e in json.load(f)}
else:
    existing = {}

catalog = []
total = len(manifest)

for idx, entry in enumerate(manifest):
    fname = entry["filename"]

    # Resume: skip already described
    if fname in existing and existing[fname].get("description"):
        catalog.append(existing[fname])
        print(f"[{idx+1}/{total}] skip {fname}")
        continue

    img_path = os.path.join(IMAGES_DIR, fname)
    if not os.path.exists(img_path):
        continue

    with open(img_path, "rb") as f:
        img_data = base64.standard_b64encode(f.read()).decode("utf-8")

    ext = fname.rsplit(".", 1)[-1].lower()
    media_type = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"

    context = entry.get("page_text_context", "")[:300]

    prompt = f"""Du analyserar en bild från Svenska Ridsportförbundets regelverk (TR).
Sidtext-kontext: {context}

Beskriv exakt vad bilden visar på svenska. Fokusera på:
- Vilket utrustningsföremål som visas (grimma, betsel, nosband, sporrar, bandage, etc.)
- Om det är ett diagram/illustration eller fotografi
- Vad som är tillåtet/otillåtet om det framgår

Svara i JSON-format:
{{
  "description": "kort beskrivning på svenska (max 2 meningar)",
  "keywords": ["nyckelord1", "nyckelord2", ...],
  "equipment_type": "typ av utrustning eller 'annat'"
}}"""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_data}},
                    {"type": "text", "text": prompt}
                ]
            }]
        )
        text = response.content[0].text.strip()
        # Extract JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            ai = json.loads(text[start:end])
        else:
            ai = {"description": text[:200], "keywords": [], "equipment_type": "annat"}
    except Exception as e:
        print(f"  ERROR: {e}")
        ai = {"description": "", "keywords": [], "equipment_type": "annat"}

    enriched = {**entry, **ai}
    enriched.pop("page_text_context", None)
    catalog.append(enriched)

    print(f"[{idx+1}/{total}] {fname}: {ai.get('description', '')[:80]}")

    # Save progress every 20 images
    if (idx + 1) % 20 == 0:
        with open(CATALOG_PATH, "w", encoding="utf-8") as f:
            json.dump(catalog, f, ensure_ascii=False, indent=2)
        print(f"  → Progress saved ({len(catalog)} entries)")

    # Small delay to avoid rate limits
    time.sleep(0.1)

with open(CATALOG_PATH, "w", encoding="utf-8") as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print(f"\nKatalog med {len(catalog)} bilder sparad till {CATALOG_PATH}")

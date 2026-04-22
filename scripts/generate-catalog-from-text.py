#!/usr/bin/env python3
"""
Generates image catalog from page text context (no Vision API needed).
The PDFs have equipment names in the surrounding text.
"""
import json
import re
import os

MANIFEST_PATH = "/Users/ida.franzen/Documents/App/lib/image-manifest.json"
CATALOG_PATH = "/Users/ida.franzen/Documents/App/lib/image-catalog.json"

# Known equipment terms in the PDFs
EQUIPMENT_TERMS = [
    "dubbel nosgrimma", "dubbelnosgrimma", "nosgrimma", "nosgrimmor", "grimma",
    "remontgrimma", "achengrimma", "pullargrimma", "hannovergrimma",
    "halvmånenosband", "nosband",
    "micklem",
    "betsel", "träns", "tyglar", "käkrem", "nackrem", "pannrem",
    "sporrar", "tungsporre", "rowelsporre", "sporre",
    "sadel", "dressyrsadel", "hoppningsadel",
    "bandage", "benskydd", "damasker",
    "sadelgjord", "stigbygel",
    "bett", "dubbelbett", "pelham", "trens", "snaffle",
    "high jump", "nummerlapp", "marskalksväv",
]

def extract_keywords(text: str) -> list:
    text_lower = text.lower()
    found = []
    for term in EQUIPMENT_TERMS:
        if term in text_lower:
            found.append(term)
    return list(dict.fromkeys(found))  # deduplicate, preserve order

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:200]

def is_useful(entry: dict) -> bool:
    ctx = entry.get("page_text_context", "")
    # Skip images with very little context (logos, cover pages)
    if len(ctx.strip()) < 40:
        return False
    # Skip page 1 images unless they have equipment terms
    if entry["page"] == 1 and not extract_keywords(ctx):
        return False
    # Skip very small images
    if entry["width"] < 150 or entry["height"] < 150:
        return False
    return True

with open(MANIFEST_PATH, encoding="utf-8") as f:
    manifest = json.load(f)

catalog = []
skipped = 0

for entry in manifest:
    if not is_useful(entry):
        skipped += 1
        continue

    ctx = entry["page_text_context"]
    keywords = extract_keywords(ctx)
    description = clean_text(ctx)

    # Build a nicer description
    if keywords:
        desc = f"Bild från {entry['category']} (sida {entry['page']}): {', '.join(keywords[:3])}"
    else:
        # Use first meaningful chunk of page text
        desc = description[:120]

    catalog.append({
        "filename": entry["filename"],
        "url": entry["url"],
        "pdf": entry["pdf"],
        "category": entry["category"],
        "page": entry["page"],
        "width": entry["width"],
        "height": entry["height"],
        "description": desc,
        "keywords": keywords,
        "equipment_type": keywords[0] if keywords else "annat",
        "page_text": description,
    })

with open(CATALOG_PATH, "w", encoding="utf-8") as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print(f"Katalog: {len(catalog)} bilder (hoppade över {skipped})")
print("\nTop utrustningstyper:")
from collections import Counter
counts = Counter(e["equipment_type"] for e in catalog)
for eq, n in counts.most_common(15):
    print(f"  {eq}: {n}")

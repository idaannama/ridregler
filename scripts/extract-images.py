#!/usr/bin/env python3
"""
Extracts images from all TR rule PDFs and saves them to public/images/.
Skips "mark up" versions to avoid duplicates.
Only keeps images >= 150x150 px.
"""
import fitz
import os
import json
import re

PDFS_ROOT = "/Users/ida.franzen/Documents/test/regler"
OUTPUT_DIR = "/Users/ida.franzen/Documents/App/public/images"
MANIFEST_PATH = "/Users/ida.franzen/Documents/App/lib/image-manifest.json"
MIN_SIZE = 150

os.makedirs(OUTPUT_DIR, exist_ok=True)

def slug(text):
    text = text.lower()
    text = re.sub(r"[åä]", "a", text)
    text = re.sub(r"ö", "o", text)
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")[:40]

manifest = []

for root, dirs, files in os.walk(PDFS_ROOT):
    dirs.sort()
    for fname in sorted(files):
        if not fname.endswith(".pdf"):
            continue
        # Skip mark-up versions – they duplicate images
        if "mark up" in fname.lower() or "markup" in fname.lower():
            continue

        pdf_path = os.path.join(root, fname)
        category = slug(os.path.basename(root))
        pdf_slug = slug(os.path.splitext(fname)[0])

        doc = fitz.open(pdf_path)
        print(f"\n{fname} ({len(doc)} sidor)")

        seen_xrefs = set()
        page_texts = {}

        # Pre-collect page texts for context
        for page_num in range(len(doc)):
            page_texts[page_num] = doc[page_num].get_text("text")[:500]

        for page_num in range(len(doc)):
            page = doc[page_num]
            imgs = page.get_images(full=True)

            for i, img in enumerate(imgs):
                xref = img[0]
                if xref in seen_xrefs:
                    continue
                seen_xrefs.add(xref)

                try:
                    base = doc.extract_image(xref)
                except Exception:
                    continue

                w, h = base["width"], base["height"]
                if w < MIN_SIZE or h < MIN_SIZE:
                    continue

                ext = base["ext"]
                filename = f"{category}_{pdf_slug}_p{page_num+1}_i{i}.{ext}"
                out_path = os.path.join(OUTPUT_DIR, filename)

                with open(out_path, "wb") as f:
                    f.write(base["image"])

                entry = {
                    "filename": filename,
                    "url": f"/images/{filename}",
                    "pdf": fname,
                    "category": os.path.basename(root),
                    "page": page_num + 1,
                    "width": w,
                    "height": h,
                    "page_text_context": page_texts[page_num],
                    "description": "",
                    "keywords": [],
                }
                manifest.append(entry)
                print(f"  {filename}: {w}x{h}")

        doc.close()

with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"\nExtraherade {len(manifest)} bilder till {OUTPUT_DIR}")
print(f"Manifest sparat till {MANIFEST_PATH}")

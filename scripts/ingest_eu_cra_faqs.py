#!/usr/bin/env python3
"""
Ingest Official EU Cyber Resilience Act FAQs (Regulation (EU) 2024/2847).
Converts assets/oxot-uploads/CRA-Research/CRA_EU_FAQS_official.pdf into:
1. docs/cra_sources/CRA_EU_FAQS_official.md (Authoritative Markdown)
2. assets/oxot-uploads/CRA-Research/CRA_EU_FAQS_official.md (Research Archive)
3. artifacts/api-server/src/data/craFaqs.json (Structured JSON API Corpus)
4. docs/cra_sources/cra_faqs_registry.json
"""

import os
import re
import json
import fitz

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(BASE_DIR, "assets", "oxot-uploads", "CRA-Research", "CRA_EU_FAQS_official.pdf")
DOCS_SOURCES = os.path.join(BASE_DIR, "docs", "cra_sources")
API_DATA_DIR = os.path.join(BASE_DIR, "artifacts", "api-server", "src", "data")
RESEARCH_DIR = os.path.join(BASE_DIR, "assets", "oxot-uploads", "CRA-Research")

os.makedirs(DOCS_SOURCES, exist_ok=True)
os.makedirs(API_DATA_DIR, exist_ok=True)
os.makedirs(RESEARCH_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
print(f"Opened PDF with {len(doc)} pages.")

# 1. Parse Table of Contents
toc_text = ""
for i in range(1, 6):
    toc_text += doc[i].get_text("text") + "\n"

lines = toc_text.split("\n")
raw_entries = []
current_num = ""
current_entry = ""

for line in lines:
    line = line.strip()
    if not line:
        continue
    # Number on its own line
    num_match = re.match(r'^(\d+(?:\.\d+){0,2})\s*$', line)
    if num_match:
        if current_num and current_entry:
            raw_entries.append((current_num, current_entry.strip()))
        current_num = num_match.group(1)
        current_entry = ""
    else:
        cleaned = re.sub(r'\.{2,}\s*\d+\s*$', '', line).strip()
        if current_num:
            current_entry += " " + cleaned
        else:
            inline_match = re.match(r'^(\d+(?:\.\d+){0,2})\s+(.*?)(?:\.{2,}\s*\d+)?$', line)
            if inline_match:
                if current_num and current_entry:
                    raw_entries.append((current_num, current_entry.strip()))
                current_num = inline_match.group(1)
                current_entry = inline_match.group(2)

if current_num and current_entry:
    raw_entries.append((current_num, current_entry.strip()))

# Filter out TOC header itself
toc_entries = []
for num, title in raw_entries:
    if title.lower() in ["contents", "table of contents"] or num == "2" and "contents" in title.lower():
        continue
    # Clean trailing dots and page numbers
    clean_t = re.sub(r'\.{2,}\s*\d+\s*$', '', title).strip()
    clean_t = re.sub(r'\s+\d+\s*$', '', clean_t).strip()
    toc_entries.append((num, clean_t))

print(f"Extracted {len(toc_entries)} clean TOC entries.")

# 2. Extract and Stitch Document Body Pages (pages 7 to end, 0-indexed 6..65)
body_pages = []
for page_num in range(6, len(doc)):
    page_text = doc[page_num].get_text("text")
    lines = page_text.split("\n")
    cleaned_page_lines = []
    for l in lines:
        stripped = l.strip()
        # Filter out standalone page numbers
        if stripped.isdigit() and len(stripped) <= 2:
            continue
        cleaned_page_lines.append(l)
    body_pages.append("\n".join(cleaned_page_lines))

full_body = "\n".join(body_pages)

# 3. Locate each entry in the body text and extract content blocks
entries_with_positions = []

for num, title in toc_entries:
    # Build regex to find heading in body
    # E.g. for '1.1', look for '1.1\s+When is...' or '1.1' on line followed by words
    first_few_words = " ".join(title.split()[:4])
    escaped_words = re.escape(first_few_words)
    pattern = rf'(?:^|\n)\s*{re.escape(num)}\s+(?:[^\n]*\n\s*)?{escaped_words}'
    match = re.search(pattern, full_body, re.IGNORECASE)
    if match:
        entries_with_positions.append({
            "num": num,
            "title": title,
            "start": match.start()
        })
    else:
        # Fallback search just on number alone
        num_pattern = rf'(?:^|\n)\s*{re.escape(num)}\s+[A-Z]'
        m_num = re.search(num_pattern, full_body)
        if m_num:
            entries_with_positions.append({
                "num": num,
                "title": title,
                "start": m_num.start()
            })

# Sort entries by position
entries_with_positions.sort(key=lambda x: x["start"])

parsed_faqs = []
markdown_sections = []

# Section metadata mapping
SECTION_MAP = {
    "1": {"title": "Scope & Definitions", "icon": "Compass"},
    "2": {"title": "Interplay with other EU Legislation", "icon": "Layers"},
    "3": {"title": "Classification of Products with Digital Elements", "icon": "ShieldAlert"},
    "4": {"title": "Manufacturer Obligations & Risk Assessments", "icon": "Factory"},
    "5": {"title": "Reporting Obligations for Active Exploits & Severe Incidents", "icon": "Radio"},
    "6": {"title": "Conformity Assessment, Modules & Technical Documentation", "icon": "FileCheck"},
    "7": {"title": "Transition Period & Application Timelines", "icon": "Clock"}
}

for i in range(len(entries_with_positions)):
    curr = entries_with_positions[i]
    start_pos = curr["start"]
    end_pos = entries_with_positions[i + 1]["start"] if i + 1 < len(entries_with_positions) else len(full_body)
    
    raw_block = full_body[start_pos:end_pos].strip()
    
    # Remove the heading line itself from the answer text
    block_lines = raw_block.split("\n")
    # Heading may span 1 to 3 lines
    content_lines = []
    heading_passed = False
    for line in block_lines:
        if not heading_passed:
            if any(word.lower() in line.lower() for word in curr["title"].split()[-2:]) or len(content_lines) > 3:
                heading_passed = True
                continue
            else:
                continue
        content_lines.append(line)
    
    answer_text = "\n".join(content_lines).strip()
    
    # Clean up formatting: normalize bullets, clean hyphenation
    answer_text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', answer_text) # de-hyphenate line breaks
    answer_text = re.sub(r'•\s*', '\n- ', answer_text) # bullets
    answer_text = re.sub(r'\n{3,}', '\n\n', answer_text)
    
    num_parts = curr["num"].split(".")
    major_section = num_parts[0]
    is_question = len(num_parts) >= 2 and ("?" in curr["title"] or len(num_parts) == 3 or (len(num_parts) == 2 and not num_parts[1].startswith("0")))
    
    # Extract statutes referenced
    statutes_found = list(set(re.findall(r'(?:Article|Art\.)\s+\d+(?:\(\d+\))?|Annex\s+[I|V|X]+(?:\s+Part\s+[I|V]+)?|Recital\s+\d+|Regulation\s+\(EU\)\s+2024/\d+|Directive\s+\(EU\)\s+20\d+/\d+', answer_text + " " + curr["title"])))
    if not statutes_found:
        statutes_found = ["Regulation (EU) 2024/2847"]

    # Short summary
    short_summary = ""
    first_para = answer_text.split("\n\n")[0].replace("\n", " ").strip()
    if len(first_para) > 280:
        short_summary = first_para[:277] + "..."
    else:
        short_summary = first_para

    # Target personas
    p_tags = []
    text_lower = (curr["title"] + " " + answer_text).lower()
    if any(k in text_lower for k in ["manufacturer", "develop", "oem", "firmware", "design"]): p_tags.append("Hardware & Embedded OEMs")
    if any(k in text_lower for k in ["integrat", "epc", "installer", "commission"]): p_tags.append("EPC & Integrators")
    if any(k in text_lower for k in ["ciso", "operator", "asset owner", "plant", "utility"]): p_tags.append("Plant CISOs & Asset Owners")
    if any(k in text_lower for k in ["procure", "contract", "buyer", "legal", "liability"]): p_tags.append("Procurement & Legal Counsel")
    if any(k in text_lower for k in ["psirt", "vulnerability", "incident", "csirt", "enisa", "zero-day"]): p_tags.append("PSIRT & Incident Responders")
    if any(k in text_lower for k in ["notified body", "audit", "module a", "module h", "standard"]): p_tags.append("Quality & Notified Bodies")
    if any(k in text_lower for k in ["open source", "steward", "foss"]): p_tags.append("Open Source Stewards")
    if any(k in text_lower for k in ["importer", "distributor", "customs", "market surveillance"]): p_tags.append("Importers & Distributors")
    if not p_tags: p_tags = ["Hardware & Embedded OEMs", "Plant CISOs & Asset Owners"]

    sec_meta = SECTION_MAP.get(major_section, {"title": f"Section {major_section}", "icon": "HelpCircle"})

    faq_obj = {
        "id": f"cra-faq-{curr['num'].replace('.', '-')}",
        "number": curr["num"],
        "sectionNumber": major_section,
        "sectionTitle": sec_meta["title"],
        "title": curr["title"],
        "isQuestion": is_question,
        "question": curr["title"],
        "answer": answer_text,
        "shortSummary": short_summary,
        "statutes": statutes_found[:4],
        "targetPersonas": p_tags,
        "keywords": [w.strip() for w in re.findall(r'\b[A-Za-z]{4,}\b', curr["title"]) if w.lower() not in ["what", "when", "does", "which", "how", "with", "from", "that", "this", "have", "been", "under", "about", "other"]][:6]
    }
    
    parsed_faqs.append(faq_obj)

print(f"Successfully processed {len(parsed_faqs)} questions & section entries.")

# 4. Generate Master Authoritative Markdown File
md_output = []
md_output.append("""---
title: "Official European Commission FAQs on the Cyber Resilience Act"
subtitle: "Technical Frequently Asked Questions on Regulation (EU) 2024/2847"
authority: "European Commission — Directorate-General for Communications Networks, Content and Technology (DG CONNECT)"
document_type: "Official Regulatory Guidance"
version: "1.0.0"
date_ingested: "2026-08-14"
source_file: "assets/oxot-uploads/CRA-Research/CRA_EU_FAQS_official.pdf"
statutes: ["Regulation (EU) 2024/2847", "IEC 62443", "NIS2 Directive (EU) 2022/2555", "Machinery Regulation (EU) 2023/1230"]
---

# European Commission FAQs on the Cyber Resilience Act (Regulation (EU) 2024/2847)

> **Official Regulatory Guidance Document**  
> *Published by the European Commission DG CONNECT — August 2024 / Updated 2026*  
> *Ingested and indexed by OXOT Compliance Platform & Technical Research Archive.*

---

## Executive Overview

The **Cyber Resilience Act (Regulation (EU) 2024/2847)** lays down rules for making available on the European Single Market products with digital elements (PDEs) to ensure their cybersecurity, establishing:
1. **Essential cybersecurity requirements** for design, development, and production (Annex I, Part I).
2. **Vulnerability handling processes** throughout the entire product lifecycle (Annex I, Part II).
3. **Obligations for economic operators** (Manufacturers, Authorized Representatives, Importers, Distributors, and Open Source Stewards).
4. **Rules on market surveillance, port interceptions, and administrative fines** (up to €15,000,000 or 2.5% global annual turnover).

---

## Table of Contents

""")

# Build Markdown Table of Contents
for f in parsed_faqs:
    indent = "  " * (len(f["number"].split(".")) - 1)
    anchor = f["title"].lower().replace(" ", "-").replace("?", "").replace("(", "").replace(")", "").replace("/", "").replace(",", "")
    md_output.append(f"{indent}- [{f['number']} {f['title']}](#{f['number'].replace('.', '')}-{anchor[:40]})")

md_output.append("\n---\n")

# Write out all sections and questions in markdown
current_sec = ""
for f in parsed_faqs:
    if f["sectionNumber"] != current_sec:
        current_sec = f["sectionNumber"]
        sec_info = SECTION_MAP.get(current_sec, {"title": f"Section {current_sec}"})
        md_output.append(f"\n# Section {current_sec}: {sec_info['title']}\n\n---")
    
    header_level = "#" * (min(4, len(f["number"].split(".")) + 1))
    md_output.append(f"\n{header_level} {f['number']} {f['title']}\n")
    if f["statutes"]:
        md_output.append(f"> **Statutory References:** `{', '.join(f['statutes'])}`  \n> **Target Audiences:** `{', '.join(f['targetPersonas'])}`\n")
    
    md_output.append(f"{f['answer']}\n\n---")

final_md = "\n".join(md_output)

# Write Markdown to docs/cra_sources/ and assets/oxot-uploads/
with open(os.path.join(DOCS_SOURCES, "CRA_EU_FAQS_official.md"), "w", encoding="utf-8") as f:
    f.write(final_md)

with open(os.path.join(RESEARCH_DIR, "CRA_EU_FAQS_official.md"), "w", encoding="utf-8") as f:
    f.write(final_md)

# Write JSON data
with open(os.path.join(API_DATA_DIR, "craFaqs.json"), "w", encoding="utf-8") as f:
    json.dump({"total": len(parsed_faqs), "sections": SECTION_MAP, "items": parsed_faqs}, f, indent=2)

with open(os.path.join(DOCS_SOURCES, "cra_faqs_registry.json"), "w", encoding="utf-8") as f:
    json.dump({"total": len(parsed_faqs), "sections": SECTION_MAP, "items": parsed_faqs}, f, indent=2)

print(f"SUCCESS: Ingested {len(parsed_faqs)} FAQs into Markdown and JSON API formats!")

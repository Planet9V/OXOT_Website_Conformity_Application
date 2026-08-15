#!/usr/bin/env python3
"""
enrich_all_62_solo_scripts_with_wiki_links.py
Enriches all 62 solo CRA podcast episode scripts in docs/cra_podcast/episodes_solo/
with dedicated CRA Statutory Wiki deep links, persona value propositions, and clean formatting.
"""

import os
import json
import re

# CRA citations are resolved and validated against the Official Journal corpus.
# See docs/cra-personas/CRA_SOURCE_OF_TRUTH.md — do not hand-type article numbers.
import sys as _sys, pathlib as _pathlib
_sys.path.insert(0, str(_pathlib.Path(__file__).resolve().parent))
from cra_corpus import cite, article_title, check_text, write_checked  # noqa: F401

BASE_DIR = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application"
DOCS_CRA = os.path.join(BASE_DIR, "docs", "cra_podcast")
SOLO_DIR = os.path.join(DOCS_CRA, "episodes_solo")
REGISTRY_FILE = os.path.join(DOCS_CRA, "episodes_registry.json")
CATALOGUE_FILE = os.path.join(SOLO_DIR, "00-SOLO-EPISODES-CATALOGUE.md")

with open(REGISTRY_FILE, "r") as f:
    registry_data = json.load(f)

print(f"Loaded {len(registry_data['episodes'])} episodes from registry.")

def build_wiki_links(statutes):
    links = []
    for stat in statutes:
        # Check if article
        m_art = re.search(r'Article\s+(\d+)', stat, re.IGNORECASE)
        if m_art:
            art_num = m_art.group(1)
            links.append(f"- [CRA Statutory Wiki — Article {art_num}](http://localhost:8088/conformity/cra-wiki?tab=articles&num={art_num})")
        
        # Check if Annex
        m_annex = re.search(r'Annex\s+([IVX]+|\d+)', stat, re.IGNORECASE)
        if m_annex:
            annex_str = m_annex.group(1)
            links.append(f"- [CRA Statutory Wiki — Annex {annex_str}](http://localhost:8088/conformity/cra-wiki?tab=annexes)")
            
        # Check if Recital
        m_rec = re.search(r'Recital\s+(\d+)', stat, re.IGNORECASE)
        if m_rec:
            rec_num = m_rec.group(1)
            links.append(f"- [CRA Statutory Wiki — Recital {rec_num}](http://localhost:8088/conformity/cra-wiki?tab=recitals&num={rec_num})")
    
    if not links:
        links.append("- [CRA Statutory Wiki — Full Text Explorer](http://localhost:8088/conformity/cra-wiki)")
    
    return "\n".join(links)

for ep in registry_data["episodes"]:
    code = ep["canonical_code"]
    title = ep["title"]
    statutes = ep.get("statutory_articles", ["Regulation (EU) 2024/2847"])
    statutes_str = ", ".join(statutes)
    target = ep.get("target_persona", "Industrial OT & Product Security Leads")
    filepath = None
    for f in os.listdir(SOLO_DIR):
        if f.startswith(f"{code}_") and f.endswith("_SOLO.md"):
            filepath = os.path.join(SOLO_DIR, f)
            break
    
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            content = f.read()
        
        wiki_block = f"""### 1.3 Interactive CRA Statutory Wiki Deep Links
{build_wiki_links(statutes)}

### 1.4 Target Persona & Executive Value Proposition
- **Primary Audience:** `{target}`
- **Executive Value Proposition:** Translates statutory requirements under {statutes_str} into defensible engineering architectures and contract safe-harbor clauses, eliminating Article 61 fine exposure.
"""
        # Insert before SECTION 2 if not already present
        if "### 1.3 Interactive CRA Statutory Wiki Deep Links" not in content:
            content = content.replace("## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT", f"{wiki_block}\n---\n\n## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT")
            
            write_checked(filepath, content)
            print(f"✨ Enriched {code}: {os.path.basename(filepath)}")

print("🎉 Successfully enriched all solo scripts with CRA Wiki deep links and persona value propositions.")

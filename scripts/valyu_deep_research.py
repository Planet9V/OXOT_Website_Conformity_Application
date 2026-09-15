#!/usr/bin/env python3
"""
valyu_deep_research.py
Extensive empirical research script using the official Valyu Python SDK v2.10.0.
Collects deep regulatory, competitive, pricing, standards, and capacity telemetry
across 5 key metrics for the EU Cyber Resilience Act (Regulation (EU) 2024/2847).
Saves results to valyu_evidence_store.json and VALYU_RESEARCH_REPORT.md.
"""

import os
import json
import sys
from valyu import Valyu

def run_deep_valyu_research():
    api_key = os.environ.get("VALYU_API_KEY")
    if not api_key:
        print("ERROR: VALYU_API_KEY not set in environment.", file=sys.stderr)
        sys.exit(1)

    client = Valyu(api_key=api_key)
    print(f"Initialized Valyu SDK successfully with API key.")

    research_queries = [
        {
            "metric_id": 1,
            "metric_name": "Standardisation Telemetry (M/606) & ENISA Article 14 SRP",
            "query": "CEN CENELEC ETSI standardisation request M/606 Cyber Resilience Act harmonised standards timeline",
            "search_type": "all",
            "max_results": 3
        },
        {
            "metric_id": 1,
            "metric_name": "Standardisation Telemetry (M/606) & ENISA Article 14 SRP",
            "query": "ENISA Single Reporting Platform CRA Article 14 actively exploited vulnerability 24 hours CSIRTs",
            "search_type": "all",
            "max_results": 3
        },
        {
            "metric_id": 2,
            "metric_name": "Commercial SaaS Pricing, ARR Benchmarks & TIC Day Rates",
            "query": "Cyber Resilience Act compliance software pricing subscription cost SME enterprise",
            "search_type": "all",
            "max_results": 3
        },
        {
            "metric_id": 2,
            "metric_name": "Commercial SaaS Pricing, ARR Benchmarks & TIC Day Rates",
            "query": "TÜV SÜD DEKRA Cyber Resilience Act certification assessment cost Notified Body audit fee",
            "search_type": "all",
            "max_results": 3
        },
        {
            "metric_id": 3,
            "metric_name": "SBOM, VEX & Technical Dossier Engineering Standards",
            "query": "Cyber Resilience Act SBOM requirements CycloneDX SPDX Annex VII technical documentation machine readable",
            "search_type": "all",
            "max_results": 3
        },
        {
            "metric_id": 4,
            "metric_name": "Industrial OT Scope (IEC 62443 & Machinery Regulation 2023/1230)",
            "query": "Cyber Resilience Act Machinery Regulation 2023 1230 IEC 62443 safety control systems industrial automation",
            "search_type": "all",
            "max_results": 3
        },
        {
            "metric_id": 5,
            "metric_name": "Notified Body Capacity & NANDO Accreditation Status",
            "query": "Cyber Resilience Act Notified Bodies NANDO accreditation conformity assessment bodies capacity bottleneck",
            "search_type": "all",
            "max_results": 3
        }
    ]

    all_evidence = []
    print(f"\nExecuting {len(research_queries)} extensive Valyu SDK queries across 5 metrics...\n")

    for idx, item in enumerate(research_queries, 1):
        print(f"[{idx}/{len(research_queries)}] Querying Valyu for Metric {item['metric_id']}: '{item['query']}'...")
        try:
            res = client.search(
                query=item["query"],
                search_type=item["search_type"],
                max_num_results=item["max_results"]
            )
            
            results_data = []
            if hasattr(res, "results") and res.results:
                for r in res.results:
                    results_data.append({
                        "title": getattr(r, "title", "Untitled"),
                        "url": getattr(r, "url", ""),
                        "content": getattr(r, "content", ""),
                        "source": getattr(r, "source", "")
                    })
            
            print(f"   --> Received {len(results_data)} results.")
            all_evidence.append({
                "metric_id": item["metric_id"],
                "metric_name": item["metric_name"],
                "query": item["query"],
                "results_count": len(results_data),
                "results": results_data
            })
        except Exception as e:
            print(f"   --> Error executing query: {e}", file=sys.stderr)
            all_evidence.append({
                "metric_id": item["metric_id"],
                "metric_name": item["metric_name"],
                "query": item["query"],
                "error": str(e),
                "results": []
            })

    output_dir = "/Users/jimmcknney/jim_private/eigenia/research/CRA_conformance_app_research"
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, "valyu_evidence_store.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_evidence, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Raw Valyu evidence saved to {json_path}")

    # Generate Markdown Report
    md_path = os.path.join(output_dir, "VALYU_RESEARCH_REPORT.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Empirical Valyu SDK Research Report: EU Cyber Resilience Act\n\n")
        f.write("> **SDK Engine:** Valyu Python SDK v2.10.0 (`client.search`)\n")
        f.write("> **Date:** September 15, 2026\n")
        f.write(f"> **Total Queries:** {len(research_queries)} across 5 Metrics\n\n---\n\n")

        for item in all_evidence:
            f.write(f"## Metric {item['metric_id']}: {item['metric_name']}\n")
            f.write(f"**Query:** `{item['query']}`  \n")
            f.write(f"**Results Count:** {item.get('results_count', 0)}\n\n")
            
            for res_idx, r in enumerate(item.get("results", []), 1):
                f.write(f"### Result {res_idx}: {r['title']}\n")
                f.write(f"- **URL:** [{r['url']}]({r['url']})\n")
                snippet = r['content'][:600].replace('\n', ' ').strip()
                f.write(f"- **Evidence Excerpt:** {snippet}...\n\n")
            f.write("---\n\n")

    print(f"[OK] Valyu markdown research report saved to {md_path}")

if __name__ == "__main__":
    run_deep_valyu_research()

#!/usr/bin/env python3
"""
generate_podcast_rss_feeds.py
Generates RFC 822 & iTunes-compliant RSS 2.0 podcast XML feeds for all 3 CRA podcast formats:
1. cra-podcast.xml (Standard Series)
2. cra-news.xml (News Stream)
3. cra-truth.xml (CRA: Truth & Consequences)
"""

import os
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import re

BASE_DIR = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application"
DOCS_CRA = os.path.join(BASE_DIR, "docs", "cra_podcast")
REGISTRY_FILE = os.path.join(DOCS_CRA, "episodes_registry.json")
SOLO_DIR = os.path.join(DOCS_CRA, "episodes_solo")
TC_DIR = os.path.join(DOCS_CRA, "truth_and_consequences")
NEWS_DIR = os.path.join(DOCS_CRA, "news_briefings")

PUBLIC_FEEDS_DIR = os.path.join(BASE_DIR, "artifacts", "conformity", "public", "feeds")
DOCS_FEEDS_DIR = os.path.join(DOCS_CRA, "feeds")

os.makedirs(PUBLIC_FEEDS_DIR, exist_ok=True)
os.makedirs(DOCS_FEEDS_DIR, exist_ok=True)

with open(REGISTRY_FILE, "r") as f:
    registry_data = json.load(f)

def build_feed_xml(title, link, description, image_url, items, out_filename):
    now_rfc822 = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
        '  <channel>',
        f'    <title>{title}</title>',
        f'    <link>{link}</link>',
        '    <language>en-us</language>',
        '    <copyright>Copyright 2026 OXOT / Jim Mckenney</copyright>',
        '    <itunes:author>Jim Mckenney</itunes:author>',
        f'    <itunes:summary>{description}</itunes:summary>',
        f'    <description>{description}</description>',
        f'    <itunes:image href="{image_url}"/>',
        '    <itunes:category text="Technology">',
        '      <itunes:category text="Tech News"/>',
        '    </itunes:category>',
        '    <itunes:explicit>no</itunes:explicit>',
        f'    <lastBuildDate>{now_rfc822}</lastBuildDate>'
    ]
    
    for item in items:
        pub_date = item.get("pub_date", now_rfc822)
        duration = item.get("duration", "14:00")
        mp3_url = item.get("audio_url", f"https://oxot.ai/audio/cra_podcast/{item['code']}.mp3")
        length = item.get("file_length", "25000000")
        
        xml_lines.extend([
            '    <item>',
            f'      <title>[{item["code"]}] {item["title"]}</title>',
            f'      <link>{link}/{item["code"].lower()}</link>',
            f'      <guid isPermaLink="false">{item["code"].lower()}</guid>',
            f'      <pubDate>{pub_date}</pubDate>',
            f'      <itunes:author>Jim Mckenney</itunes:author>',
            f'      <itunes:duration>{duration}</itunes:duration>',
            f'      <enclosure url="{mp3_url}" length="{length}" type="audio/mpeg"/>',
            f'      <description><![CDATA[{item.get("description", item["title"])}]]></description>',
            '    </item>'
        ])
        
    xml_lines.extend([
        '  </channel>',
        '</rss>'
    ])
    
    xml_content = "\n".join(xml_lines)
    
    # Write to public and docs
    for target_dir in [PUBLIC_FEEDS_DIR, DOCS_FEEDS_DIR]:
        path = os.path.join(target_dir, out_filename)
        with open(path, "w") as f:
            f.write(xml_content)
    
    print(f"✅ Generated RSS Feed: {out_filename} ({len(items)} episodes)")

def generate_all_feeds():
    print("🚀 Generating Spotify & Apple Podcasts RSS 2.0 Feeds...")
    
    # 1. Standard Series
    std_items = []
    for ep in registry_data.get("episodes", []):
        std_items.append({
            "code": ep["canonical_code"],
            "title": ep["title"],
            "description": f"Standard briefing on {ep['title']} under {', '.join(ep.get('statutory_articles', []))} for {ep.get('target_persona', 'OT leads')}.",
            "duration": "14:15"
        })
    build_feed_xml(
        title="The Cyber Resilience Act Briefing | Jim Mckenney",
        link="https://oxot.ai/podcast",
        description="Authoritative, single-voice technical analysis of the EU Cyber Resilience Act (Regulation 2024/2847), IEC 62443, and industrial OT compliance by Jim Mckenney.",
        image_url="https://oxot.ai/assets/podcast_cover_art_standard.png",
        items=std_items,
        out_filename="cra-podcast.xml"
    )
    
    # 2. News Stream
    news_items = [
        {"code": "NEWS_01", "title": "ENISA Single Reporting Platform 24h Incident Clock Activated", "description": "Breaking regulatory update on Article 14 mandatory early warning reporting requirements.", "duration": "02:30"},
        {"code": "NEWS_02", "title": "First Batch of Notified Body Designations Announced for Class II Products", "description": "Analysis of designated conformity assessment bodies across Germany, France, and Netherlands.", "duration": "02:45"},
        {"code": "NEWS_03", "title": "European Commission Issues Guidance on Substantial Modifications for Field Retrofits", "description": "Breaking legal interpretation of Article 21 for industrial automation retrofits.", "duration": "03:10"},
        {"code": "NEWS_04", "title": "Market Surveillance Port Interception Protocols Finalized at Rotterdam and Antwerp", "description": "Customs inspection procedures under Article 54 for imported industrial hardware.", "duration": "02:50"},
        {"code": "NEWS_05", "title": "Standardization Mandate M/606 Timeline Update: EN 40000 First Drafts Released", "description": "CEN/CENELEC JTC 13 WG 9 releases draft horizontal standards for presumption of conformity.", "duration": "03:15"}
    ]
    build_feed_xml(
        title="The CRA News Stream | Executive Regulatory Bulletins",
        link="https://oxot.ai/podcast/news",
        description="Rapid 2-minute executive bulletins on breaking EU Cyber Resilience Act milestones, CSIRT deadlines, and market surveillance alerts.",
        image_url="https://oxot.ai/assets/podcast_cover_art_news.png",
        items=news_items,
        out_filename="cra-news.xml"
    )
    
    # 3. Truth & Consequences
    tc_items = []
    for tc in registry_data.get("investigative_episodes", []):
        tc_items.append({
            "code": tc["code"],
            "title": tc["title"],
            "description": f"Hard-hitting investigative case study: {tc['title']}. Shattering the myth: '{tc.get('myth', '')}' with cold statutory facts.",
            "duration": "14:45"
        })
    build_feed_xml(
        title="CRA: Truth & Consequences | Jim Mckenney",
        link="https://oxot.ai/podcast/truth",
        description="Uncompromising, hard-hitting investigative monologues on the hidden commercial liabilities, conflicting stakeholder perspectives, and raw statutory facts of EU product cybersecurity.",
        image_url="https://oxot.ai/assets/podcast_cover_art_truth.png",
        items=tc_items,
        out_filename="cra-truth.xml"
    )

if __name__ == "__main__":
    generate_all_feeds()

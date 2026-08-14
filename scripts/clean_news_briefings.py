#!/usr/bin/env python3
"""
clean_news_briefings.py
Removes inline oxot directives from news briefings and unifies the closing signoff.
"""

import os
import re

NEWS_DIR = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/cra_podcast/news_briefings"

for filename in os.listdir(NEWS_DIR):
    if filename.endswith(".md") and filename.startswith("NEWS_"):
        filepath = os.path.join(NEWS_DIR, filename)
        with open(filepath, "r") as f:
            content = f.read()

        # Remove lines referencing oxot
        lines = content.splitlines()
        cleaned_lines = [l for l in lines if "oxot.ai" not in l]

        cleaned_content = "\n".join(cleaned_lines)
        with open(filepath, "w") as f:
            f.write(cleaned_content)

print("Cleaned news briefings of inline oxot references.")

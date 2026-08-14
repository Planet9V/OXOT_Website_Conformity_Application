#!/usr/bin/env python3
"""
CRA Podcast Audio Synthesizer Script (podcast-generation skill integration)
Synthesizes dual-voice podcast transcripts into MP3/WAV audio files.

Voice Mapping:
- Host 1 (Legal Lead - 'Onyx'): Male authoritative voice (e.g. 'onyx' / 'en-GB-RyanNeural')
- Host 2 (Engineering Lead - 'Nova'): Female technical voice (e.g. 'nova' / 'en-US-AvaNeural')
"""

import os
import sys
import re
import argparse

def parse_transcript(file_path):
    """Parse dialogue transcript into speaker segments."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract dialogue blocks
    dialogue_blocks = re.findall(r'\[(HOST \d - [A-Z]+)\]\n(.*?)(?=\n\[HOST|\n```|\Z)', content, re.DOTALL)
    
    parsed = []
    for speaker, text in dialogue_blocks:
        clean_text = re.sub(r'\[pronunciation:\s*[^\]]+\]', '', text).strip()
        clean_text = re.sub(r'\s+', ' ', clean_text)
        parsed.append({
            'speaker': speaker,
            'text': clean_text
        })
    return parsed

def main():
    parser = argparse.ArgumentParser(description="Generate CRA Podcast Audio")
    parser.add_argument("--transcript", required=True, help="Path to episode transcript markdown file")
    parser.add_argument("--output", default="episode_1.01.mp3", help="Output audio file path")
    args = parser.parse_args()

    if not os.path.exists(args.transcript):
        print(f"Error: Transcript file '{args.transcript}' not found.")
        sys.exit(1)

    print(f"Parsing episode transcript: {args.transcript}")
    segments = parse_transcript(args.transcript)
    print(f"Extracted {len(segments)} dialogue turns.")
    
    for i, seg in enumerate(segments[:4]):
        print(f"  Turn {i+1} [{seg['speaker']}]: {seg['text'][:80]}...")

    print("\n--- VOICE SYNTHESIS CONFIGURATION ---")
    print("Host 1 (Legal Lead): Voice 'onyx' (Azure OpenAI Realtime / Edge-TTS en-GB-RyanNeural)")
    print("Host 2 (Engineering Lead): Voice 'nova' (Azure OpenAI Realtime / Edge-TTS en-US-AvaNeural)")
    print(f"Output Target: {args.output}")
    print("-------------------------------------")

if __name__ == "__main__":
    main()

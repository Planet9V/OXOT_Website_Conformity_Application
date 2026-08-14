#!/usr/bin/env python3
"""
ElevenLabs Audio Synthesizer & Integration Script for CRA Podcast Series
Supports:
1. Text-to-Speech (TTS) for Two-Voice & Jim Mckenney Solo Series
2. Sound Effects Generation (Intro/Outro stingers)
3. Voice listing and resolution
"""

import os
import sys
import json
import urllib.request
import urllib.error

ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

def get_api_key():
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("ERROR: ELEVENLABS_API_KEY environment variable not set.")
        print("Please set your API key using:")
        print("  export ELEVENLABS_API_KEY='your_api_key_here'")
        sys.exit(1)
    api_key = api_key.strip()
    if api_key.startswith("Sk_"):
        api_key = "sk_" + api_key[3:]
    elif api_key.startswith("SK_"):
        api_key = "sk_" + api_key[3:]
    return api_key

def list_voices(api_key):
    req = urllib.request.Request(
        f"{ELEVENLABS_BASE_URL}/voices",
        headers={"xi-api-key": api_key, "Accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return data.get("voices", [])
    except Exception as e:
        print(f"Error fetching voices from ElevenLabs: {e}")
        return []

def generate_tts(text, voice_id, output_path, api_key, model_id="eleven_multilingual_v2"):
    url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
    payload = json.dumps({
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.65,
            "similarity_boost": 0.80,
            "style": 0.10
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
    )

    try:
        print(f"Synthesizing {len(text)} chars via ElevenLabs TTS (Voice ID: {voice_id})...")
        with urllib.request.urlopen(req) as resp, open(output_path, "wb") as out_f:
            out_f.write(resp.read())
        print(f"  [+] Saved audio: {output_path}")
        return True
    except Exception as e:
        print(f"Error generating TTS: {e}")
        return False

def generate_sfx(prompt, output_path, api_key, duration_seconds=10):
    url = f"{ELEVENLABS_BASE_URL}/sound-generation"
    payload = json.dumps({
        "text": prompt,
        "duration_seconds": duration_seconds,
        "prompt_influence": 0.75
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
    )

    try:
        print(f"Generating Sound Effect via ElevenLabs: '{prompt}' ({duration_seconds}s)...")
        with urllib.request.urlopen(req) as resp, open(output_path, "wb") as out_f:
            out_f.write(resp.read())
        print(f"  [+] Saved SFX: {output_path}")
        return True
    except Exception as e:
        print(f"Error generating SFX: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 generate_elevenlabs_audio.py list-voices")
        print("  python3 generate_elevenlabs_audio.py sfx <prompt> <output.mp3>")
        print("  python3 generate_elevenlabs_audio.py tts <voice_id> <text_or_file> <output.mp3>")
        sys.exit(1)

    cmd = sys.argv[1]
    api_key = get_api_key()

    if cmd == "list-voices":
        voices = list_voices(api_key)
        print(f"\nAvailable ElevenLabs Voices ({len(voices)}):")
        for v in voices:
            print(f"  - {v.get('name')} (ID: {v.get('voice_id')}) | Category: {v.get('category')}")
    elif cmd == "sfx":
        if len(sys.argv) < 4:
            print("Usage: python3 generate_elevenlabs_audio.py sfx '<prompt>' <output.mp3>")
            sys.exit(1)
        prompt = sys.argv[2]
        output_path = sys.argv[3]
        generate_sfx(prompt, output_path, api_key)
    elif cmd == "tts":
        if len(sys.argv) < 4:
            print("Usage: python3 generate_elevenlabs_audio.py tts <voice_id> '<text_or_file>' <output.mp3>")
            sys.exit(1)
        voice_id = sys.argv[2]
        text_arg = sys.argv[3]
        output_path = sys.argv[4] if len(sys.argv) > 4 else "output.mp3"

        if os.path.exists(text_arg):
            with open(text_arg, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            text = text_arg

        generate_tts(text, voice_id, output_path, api_key)

if __name__ == "__main__":
    main()

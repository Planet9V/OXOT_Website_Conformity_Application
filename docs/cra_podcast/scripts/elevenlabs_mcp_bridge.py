#!/usr/bin/env python3
"""
ElevenLabs MCP Bridge & Direct API Synthesizer
Interface to interact with ElevenLabs API using your ELEVENLABS_API_KEY.
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error

ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

def get_api_key(provided_key=None):
    api_key = provided_key or os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("ERROR: ELEVENLABS_API_KEY is not set.")
        print("Please provide it via --api_key or set environment variable ELEVENLABS_API_KEY.")
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
            voices = data.get("voices", [])
            print(f"\n==========================================================================")
            print(f"ELEVENLABS VOICE CATALOG ({len(voices)} voices available)")
            print(f"==========================================================================")
            for v in voices:
                print(f" • Name: {v.get('name'):<20} | ID: {v.get('voice_id')} | Category: {v.get('category')}")
            print(f"==========================================================================\n")
            return voices
    except Exception as e:
        print(f"Error listing ElevenLabs voices: {e}")
        sys.exit(1)

def generate_speech(api_key, text, voice_id, output_path, model_id="eleven_multilingual_v2", stability=0.60, similarity_boost=0.85):
    url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
    payload = json.dumps({
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
            "style": 0.10,
            "use_speaker_boost": True
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
        print(f"\n[ElevenLabs MCP Bridge] Synthesizing speech...")
        print(f"  • Voice ID: {voice_id}")
        print(f"  • Model: {model_id}")
        print(f"  • Text Length: {len(text)} characters")
        print(f"  • Output Path: {output_path}")

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with urllib.request.urlopen(req) as resp, open(output_path, "wb") as out_f:
            out_f.write(resp.read())

        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"SUCCESS: Generated speech saved to {output_path} ({size_mb:.2f} MB)\n")
        return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8') if e.fp else str(e)
        print(f"HTTP Error {e.code}: {err_msg}")
        sys.exit(1)
    except Exception as e:
        print(f"Error generating speech: {e}")
        sys.exit(1)

def generate_sound_effect(api_key, prompt, output_path, duration_seconds=10.0):
    url = f"{ELEVENLABS_BASE_URL}/sound-generation"
    payload = json.dumps({
        "text": prompt,
        "duration_seconds": float(duration_seconds),
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
        print(f"\n[ElevenLabs MCP Bridge] Synthesizing Sound Effect...")
        print(f"  • Prompt: '{prompt}'")
        print(f"  • Duration: {duration_seconds} seconds")
        print(f"  • Output Path: {output_path}")

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with urllib.request.urlopen(req) as resp, open(output_path, "wb") as out_f:
            out_f.write(resp.read())

        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"SUCCESS: Sound Effect saved to {output_path} ({size_mb:.2f} MB)\n")
        return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8') if e.fp else str(e)
        print(f"HTTP Error {e.code}: {err_msg}")
        sys.exit(1)
    except Exception as e:
        print(f"Error generating sound effect: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="ElevenLabs MCP Bridge & API Tool")
    subparsers = parser.add_subparsers(dest="action", required=True)

    # list_voices
    list_parser = subparsers.add_parser("list_voices", help="List all available ElevenLabs voices")
    list_parser.add_argument("--api_key", help="ElevenLabs API key")

    # generate_speech
    speech_parser = subparsers.add_parser("generate_speech", help="Synthesize text to speech")
    speech_parser.add_argument("--voice_id", required=True, help="ElevenLabs Voice ID")
    speech_parser.add_argument("--text", help="Text to speak")
    speech_parser.add_argument("--file", help="Path to markdown/text file containing script")
    speech_parser.add_argument("--output_path", required=True, help="Output audio file path (.mp3)")
    speech_parser.add_argument("--model_id", default="eleven_multilingual_v2", help="ElevenLabs model ID")
    speech_parser.add_argument("--api_key", help="ElevenLabs API key")

    # generate_sound_effect
    sfx_parser = subparsers.add_parser("generate_sound_effect", help="Synthesize sound effect from text prompt")
    sfx_parser.add_argument("--prompt", required=True, help="Text description of sound effect")
    sfx_parser.add_argument("--output_path", required=True, help="Output audio file path (.mp3)")
    sfx_parser.add_argument("--duration", type=float, default=10.0, help="Duration in seconds")
    sfx_parser.add_argument("--api_key", help="ElevenLabs API key")

    args = parser.parse_args()
    api_key = get_api_key(args.api_key)

    if args.action == "list_voices":
        list_voices(api_key)
    elif args.action == "generate_speech":
        if args.file and os.path.exists(args.file):
            with open(args.file, "r", encoding="utf-8") as f:
                text = f.read()
        elif args.text:
            text = args.text
        else:
            print("ERROR: Must provide either --text or --file")
            sys.exit(1)
        generate_speech(api_key, text, args.voice_id, args.output_path, args.model_id)
    elif args.action == "generate_sound_effect":
        generate_sound_effect(api_key, args.prompt, args.output_path, args.duration)

if __name__ == "__main__":
    main()

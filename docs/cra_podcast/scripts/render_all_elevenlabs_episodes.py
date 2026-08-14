#!/usr/bin/env python3
"""
Batch ElevenLabs Podcast Audio Renderer
Renders episodes directly from docs/cra_podcast/episodes_solo/ into high-quality ElevenLabs MP3s.
"""

import os
import sys
import argparse
from elevenlabs_mcp_bridge import get_api_key, generate_speech, generate_sound_effect

# Default ElevenLabs Voice IDs
POPULAR_VOICES = {
    "jim": "fh7rGvh0nJR3MFMkM9yd",           # Jim Mckenney Custom Voice (Default)
    "jimmcknney": "fh7rGvh0nJR3MFMkM9yd",    # Jim Mckenney Custom Voice
    "jim_mckenney": "fh7rGvh0nJR3MFMkM9yd",  # Jim Mckenney Custom Voice
    "adam": "pNInz6obpgDQGcFmaJgB",           # Deep male fallback
    "brian": "nPczCjzI2devNBz1zQrb",          # Professional British narrator
    "daniel": "onwK4e9ZLuTAKqWW03F9",         # News broadcast male
}

def render_episode(episode_id, voice_id, api_key):
    solo_dir = "docs/cra_podcast/episodes_solo"
    files = [f for f in os.listdir(solo_dir) if f.startswith(episode_id) and f.endswith("_SOLO.md")]
    
    if not files:
        print(f"Error: Episode file starting with '{episode_id}' not found in {solo_dir}")
        sys.exit(1)
        
    script_file = os.path.join(solo_dir, files[0])
    output_audio = os.path.join(solo_dir, files[0].replace(".md", "_ELEVENLABS.mp3"))
    
    print(f"\n==========================================================================")
    print(f"Rendering Episode: {files[0]}")
    print(f"Voice ID: {voice_id}")
    print(f"==========================================================================")
    
    generate_speech(
        api_key=api_key,
        text="",
        voice_id=voice_id,
        output_path=output_audio,
        model_id="eleven_multilingual_v2"
    )

def main():
    parser = argparse.ArgumentParser(description="Batch ElevenLabs Podcast Audio Renderer")
    parser.add_argument("--voice_id", default="fh7rGvh0nJR3MFMkM9yd", help="ElevenLabs Voice ID (default: Jim Mckenney English - fh7rGvh0nJR3MFMkM9yd)")
    parser.add_argument("--episode", default="EP_1.01", help="Episode ID prefix (e.g. EP_1.01 or 'all')")
    parser.add_argument("--api_key", help="ElevenLabs API key")
    
    args = parser.parse_args()
    api_key = get_api_key(args.api_key)
    
    voice_id = POPULAR_VOICES.get(args.voice_id.lower(), args.voice_id)
    
    if args.episode == "all":
        solo_dir = "docs/cra_podcast/episodes_solo"
        files = sorted([f for f in os.listdir(solo_dir) if f.endswith("_SOLO.md") and not f.startswith("EP_0.00")])
        print(f"Batch rendering {len(files)} episodes via ElevenLabs...")
        for script_file in files:
            script_path = os.path.join(solo_dir, script_file)
            output_audio = os.path.join(solo_dir, script_file.replace(".md", "_ELEVENLABS.mp3"))
            with open(script_path, "r", encoding="utf-8") as f:
                text = f.read()
            generate_speech(api_key, text, voice_id, output_audio)
    else:
        solo_dir = "docs/cra_podcast/episodes_solo"
        files = [f for f in os.listdir(solo_dir) if f.startswith(args.episode) and f.endswith("_SOLO.md")]
        if not files:
            print(f"Error: Episode '{args.episode}' not found.")
            sys.exit(1)
        script_path = os.path.join(solo_dir, files[0])
        output_audio = os.path.join(solo_dir, files[0].replace(".md", "_ELEVENLABS.mp3"))
        with open(script_path, "r", encoding="utf-8") as f:
            text = f.read()
        generate_speech(api_key, text, voice_id, output_audio)

if __name__ == "__main__":
    main()

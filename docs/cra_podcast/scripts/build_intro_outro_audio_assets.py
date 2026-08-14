#!/usr/bin/env python3
"""
Master Intro & Outro Audio Assets Builder (ElevenLabs)
Generates:
1. Intro Voice Track (Jim Mckenney Custom Voice: fh7rGvh0nJR3MFMkM9yd)
2. Intro Music Stinger (ElevenLabs Sound Generation)
3. Outro Voice Track (Jim Mckenney Custom Voice: fh7rGvh0nJR3MFMkM9yd)
4. Outro Music Stinger (ElevenLabs Sound Generation)
"""

import os
import sys
from elevenlabs_mcp_bridge import get_api_key, generate_speech, generate_sound_effect

JIM_VOICE_ID = "fh7rGvh0nJR3MFMkM9yd"

INTRO_TEXT = (
    "Welcome back to The CRA Briefing. I'm Jim Mckenney, digital product security consultant. "
    "I work directly with industrial manufacturers, OEMs, and operators to align OT devices and software "
    "with the Cyber Resilience Act, IEC 62443, the EU AI Act, and the Machinery Regulation. "
    "Standard disclaimer: this podcast provides technical and strategic commentary, not formal legal advice."
)

OUTRO_TEXT = (
    "Until next time: build secure by design, ship with confidence. "
    "I'm Jim Mckenney—thanks for listening."
)

INTRO_SFX_PROMPT = (
    "A warm, sophisticated Spanish classical guitar acoustic intro theme. "
    "Soft nylon-string fingerpicked guitar arpeggios, gentle warmth, subtle ambient reverb, "
    "elegant B2B broadcast opening, high production value, clean acoustic recording."
)

OUTRO_SFX_PROMPT = (
    "A gentle resolving Spanish classical guitar outro theme. "
    "Soft nylon-string acoustic guitar chords, warm resolving cadences, "
    "fading out smoothly over 10 seconds, elegant and relaxing resolution."
)

def main():
    api_key = get_api_key()
    assets_dir = "docs/cra_podcast/episodes_solo/assets"
    os.makedirs(assets_dir, exist_ok=True)

    print("==========================================================================")
    print("BUILDING MASTER INTRO & OUTRO AUDIO ASSETS (JIM MCKENNEY CUSTOM VOICE)")
    print("==========================================================================")

    # 1. Intro Voice Track
    intro_voice_path = os.path.join(assets_dir, "jim_mckenney_intro_voice.mp3")
    print(f"\n[1/4] Generating Intro Voice Track...")
    generate_speech(api_key, INTRO_TEXT, JIM_VOICE_ID, intro_voice_path)

    # 2. Intro Music Stinger
    intro_sfx_path = os.path.join(assets_dir, "intro_music_stinger.mp3")
    print(f"\n[2/4] Generating Intro Music Stinger...")
    generate_sound_effect(api_key, INTRO_SFX_PROMPT, intro_sfx_path, duration_seconds=10.0)

    # 3. Outro Voice Track
    outro_voice_path = os.path.join(assets_dir, "jim_mckenney_outro_voice.mp3")
    print(f"\n[3/4] Generating Outro Voice Track...")
    generate_speech(api_key, OUTRO_TEXT, JIM_VOICE_ID, outro_voice_path)

    # 4. Outro Music Stinger
    outro_sfx_path = os.path.join(assets_dir, "outro_music_stinger.mp3")
    print(f"\n[4/4] Generating Outro Music Stinger...")
    generate_sound_effect(api_key, OUTRO_SFX_PROMPT, outro_sfx_path, duration_seconds=10.0)

    print("\n==========================================================================")
    print("ALL MASTER INTRO & OUTRO ASSETS GENERATED SUCCESSFULLY!")
    print(f"Directory: {assets_dir}")
    print(f"  • {intro_voice_path}")
    print(f"  • {intro_sfx_path}")
    print(f"  • {outro_voice_path}")
    print(f"  • {outro_sfx_path}")
    print("==========================================================================")

    # Automatically mix music bed with voice tracks using ffmpeg
    try:
        import mix_intro_outro_music
        mix_intro_outro_music.main()
    except Exception as e:
        print(f"Note: Run 'python3 docs/cra_podcast/scripts/mix_intro_outro_music.py' to mix music beds with ffmpeg.")

if __name__ == "__main__":
    main()

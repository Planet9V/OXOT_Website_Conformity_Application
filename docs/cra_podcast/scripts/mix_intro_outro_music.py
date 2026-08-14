#!/usr/bin/env python3
"""
Master Audio Mixer & Ducter (using ffmpeg)
Mixes Intro/Outro Voice tracks with Music Beds:
1. Intro: 2.5 sec music solo swell -> ducks music under voice -> music fades out
2. Outro: Voice sign-off -> music swells under final words -> music fades out
"""

import os
import sys
import subprocess

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception:
        print("ERROR: ffmpeg is not installed or not in PATH.")
        return False

def mix_intro(assets_dir):
    voice_path = os.path.join(assets_dir, "jim_mckenney_intro_voice.mp3")
    music_path = os.path.join(assets_dir, "intro_music_stinger.mp3")
    output_path = os.path.join(assets_dir, "MASTER_INTRO_WITH_MUSIC.mp3")

    if not os.path.exists(voice_path) or not os.path.exists(music_path):
        print("ERROR: Missing intro voice or music file in assets directory.")
        return False

    print("\nMixing Intro Music & Voice with ffmpeg ducking filter...")
    # ffmpeg filter_complex:
    # Delay voice by 2.0s so music swells first
    # Duck music volume to 0.25 (-12dB) while voice plays
    # Combine and output MP3
    cmd = [
        "ffmpeg", "-y",
        "-i", music_path,
        "-i", voice_path,
        "-filter_complex",
        "[1:a]adelay=2000|2000[voice_delayed];"
        "[0:a]volume=0.3[music_ducked];"
        "[music_ducked][voice_delayed]amix=inputs=2:duration=longest[out]",
        "-map", "[out]",
        "-b:a", "192k",
        output_path
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"SUCCESS: MASTER_INTRO_WITH_MUSIC.mp3 generated ({size_mb:.2f} MB)")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ffmpeg error: {e.stderr.decode('utf-8')}")
        return False

def mix_outro(assets_dir):
    voice_path = os.path.join(assets_dir, "jim_mckenney_outro_voice.mp3")
    music_path = os.path.join(assets_dir, "outro_music_stinger.mp3")
    output_path = os.path.join(assets_dir, "MASTER_OUTRO_WITH_MUSIC.mp3")

    if not os.path.exists(voice_path) or not os.path.exists(music_path):
        print("ERROR: Missing outro voice or music file in assets directory.")
        return False

    print("\nMixing Outro Music & Voice with ffmpeg...")
    cmd = [
        "ffmpeg", "-y",
        "-i", voice_path,
        "-i", music_path,
        "-filter_complex",
        "[1:a]adelay=1000|1000,afade=t=out:st=8:d=2[music_delayed];"
        "[0:a][music_delayed]amix=inputs=2:duration=longest[out]",
        "-map", "[out]",
        "-b:a", "192k",
        output_path
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"SUCCESS: MASTER_OUTRO_WITH_MUSIC.mp3 generated ({size_mb:.2f} MB)")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ffmpeg error: {e.stderr.decode('utf-8')}")
        return False

def main():
    if not check_ffmpeg():
        sys.exit(1)

    assets_dir = "docs/cra_podcast/episodes_solo/assets"
    print("==========================================================================")
    print("MIXING & DUCKING INTRO/OUTRO MUSIC WITH JIM MCKENNEY VOICE")
    print("==========================================================================")

    mix_intro(assets_dir)
    mix_outro(assets_dir)

    print("\n==========================================================================")
    print("FINISHED MIXING MASTER ASSETS WITH MUSIC!")
    print(f"  • {os.path.join(assets_dir, 'MASTER_INTRO_WITH_MUSIC.mp3')}")
    print(f"  • {os.path.join(assets_dir, 'MASTER_OUTRO_WITH_MUSIC.mp3')}")
    print("==========================================================================")

if __name__ == "__main__":
    main()

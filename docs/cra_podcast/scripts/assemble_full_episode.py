#!/usr/bin/env python3
"""
Full Podcast Episode Assembler (ElevenLabs + ffmpeg)
Combines:
1. MASTER_INTRO_WITH_MUSIC.mp3 (Spanish Classical Guitar + Intro Voice)
2. Episode Main Body Spoken Audio (Jim Mckenney Custom Voice: fh7rGvh0nJR3MFMkM9yd)
3. MASTER_OUTRO_WITH_MUSIC.mp3 (Spanish Classical Guitar + Outro Voice)
"""

import os
import sys
import subprocess
import re
from elevenlabs_mcp_bridge import get_api_key, generate_speech

JIM_VOICE_ID = "fh7rGvh0nJR3MFMkM9yd"

def extract_main_body(script_file):
    with open(script_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Isolate SECTION 2 (Transcript) only
    if "## SECTION 2:" in content:
        content = content.split("## SECTION 2:")[1]
    if "## SECTION 3:" in content:
        content = content.split("## SECTION 3:")[0]

    # Remove code block fences
    content = re.sub(r"```[a-z]*", "", content)
    content = re.sub(r"```", "", content)

    # Remove speaker tags like [JIM MCKENNEY] or [HOST 1]
    content = re.sub(r"\[[A-Z0-9\s_\-]+\]", "", content)

    # Convert phonetic pronunciation tags e.g. [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven] -> EU twenty twenty-four slash twenty-eight forty-seven
    content = re.sub(r"\[pronunciation:\s*([^\]]+)\]", r"\1", content)

    # Clean markdown formatting: bold/italics asterisks, blockquotes, headers
    content = re.sub(r"\*+", "", content)
    content = re.sub(r"^#+.*$", "", content, flags=re.MULTILINE)
    content = re.sub(r"^>\s*.*$", "", content, flags=re.MULTILINE)
    content = re.sub(r"---", "", content)

    # Split into clean paragraphs
    paragraphs = []
    for line in content.split("\n\n"):
        clean_para = line.strip()
        if not clean_para:
            continue
        # Skip intro/outro duplicates or meta instructions
        if "Welcome back to The CRA Briefing" in clean_para or "Standard disclaimer" in clean_para:
            continue
        if "Until next time" in clean_para or "thanks for listening" in clean_para:
            continue
        if "audio generator script" in clean_para or "Speaker Assignment" in clean_para:
            continue
        if "SINGLE-VOICE SOLO TRANSCRIPT" in clean_para or "Audio Voice Target" in clean_para or "Briefing Architecture" in clean_para:
            continue
        paragraphs.append(clean_para)

    return paragraphs

def create_silence_file(silence_path, duration=0.5):
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"anullsrc=r=44100:cl=mono",
        "-t", str(duration),
        "-b:a", "192k",
        silence_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

def main():
    api_key = get_api_key()
    assets_dir = "docs/cra_podcast/episodes_solo/assets"
    chunks_dir = os.path.join(assets_dir, "chunks_1.01")
    os.makedirs(chunks_dir, exist_ok=True)

    silence_file = os.path.join(assets_dir, "silence_0.5s.mp3")
    create_silence_file(silence_file, duration=0.5)

    ep_file = "docs/cra_podcast/episodes_solo/EP_1.01_Is_Your_Product_In_Scope_SOLO.md"
    body_audio = os.path.join(assets_dir, "EP_1.01_body_voice.mp3")
    final_output = "docs/cra_podcast/episodes_solo/EP_1.01_Is_Your_Product_In_Scope_FINAL_FULL_PODCAST.mp3"

    master_intro = os.path.join(assets_dir, "MASTER_INTRO_WITH_MUSIC.mp3")
    master_outro = os.path.join(assets_dir, "MASTER_OUTRO_WITH_MUSIC.mp3")

    if not os.path.exists(master_intro) or not os.path.exists(master_outro):
        print("ERROR: Master intro or outro file missing. Please run build_intro_outro_audio_assets.py and mix_intro_outro_music.py first.")
        sys.exit(1)

    print("==========================================================================")
    print("PRODUCING CLEAN FULL EPISODE 1.01 (SANITISED NARRATIVE + 0.5s PAUSES)")
    print("==========================================================================")

    # Step 1: Extract & Sanitize Narrative Paragraphs
    paragraphs = extract_main_body(ep_file)
    print(f"Extracted {len(paragraphs)} clean narrative paragraphs from transcript.")

    # Step 2: Render Each Paragraph Chunk via ElevenLabs
    chunk_files = []
    for idx, para in enumerate(paragraphs, start=1):
        chunk_path = os.path.join(chunks_dir, f"clean_para_{idx:02d}.mp3")
        print(f"\n[Chunk {idx:02d}/{len(paragraphs):02d}] ({len(para)} chars): '{para[:60]}...'")
        generate_speech(api_key, para, JIM_VOICE_ID, chunk_path)
        chunk_files.append(chunk_path)

    # Step 3: Concat Main Body Paragraph Chunks with 0.5s Silence Pauses
    print("\nStitching narrative paragraphs with 0.5s breathing pauses into main body audio...")
    body_concat_list = os.path.join(assets_dir, "body_concat_list.txt")
    with open(body_concat_list, "w", encoding="utf-8") as f:
        for idx, cf in enumerate(chunk_files):
            f.write(f"file '{os.path.abspath(cf)}'\n")
            if idx < len(chunk_files) - 1:
                f.write(f"file '{os.path.abspath(silence_file)}'\n")

    cmd_body = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", body_concat_list,
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        body_audio
    ]
    subprocess.run(cmd_body, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    print(f"SUCCESS: EP_1.01_body_voice.mp3 created cleanly.")

    # Step 4: Concat Intro + Main Body + Outro with MP3 Re-encoding
    print("\nStitching Master Intro + Main Body + Master Outro into Final Podcast MP3...")
    concat_list_file = os.path.join(assets_dir, "concat_list.txt")
    with open(concat_list_file, "w", encoding="utf-8") as f:
        f.write(f"file '{os.path.abspath(master_intro)}'\n")
        f.write(f"file '{os.path.abspath(body_audio)}'\n")
        f.write(f"file '{os.path.abspath(master_outro)}'\n")

    cmd_final = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_file,
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]

    try:
        subprocess.run(cmd_final, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        size_mb = os.path.getsize(final_output) / (1024 * 1024)
        print("\n==========================================================================")
        print("🎉 SUCCESS! FLAWLESS FULL PODCAST EPISODE 1.01 GENERATED SUCCESSFULLY!")
        print(f"File: {final_output} ({size_mb:.2f} MB)")
        print("==========================================================================")
    except subprocess.CalledProcessError as e:
        print(f"ffmpeg error during final concat: {e.stderr.decode('utf-8')}")
        sys.exit(1)

if __name__ == "__main__":
    main()

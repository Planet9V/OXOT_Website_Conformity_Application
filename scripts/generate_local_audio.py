#!/usr/bin/env python3
"""
generate_local_audio.py
100% Local Text-to-Speech CLI using local Voicebox Engine and Custom Voice Profiles on macOS.

Features:
- Completely offline (zero cloud APIs / zero OpenRouter calls)
- Uses local Voicebox neural server with Apple Silicon GPU acceleration
- Natural sentence & paragraph breathing pauses (no rushed or running-together sentences)
- Voice cloning via your custom voice profile ('Jimmy english' or 'Bella')
- Built-in multi-language support (English 'en', Dutch 'nl', German 'de', etc.)
- Studio broadcast mastering: noise gate, -19 LUFS long-form loudness, and 0.98x tempo tuning
- Immediate audio playback on Mac with --play

Usage:
  # Quick text with natural sentence pauses:
  python3 scripts/generate_local_audio.py --text "Welcome to the podcast. Today we examine Article 21. It changes everything for industrial operators." --play

  # Dutch speech:
  python3 scripts/generate_local_audio.py --language nl --text "Welkom bij de podcast. Vandaag bespreken we Artikel 21." --play

  # Full blog post or podcast script from markdown:
  python3 scripts/generate_local_audio.py --file docs/cra_podcast/blogs/BLOG_EP_1.01_ep-1.01-the-2-year-lag-why-2024-contracts-are-walking-into.md --output ./audio/ep1_01_local.wav --play
"""

import os
import re
import sys
import json
import time
import wave
import tempfile
import argparse
import subprocess
import urllib.request
import urllib.error

VOICEBOX_BASE_URL = os.environ.get("VOICEBOX_URL", "http://127.0.0.1:17493")

def check_server():
    """Verify local Voicebox server is running."""
    try:
        req = urllib.request.urlopen(f"{VOICEBOX_BASE_URL}/health", timeout=2)
        return req.status == 200
    except Exception:
        return False

def get_profiles():
    """Fetch available voice profiles from local Voicebox."""
    try:
        req = urllib.request.urlopen(f"{VOICEBOX_BASE_URL}/profiles", timeout=3)
        return json.loads(req.read().decode("utf-8"))
    except Exception as e:
        print(f"❌ Error fetching Voicebox profiles: {e}")
        return []

def clean_sentence_for_speech(raw_text: str) -> str:
    """Clean markdown and optimize text for natural spoken delivery and pacing."""
    text = raw_text.strip()
    
    # Remove formatting characters
    cleaned = text.replace("**", "").replace("*", "").replace("`", "").replace("[", "").replace("]", "")
    
    # Expand common regulatory shorthand for clean spoken pronunciation
    replacements = {
        "Art. ": "Article ",
        "Arts. ": "Articles ",
        "Rec. ": "Recital ",
        "e.g.,": "for example,",
        "e.g.": "for example,",
        "i.e.,": "that is,",
        "i.e.": "that is,",
        "SBOM": "S-BOM",
        "PSIRT": "P-SIRT",
        "OT": "O-T",
        "IT": "I-T",
        "PLC": "P-L-C",
        "SCADA": "SCADA",
        "CRA": "Cyber Resilience Act",
        "ENISA": "ENISA",
        "NIS2": "NIS 2",
        ";": ",",
        " — ": ", ",
        " - ": ", ",
    }
    for k, v in replacements.items():
        cleaned = cleaned.replace(k, v)
        
    return cleaned.strip()

def split_into_paragraphs_and_sentences(raw_text: str):
    """Split text into structural paragraphs and discrete sentence units for natural breathing pauses."""
    text = raw_text.strip()
    
    # Strip YAML frontmatter if present
    if text.startswith("---"):
        parts = text.split("---")
        if len(parts) >= 3:
            text = parts[2].strip()
            
    # Group raw text into clean paragraphs
    raw_paragraphs = []
    current_para = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            if current_para:
                raw_paragraphs.append(" ".join(current_para))
                current_para = []
            continue
        if line.startswith("#"):
            if current_para:
                raw_paragraphs.append(" ".join(current_para))
                current_para = []
            cleaned_header = line.lstrip("#").strip()
            raw_paragraphs.append(f"{cleaned_header}.")
        elif line.startswith(">") or line.startswith("```"):
            continue
        elif line.startswith("- ") or line.startswith("* "):
            current_para.append(f"{line[2:].strip()},")
        else:
            current_para.append(line)
            
    if current_para:
        raw_paragraphs.append(" ".join(current_para))
        
    structured = []
    for para in raw_paragraphs:
        cleaned_para = clean_sentence_for_speech(para)
        if not cleaned_para:
            continue
        # Split paragraph into sentences by punctuation boundaries
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned_para) if s.strip()]
        if sentences:
            structured.append(sentences)
            
    return structured

def generate_single_chunk(profile_id: str, text: str, language: str = "en", instruct: str = None, engine: str = "chatterbox_turbo") -> str:
    """Send text generation request to local Voicebox and return generation ID."""
    if language == "nl":
        default_instruct = "Spreek met een rustige, warme en deskundige podcasttoon met natuurlijke overgangen."
    else:
        default_instruct = "Speak with a relaxed, warm, conversational cadence, authoritative podcast presence, and natural pauses."
        
    payload = {
        "profile_id": profile_id,
        "text": text,
        "language": language,
        "engine": engine,
        "normalize": True,
        "max_chunk_chars": 600,
        "crossfade_ms": 100,
        "instruct": instruct if instruct else default_instruct
    }
        
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{VOICEBOX_BASE_URL}/generate",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req) as resp:
        res_data = json.loads(resp.read().decode("utf-8"))
        return res_data["id"]

def wait_for_completion(generation_id: str, timeout_sec: int = 120):
    """Wait for Voicebox generation to complete."""
    start_time = time.time()
    while time.time() - start_time < timeout_sec:
        try:
            req = urllib.request.urlopen(f"{VOICEBOX_BASE_URL}/generate/{generation_id}/status", timeout=5)
            for line in req.read().decode("utf-8").split("\n"):
                if line.startswith("data:"):
                    raw = line.replace("data:", "").strip()
                    if raw:
                        parsed = json.loads(raw)
                        if parsed.get("status") == "completed":
                            return True
                        elif parsed.get("status") == "failed":
                            raise RuntimeError(f"Voice generation failed: {parsed.get('error')}")
        except Exception:
            pass
        time.sleep(1)
    raise TimeoutError("Voice generation timed out.")

def stitch_wav_segments(segment_files, output_path: str, sentence_pause_sec: float = 0.60, paragraph_pause_sec: float = 1.0):
    """Stitch multiple WAV audio chunks in pure Python with precise silence pauses."""
    if not segment_files:
        raise ValueError("No audio segments to stitch.")
        
    all_frames = []
    params = None
    
    for item in segment_files:
        if item["type"] == "audio":
            with wave.open(item["file"], "rb") as wf:
                if params is None:
                    params = wf.getparams()
                frames = wf.readframes(wf.getnframes())
                all_frames.append(frames)
        elif item["type"] == "pause":
            pause_duration = item["duration"]
            framerate = params.framerate if params else 24000
            nchannels = params.nchannels if params else 1
            sampwidth = params.sampwidth if params else 2
            silence_bytes = b'\x00' * int(framerate * sampwidth * nchannels * pause_duration)
            all_frames.append(silence_bytes)
            
    with wave.open(output_path, "wb") as wf_out:
        wf_out.setparams(params)
        for f in all_frames:
            wf_out.writeframes(f)

def apply_mastering(input_wav: str, output_path: str, speed: float = 0.98, gain_db: float = -2.0, clean_background: bool = True):
    """Apply studio mastering: gentle noise-gate, tempo adjustment, and -19 LUFS podcast loudness."""
    has_ffmpeg = subprocess.run(["which", "ffmpeg"], capture_output=True).returncode == 0
    if has_ffmpeg:
        filters = []
        if clean_background:
            filters.append("afftdn=nf=-40:tn=1")
            filters.append("agate=threshold=-38dB:ratio=2.2:attack=12:release=150:range=-24dB")
        if speed and abs(speed - 1.0) > 0.001:
            filters.append(f"atempo={speed:.3f}")
        if gain_db and abs(gain_db) > 0.01:
            filters.append(f"volume={gain_db:.1f}dB")
        filters.append("loudnorm=I=-19:TP=-2.0:LRA=12")
        
        filter_str = ",".join(filters)
        cmd = ["ffmpeg", "-y", "-i", input_wav, "-af", filter_str, "-ar", "24000", output_path]
        proc = subprocess.run(cmd, capture_output=True)
        if proc.returncode == 0:
            return
            
    # Fallback to direct raw copy if ffmpeg is unavailable
    import shutil
    shutil.copyfile(input_wav, output_path)

def main():
    parser = argparse.ArgumentParser(description="100% Local Text-to-Speech using Voicebox & Custom Voice Profiles")
    parser.add_argument("--text", type=str, help="Text to speak")
    parser.add_argument("--file", type=str, help="Path to markdown or text file to voice")
    parser.add_argument("--engine", type=str, default="chatterbox_turbo", choices=["chatterbox_turbo", "tada", "qwen", "luxtts", "kokoro"], help="TTS Engine (default: 'chatterbox_turbo' Resemble AI)")
    parser.add_argument("--profile", type=str, default="Jimmy english", help="Voice profile name (default: 'Jimmy english')")
    parser.add_argument("--language", type=str, default="en", choices=["en", "nl", "de", "fr", "es", "it"], help="Language code (default: 'en', use 'nl' for Dutch)")
    parser.add_argument("--output", type=str, default="./output_speech.wav", help="Output file path (default: ./output_speech.wav)")
    parser.add_argument("--sentence-pause", type=float, default=0.60, help="Pause duration between sentences in seconds (default: 0.60s)")
    parser.add_argument("--paragraph-pause", type=float, default=1.00, help="Pause duration between paragraphs in seconds (default: 1.00s)")
    parser.add_argument("--instruct", type=str, help="Tone and pacing instruction")
    parser.add_argument("--speed", type=float, default=0.98, help="Playback speed/tempo (default: 0.98 for 2%% slower, relaxed cadence)")
    parser.add_argument("--gain", type=float, default=-2.0, help="Volume gain in dB (default: -2.0 for comfortable long-form listening)")
    parser.add_argument("--play", action="store_true", help="Immediately play the audio on your Mac after generation")
    
    args = parser.parse_args()
    
    if not args.text and not args.file:
        print("❌ Please provide either --text or --file.")
        sys.exit(1)
        
    print("=" * 70)
    print(" 🎙️  LOCAL VOICEBOX STUDIO — 100% OFFLINE SPEECH GENERATION")
    print("=" * 70)
    
    # 1. Verify Local Server
    if not check_server():
        print(f"❌ Local Voicebox server not reachable at {VOICEBOX_BASE_URL}.")
        print("   Please ensure Voicebox.app is running on your Mac.")
        sys.exit(1)
    print(f"✅ Voicebox Engine: {args.engine.upper()} (Local Apple Silicon Acceleration)")
    
    # 2. Resolve Profile
    profiles = get_profiles()
    target_profile = None
    for p in profiles:
        if p["name"].lower() == args.profile.lower() or p["id"] == args.profile:
            target_profile = p
            break
            
    if not target_profile:
        print(f"⚠️ Profile '{args.profile}' not found. Available profiles:")
        for p in profiles:
            print(f"   • {p['name']} (ID: {p['id']})")
        target_profile = profiles[0]
        print(f"👉 Defaulting to: {target_profile['name']}")
    else:
        print(f"✅ Voice Profile: {target_profile['name']} (Language: {args.language.upper()}, Type: {target_profile.get('voice_type', 'cloned')})")
        
    # 3. Read & Structure Text into Paragraphs and Sentences
    if args.file:
        if not os.path.exists(args.file):
            print(f"❌ File not found: {args.file}")
            sys.exit(1)
        with open(args.file, "r", encoding="utf-8") as f:
            raw_content = f.read()
        print(f"📄 Read {len(raw_content)} characters from {args.file}")
    else:
        raw_content = args.text
        
    structured_content = split_into_paragraphs_and_sentences(raw_content)
    total_sentences = sum(len(para) for para in structured_content)
    print(f"🎙️ Structured text: {len(structured_content)} paragraphs, {total_sentences} sentences")
    print(f"⏱️ Pause pacing: {args.sentence_pause:.2f}s between sentences, {args.paragraph_pause:.2f}s between paragraphs")
    
    # 4. Generate Sentence Audio Chunks
    temp_dir = tempfile.mkdtemp(prefix="voicebox_studio_")
    segments = []
    chunk_counter = 0
    
    try:
        for p_idx, para in enumerate(structured_content):
            for s_idx, sentence in enumerate(para):
                chunk_counter += 1
                print(f"⏳ [{chunk_counter}/{total_sentences}] Synthesizing sentence: \"{sentence[:45]}...\"")
                gen_id = generate_single_chunk(
                    profile_id=target_profile["id"],
                    text=sentence,
                    language=args.language,
                    instruct=args.instruct,
                    engine=args.engine
                )
                wait_for_completion(gen_id)
                
                chunk_file = os.path.join(temp_dir, f"chunk_{chunk_counter:04d}.wav")
                urllib.request.urlretrieve(f"{VOICEBOX_BASE_URL}/audio/{gen_id}", chunk_file)
                segments.append({"type": "audio", "file": chunk_file})
                
                # Add sentence pause if not the last sentence in the paragraph
                if s_idx < len(para) - 1:
                    segments.append({"type": "pause", "duration": args.sentence_pause})
                    
            # Add paragraph pause between paragraphs
            if p_idx < len(structured_content) - 1:
                segments.append({"type": "pause", "duration": args.paragraph_pause})
                
        # 5. Stitch WAV Segments with Exact Silence Gaps
        raw_stitched_wav = os.path.join(temp_dir, "stitched_raw.wav")
        stitch_wav_segments(segments, raw_stitched_wav, args.sentence_pause, args.paragraph_pause)
        
        # 6. Apply Final Studio Mastering
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        print(f"🎛️ Studio Mastering: Applying background gate + -19 LUFS loudness + {args.speed*100:.0f}% tempo...")
        apply_mastering(raw_stitched_wav, args.output, speed=args.speed, gain_db=args.gain, clean_background=True)
        
        print(f"🎉 Audio successfully rendered: {args.output}")
        print(f"   File size: {os.path.getsize(args.output) / 1024:.1f} KB")
        
    finally:
        # Cleanup temp directory
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)
        
    # 7. Optional Playback
    if args.play:
        print("🔊 Playing audio...")
        subprocess.run(["afplay", args.output])

if __name__ == "__main__":
    main()

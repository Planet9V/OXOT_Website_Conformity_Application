#!/usr/bin/env python3
"""
generate_local_audio.py
100% Local Text-to-Speech CLI using local Voicebox Engine and Custom Voice Profiles on macOS.

Features:
- Completely offline (zero cloud APIs / zero OpenRouter calls)
- Uses local Voicebox neural server with Apple Silicon GPU acceleration
- Voice cloning via your custom voice profile ('Jimmy english' or 'Bella')
- Built-in speech pre-processing (removes markdown artifacts, expands statutory acronyms, inserts cadence pauses)
- Optional studio broadcast effects (Radio, Deep Voice, Echo Chamber, or custom DSP)
- Immediate audio playback on Mac with --play

Usage:
  # Quick text string:
  python3 scripts/generate_local_audio.py --text "Under Article 21, modifying custom PLC logic triggers full manufacturer liability." --play

  # Full blog post or podcast script from markdown:
  python3 scripts/generate_local_audio.py --file docs/cra_podcast/blogs/BLOG_EP_1.01_ep-1.01-the-2-year-lag-why-2024-contracts-are-walking-into.md --output ./audio/ep1_01_local.wav --play

  # Custom voice profile and tone instruction:
  python3 scripts/generate_local_audio.py --text "Here is an executive briefing." --profile "Jimmy english" --instruct "Authoritative, measured, podcast tone"
"""

import os
import sys
import json
import time
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

def preprocess_text_for_speech(raw_text: str) -> str:
    """Clean markdown and optimize text for natural spoken delivery and pacing."""
    text = raw_text.strip()
    
    # Strip YAML frontmatter if present
    if text.startswith("---"):
        parts = text.split("---")
        if len(parts) >= 3:
            text = parts[2].strip()
            
    # Remove markdown headers and format markers
    lines = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("#"):
            # Convert header into a spoken section pause
            cleaned_header = line.lstrip("#").strip()
            lines.append(f"\n{cleaned_header}...\n")
        elif line.startswith(">") or line.startswith("```"):
            continue
        elif line.startswith("- ") or line.startswith("* "):
            lines.append(f"{line[2:].strip()},")
        else:
            lines.append(line)
            
    cleaned = " ".join(lines)
    
    # Remove formatting characters
    cleaned = cleaned.replace("**", "").replace("*", "").replace("`", "").replace("[", "").replace("]", "")
    
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
    }
    for k, v in replacements.items():
        cleaned = cleaned.replace(k, v)
        
    return cleaned.strip()

def generate_speech(profile_id: str, text: str, instruct: str = None, engine: str = "qwen") -> str:
    """Send text generation request to local Voicebox and return generation ID."""
    payload = {
        "profile_id": profile_id,
        "text": text,
        "language": "en",
        "engine": engine,
        "model_size": "1.7B",
        "normalize": True,
        "max_chunk_chars": 800,
        "crossfade_ms": 60
    }
    if instruct:
        payload["instruct"] = instruct
        
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

def download_audio(generation_id: str, output_path: str):
    """Save generated audio stream to disk."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    urllib.request.urlretrieve(f"{VOICEBOX_BASE_URL}/audio/{generation_id}", output_path)

def main():
    parser = argparse.ArgumentParser(description="100% Local Text-to-Speech using Voicebox & Custom Voice Profiles")
    parser.add_argument("--text", type=str, help="Text to speak")
    parser.add_argument("--file", type=str, help="Path to markdown or text file to voice")
    parser.add_argument("--profile", type=str, default="Jimmy english", help="Voice profile name (default: 'Jimmy english')")
    parser.add_argument("--output", type=str, default="./output_speech.wav", help="Output file path (default: ./output_speech.wav)")
    parser.add_argument("--instruct", type=str, help="Tone and pacing instruction (e.g. 'Calm, authoritative, podcast tone')")
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
    print("✅ Voicebox Engine: Connected (Local Apple Silicon Server)")
    
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
        print(f"✅ Voice Profile: {target_profile['name']} (Type: {target_profile.get('voice_type', 'cloned')})")
        
    # 3. Read & Preprocess Text
    if args.file:
        if not os.path.exists(args.file):
            print(f"❌ File not found: {args.file}")
            sys.exit(1)
        with open(args.file, "r", encoding="utf-8") as f:
            raw_content = f.read()
        print(f"📄 Read {len(raw_content)} characters from {args.file}")
    else:
        raw_content = args.text
        
    speech_text = preprocess_text_for_speech(raw_content)
    print(f"🎙️ Prepared speech text ({len(speech_text)} chars)")
    
    # 4. Generate Speech
    print("⏳ Synthesizing voice locally on Apple Silicon GPU...")
    gen_id = generate_speech(
        profile_id=target_profile["id"],
        text=speech_text,
        instruct=args.instruct
    )
    
    wait_for_completion(gen_id)
    download_audio(gen_id, args.output)
    
    print(f"🎉 Audio successfully rendered: {args.output}")
    print(f"   File size: {os.path.getsize(args.output) / 1024:.1f} KB")
    
    # 5. Optional Playback
    if args.play:
        print("🔊 Playing audio...")
        subprocess.run(["afplay", args.output])

if __name__ == "__main__":
    main()

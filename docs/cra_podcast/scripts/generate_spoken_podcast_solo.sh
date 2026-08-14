#!/usr/bin/env bash
# macOS Native Single-Voice Spoken Podcast Audio Generator (Jim Mckenney Solo Series)
# Generates real spoken speech for Jim Mckenney Solo Episodes using macOS Neural/System Voices:
# Host / Presenter: 'Jim Mckenney' (Voice: 'Daniel' / British Male Voice)

set -e

EPISODE_DIR="docs/cra_podcast/episodes_solo"
TRANSCRIPT="${1:-$EPISODE_DIR/EP_1.01_Is_Your_Product_In_Scope_SOLO.md}"
TEMP_DIR="/tmp/cra_podcast_solo_turns"
OUTPUT_WAV="${2:-$EPISODE_DIR/EP_1.01_Is_Your_Product_In_Scope_SOLO_SPOKEN.wav}"

echo "=========================================================================="
echo "    OXOT CRA PODCAST — Jim Mckenney Solo Series Synthesizer"
echo "=========================================================================="
echo "Transcript: $TRANSCRIPT"
echo "Presenter: Jim Mckenney (Digital Product Security Consultant)"
echo "Voice: 'Daniel' (macOS Male Voice)"
echo "--------------------------------------------------------------------------"

mkdir -p "$TEMP_DIR" "$EPISODE_DIR"
rm -f "$TEMP_DIR"/*.wav "$TEMP_DIR"/*.txt

# Extract Jim Mckenney speech text
python3 -c '
import re

with open("'$TRANSCRIPT'", "r", encoding="utf-8") as f:
    content = f.read()

blocks = re.findall(r"\[JIM MCKENNEY\]\n(.*?)(?=\n\[|```|\Z)", content, re.DOTALL)
text = blocks[0] if blocks else content

# Clean formatting
clean_text = re.sub(r"\[pronunciation:\s*[^\]]+\]", "", text).strip()
clean_text = re.sub(r"\s+", " ", clean_text)
clean_text = clean_text.replace("*", "").replace("#", "")

# Split into manageable paragraphs for macOS say engine
paragraphs = [p.strip() for p in clean_text.split("\n\n") if p.strip()]
if not paragraphs:
    paragraphs = [p.strip() for p in clean_text.split(".") if p.strip()]

for idx, p in enumerate(paragraphs):
    with open(f"'$TEMP_DIR'/para_{idx:03d}.txt", "w", encoding="utf-8") as tf:
        tf.write(p)
    print(f"Paragraph {idx+1:02d}/{len(paragraphs)} prepared.")
'

# Render each paragraph with macOS say in uncompressed PCM WAV (LEI16@24000)
echo "--------------------------------------------------------------------------"
echo "Rendering spoken speech with macOS Text-to-Speech Engine (Voice: Daniel)..."
for txt in "$TEMP_DIR"/para_*.txt; do
    filename=$(basename "$txt" .txt)
    text_content=$(cat "$txt")
    wav_file="$TEMP_DIR/${filename}.wav"
    say -v "Daniel" --data-format=LEI16@24000 -o "$wav_file" "$text_content"
done

# Concatenate uncompressed WAV PCM frames seamlessly with Python wave
echo "--------------------------------------------------------------------------"
echo "Merging PCM WAV paragraph files into final Jim Mckenney solo podcast..."

python3 -c '
import wave
import glob

wav_files = sorted(glob.glob("'$TEMP_DIR'/para_*.wav"))
output_file = "'$OUTPUT_WAV'"

print(f"Merging {len(wav_files)} PCM WAV files...")

first = wave.open(wav_files[0], "rb")
n_channels = first.getnchannels()
samp_width = first.getsampwidth()
frame_rate = first.getframerate()
first.close()

with wave.open(output_file, "wb") as wav_out:
    wav_out.setnchannels(n_channels)
    wav_out.setsampwidth(samp_width)
    wav_out.setframerate(frame_rate)
    
    total_frames = 0
    for f_path in wav_files:
        with wave.open(f_path, "rb") as wav_in:
            n_frames = wav_in.getnframes()
            frames = wav_in.readframes(n_frames)
            wav_out.writeframes(frames)
            total_frames += n_frames
            
            # Add short 0.25s pause between paragraphs
            pause_frames = int(frame_rate * 0.25)
            wav_out.writeframes(b"\x00" * (pause_frames * n_channels * samp_width))
            total_frames += pause_frames

duration_sec = total_frames / frame_rate
print(f"Merged successfully! Duration: {duration_sec:.1f} sec ({duration_sec/60:.2f} min)")
'

echo "=========================================================================="
echo "SUCCESS! Jim Mckenney Solo Podcast Audio Generated:"
echo "File: $OUTPUT_WAV"
ls -lh "$OUTPUT_WAV"
echo "=========================================================================="

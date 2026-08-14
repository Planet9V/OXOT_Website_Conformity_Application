#!/usr/bin/env bash
# macOS Native Human-Voice Spoken Podcast Audio Generator
# Generates real spoken speech for Episode 1.01 using macOS Neural/System Voices:
# - Host 1 (ONYX / Legal Lead): 'Daniel' (British Male Voice)
# - Host 2 (NOVA / Engineering Lead): 'Samantha' (American Female Voice)

set -e

EPISODE_DIR="docs/cra_podcast/episodes"
TRANSCRIPT="$EPISODE_DIR/EP_1.01_Is_Your_Product_In_Scope.md"
TEMP_DIR="/tmp/cra_podcast_turns"
OUTPUT_WAV="$EPISODE_DIR/EP_1.01_Is_Your_Product_In_Scope_SPOKEN.wav"

echo "=========================================================================="
echo "    OXOT CRA PODCAST — macOS Spoken Voice Audio Synthesizer"
echo "=========================================================================="
echo "Transcript: $TRANSCRIPT"
echo "Host 1 (ONYX): Voice 'Daniel' (Legal Lead)"
echo "Host 2 (NOVA): Voice 'Samantha' (Engineering Lead)"
echo "--------------------------------------------------------------------------"

mkdir -p "$TEMP_DIR"
rm -f "$TEMP_DIR"/*.wav "$TEMP_DIR"/*.txt

# Extract dialogue turns
python3 -c '
import re

with open("'$TRANSCRIPT'", "r", encoding="utf-8") as f:
    content = f.read()

dialogue = re.findall(r"\[(HOST \d - [A-Z]+)\]\n(.*?)(?=\n\[HOST|\n```|\Z)", content, re.DOTALL)

for idx, (speaker, text) in enumerate(dialogue):
    clean_text = re.sub(r"\[pronunciation:\s*[^\]]+\]", "", text).strip()
    clean_text = re.sub(r"\s+", " ", clean_text)
    clean_text = clean_text.replace("*", "").replace("#", "")
    
    voice = "Daniel" if "ONYX" in speaker else "Samantha"
    with open(f"'$TEMP_DIR'/turn_{idx:03d}_{voice}.txt", "w", encoding="utf-8") as tf:
        tf.write(clean_text)
        
    print(f"Turn {idx+1:02d}/{len(dialogue)} [{speaker}] -> Voice: {voice}")
'

# Render each turn directly as uncompressed 24kHz 16-bit PCM WAV (LEI16@24000)
echo "--------------------------------------------------------------------------"
echo "Rendering spoken speech with macOS Text-to-Speech Engine..."
for txt in "$TEMP_DIR"/turn_*.txt; do
    filename=$(basename "$txt" .txt)
    text_content=$(cat "$txt")
    if [[ "$filename" == *"Daniel"* ]]; then
        voice="Daniel"
    else
        voice="Samantha"
    fi
    wav_file="$TEMP_DIR/${filename}.wav"
    say -v "$voice" --data-format=LEI16@24000 -o "$wav_file" "$text_content"
done

# Concatenate uncompressed WAV PCM frames seamlessly with Python wave
echo "--------------------------------------------------------------------------"
echo "Merging 26 PCM WAV turn files into final podcast audio..."

python3 -c '
import wave
import glob

wav_files = sorted(glob.glob("'$TEMP_DIR'/turn_*.wav"))
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
            
            # Add short 0.2s pause between turns
            pause_frames = int(frame_rate * 0.2)
            wav_out.writeframes(b"\x00" * (pause_frames * n_channels * samp_width))
            total_frames += pause_frames

duration_sec = total_frames / frame_rate
print(f"Merged successfully! Duration: {duration_sec:.1f} sec ({duration_sec/60:.2f} min)")
'

echo "=========================================================================="
echo "SUCCESS! Spoken Podcast Audio Generated:"
echo "File: $OUTPUT_WAV"
ls -lh "$OUTPUT_WAV"
echo "=========================================================================="

import whisper
import json
import os

print("Loading Whisper model...")
model = whisper.load_model("tiny.en")

files = [
  ("guided_doodle.m4a", "doodle_transcript.json"),
  ("guided_meditation.m4a", "meditation_transcript.json")
]

base_dir = os.path.join(os.getcwd(), "public/audio")

for audio_file, out_file in files:
  path = os.path.join(base_dir, audio_file)
  if os.path.exists(path):
    print(f"Transcribing {audio_file}...")
    result = model.transcribe(path, verbose=True)
    out_path = os.path.join(base_dir, out_file)
    with open(out_path, "w") as f:
      json.dump(result["segments"], f, indent=2)
    print(f"Saved transcript to {out_file}")

print("Transcription complete!")

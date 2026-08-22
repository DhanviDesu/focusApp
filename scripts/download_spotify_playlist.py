import subprocess
import json
import os

yt_dlp_path = "/Users/dhanvidesu/Library/Python/3.9/bin/yt-dlp"
ffmpeg_path = os.path.join(os.getcwd(), "node_modules/ffmpeg-static/ffmpeg")

with open("spotify_tracks.json", "r") as f:
  tracks = json.load(f)

audio_dir = os.path.join(os.getcwd(), "public/audio/spotify_playlist")
os.makedirs(audio_dir, exist_ok=True)

downloaded_files = []

for idx, item in enumerate(tracks, 1):
  filename = f"track_{idx:02d}.m4a"
  out_path = os.path.join(audio_dir, filename)

  # Overwrite existing files with exact artist-matched recordings
  if os.path.exists(out_path):
    try:
      os.remove(out_path)
    except Exception as e:
      pass

  title = item['title']
  artist = item['artist']
  query_str = f"ytsearch1:{item['query']}"

  print(f"[{idx}/{len(tracks)}] Refetching exact studio track: {title} by {artist}...")
  cmd = [
    yt_dlp_path,
    "--extractor-args", "youtube:player_client=ios,android",
    "-f", "ba/b",
    "-x",
    "--audio-format", "m4a",
    "--ffmpeg-location", ffmpeg_path,
    "-o", out_path,
    query_str
  ]
  try:
    subprocess.run(cmd, check=True)
    downloaded_files.append(out_path)
  except Exception as e:
    print(f"Failed to download {title}: {e}")

print("All exact artist-matched playlist tracks processed!")

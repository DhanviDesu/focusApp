import urllib.request
import json
import re

tracks = [
  "https://open.spotify.com/track/1syWsWscOdvnDf9xe2Sjcl",
  "https://open.spotify.com/track/2pcqjh978FXjLnRcv22x2h",
  "https://open.spotify.com/track/1YFA2vnDRM6NtZlh0U3kRq",
  "https://open.spotify.com/track/4NtRkpweTUxkKHvl0odbgD",
  "https://open.spotify.com/track/7COLWiJDOblr1SiyDnsHae",
  "https://open.spotify.com/track/0hdCp3FOvWWQIcwmcDF0YM",
  "https://open.spotify.com/track/66pWxtaxTV8CxcGOvivZeT",
  "https://open.spotify.com/track/4NctNkFaMwv4cvgtB7l1JX",
  "https://open.spotify.com/track/05N1ndYwY89VuJPvPcdeLi",
  "https://open.spotify.com/track/5ZFFARxXf7KqLEIaVA27li",
  "https://open.spotify.com/track/3H9au5DxP2ryR2ozNngGM3",
  "https://open.spotify.com/track/5mDOLxrheenIFmUpxypN5L",
  "https://open.spotify.com/track/3qIn8QQRhWVq5lQCfOkCCZ",
  "https://open.spotify.com/track/4pmkhFh9kmrE8gcko7DXMM",
  "https://open.spotify.com/track/4IrWyseKFBykjoTm67NnNU",
  "https://open.spotify.com/track/2QGTQOdeiojlAXzwMT3qgb",
  "https://open.spotify.com/track/6C7kMVMfmc9kyh7mB8fbCs",
  "https://open.spotify.com/track/1QgcOUBmtt5sLY9CUTslpW",
  "https://open.spotify.com/track/33FtwY8jXSPaHRtEGFggwO",
  "https://open.spotify.com/track/0oe8xyvJ0yMalvT38Nu8qS",
  "https://open.spotify.com/track/0ve62wqEnV3UlR7aqTxW0q",
  "https://open.spotify.com/track/3cjnHdm68b8u3oUUpVn3er",
  "https://open.spotify.com/track/4PnctK3MDbzpLKYiHN47uQ",
  "https://open.spotify.com/track/6RaiLSBVex2ZX7R7oh4Wkj",
  "https://open.spotify.com/track/2o3BTVrhtwjRpaiDB29okA",
  "https://open.spotify.com/track/2N8pjeNjFT8Fw58e5z2LDf",
  "https://open.spotify.com/track/6FiVybin2ArwUDwGKSOA2r",
  "https://open.spotify.com/track/7exOrewyAiFxxHkGMXIvUn",
  "https://open.spotify.com/track/3KCdPofZGWwHSXd8g3g9HJ",
  "https://open.spotify.com/track/1vWtTis3VRkkUp8qST4jY5"
]

results = []

for idx, url in enumerate(tracks, 1):
  try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
    with urllib.request.urlopen(req) as resp:
      html = resp.read().decode('utf-8')
      title_match = re.search(r'<title>(.*?)</title>', html)
      page_title = title_match.group(1) if title_match else ""
      
      # Clean Spotify title format: "Song Name - song and lyrics by Artist | Spotify"
      # or "Song Name - Single by Artist | Spotify"
      clean_info = page_title.replace(" | Spotify", "").replace(" - song and lyrics by ", " ").replace(" - song by ", " ").replace(" - Single by ", " ")
      
      # Extract title and artist from og:title & og:description if available
      og_title = re.search(r'<meta property="og:title" content="(.*?)"', html)
      og_desc = re.search(r'<meta property="og:description" content="(.*?)"', html)
      
      song_name = og_title.group(1) if og_title else ""
      artist_name = ""
      if og_desc:
        desc_val = og_desc.group(1)
        # e.g. "Listen to Attention (Violin) on Spotify. Instrumental Pop Ensemble · Song · 2021."
        artist_match = re.search(r'Listen to .*? on Spotify\. (.*?) ·', desc_val)
        if artist_match:
          artist_name = artist_match.group(1)
      
      query = f"{song_name} {artist_name}".strip() if song_name and artist_name else clean_info
      results.append({"title": song_name or clean_info, "artist": artist_name, "query": query})
      print(f"[{idx:02d}] Query: {query}")
  except Exception as e:
    print(f"Error [{idx:02d}]: {e}")

with open("spotify_tracks_with_artists.json", "w") as f:
  json.dump(results, f, indent=2)

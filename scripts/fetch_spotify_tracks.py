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
for url in tracks:
  try:
    oembed_url = f"https://open.spotify.com/oembed?url={url}"
    req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
      data = json.loads(resp.read().decode('utf-8'))
      title = data.get('title', '')
      results.append(title)
      print(f"Fetched: {title}")
  except Exception as e:
    print(f"Error {url}: {e}")

with open("spotify_tracks.json", "w") as f:
  json.dump(results, f, indent=2)

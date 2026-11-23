#!/usr/bin/env python3
"""Makes Katie's audio clips with Cartesia. The key is read from CARTESIA_API_KEY and never stored.
Run from the prototype folder:  CARTESIA_API_KEY=... python3 voice/generate.py [--force]"""
import json, os, pathlib, sys, urllib.request
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from lines import LINES
KATIE = 'f786b574-daa5-4673-aa0c-cbe3e8534c02'  # Cartesia voice id, "Katie", Female US (Tringg voice id page)
out = pathlib.Path(__file__).parent / 'clips'
out.mkdir(exist_ok=True)
key = os.environ['CARTESIA_API_KEY']
force = '--force' in sys.argv
for k, text in LINES.items():
    f = out / (k + '.mp3')
    meta = out / (k + '.txt')
    if f.exists() and meta.exists() and meta.read_text() == text and not force:
        continue
    req = urllib.request.Request('https://api.cartesia.ai/tts/bytes', method='POST', headers={'X-API-Key': key, 'Cartesia-Version': '2025-04-16', 'Content-Type': 'application/json'},
        data=json.dumps({'model_id': 'sonic-3', 'transcript': text, 'voice': {'mode': 'id', 'id': KATIE}, 'output_format': {'container': 'mp3', 'sample_rate': 44100, 'bit_rate': 96000}, 'language': 'en'}).encode())
    f.write_bytes(urllib.request.urlopen(req, timeout=60).read())
    meta.write_text(text)
    print('made', k, f.stat().st_size // 1024, 'KB')

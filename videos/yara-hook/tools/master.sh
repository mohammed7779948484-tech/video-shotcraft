#!/usr/bin/env bash
# Post-render audio mastering (video stream is copied untouched). Run from videos/yara-hook after:
#   npx remotion render src/index.ts YaraHook out/raw-bgm.mp4
#   npx remotion render src/index.ts YaraHook out/raw-nobgm.mp4 --props=props-nobgm.json
# Result: ~ -14 LUFS integrated, sample peak ~ -1.5 dBFS, last 0.4 s faded, exactly 20.000 s.
set -euo pipefail
for pair in "bgm:yara-hook.mp4" "nobgm:yara-hook-nobgm.mp4"; do
  n="${pair%%:*}"; out="out/${pair##*:}"
  ffmpeg -y -loglevel error -i "out/raw-$n.mp4" -t 20.0 -c:v copy \
    -af "volume=3.3dB,alimiter=limit=0.84:attack=3:release=80:level=0,afade=t=out:st=19.6:d=0.4" \
    -c:a aac -b:a 256k -ar 48000 "$out"
  echo "mastered $out"
done

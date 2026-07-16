#!/usr/bin/env bash
# Compress the demo videos under public/projects/ for the web.
# - H.264 / yuv420p (plays everywhere), capped at 1080p on the long edge
# - CRF 24: visually lossless-ish, keeps terminal text crisp
# - +faststart so playback can begin before the whole file downloads
# - encodes to a temp file, only replaces the original if it came out smaller
# Originals in ~/Documents/screenshots are untouched — this only rewrites the
# copies inside the repo.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEOS=(
  "$ROOT/public/projects/haylxon/demo.mp4"
  "$ROOT/public/projects/tes-chat/demo.mp4"
)

CRF="${CRF:-24}"        # override: CRF=28 ./scripts/compress-project-videos.sh
MAXH="${MAXH:-1080}"    # cap the long edge at this many pixels

command -v ffmpeg >/dev/null || { echo "ffmpeg not found"; exit 1; }

human() { du -h "$1" | cut -f1; }

for in in "${VIDEOS[@]}"; do
  if [[ ! -f "$in" ]]; then
    echo "skip (missing): $in"
    continue
  fi

  tmp="${in%.mp4}.tmp.mp4"
  before="$(human "$in")"
  echo "→ compressing $(basename "$(dirname "$in")")/$(basename "$in")  (was $before)"

  # scale so the LONGER side is at most $MAXH, keep aspect, force even dims,
  # never upscale. Works for both landscape and vertical (phone) recordings.
  ffmpeg -hide_banner -loglevel error -y -i "$in" \
    -vf "scale='if(gt(iw,ih),-2,min(${MAXH},iw))':'if(gt(iw,ih),min(${MAXH},ih),-2)':flags=lanczos" \
    -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p \
    -movflags +faststart \
    -c:a aac -b:a 128k \
    "$tmp"

  after="$(human "$tmp")"
  in_bytes="$(wc -c < "$in")"
  out_bytes="$(wc -c < "$tmp")"

  if (( out_bytes < in_bytes )); then
    mv "$tmp" "$in"
    echo "  ✓ $before → $after"
  else
    rm -f "$tmp"
    echo "  · already smaller than re-encode ($before), kept original"
  fi
done

echo "done."

#!/usr/bin/env bash
# Hush — iOS app icon size generator.
#
# Takes a single 1024×1024 master PNG and generates every size Xcode wants
# in the AppIcon.appiconset folder, plus the matching Contents.json.
#
# Usage:
#   ./scripts/gen-icons.sh <path-to-1024x1024-master.png>
#
# Run from the project root. Requires the iOS folder to already exist
# (run `npx cap add ios` first if you haven't). Uses macOS-native `sips`
# for resizing — no extra dependencies.

set -euo pipefail

MASTER="${1:-}"
OUT="ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [[ -z "$MASTER" ]]; then
  cat <<'USAGE'
Usage: ./scripts/gen-icons.sh <path-to-1024x1024-master.png>

The master must be:
  - Exactly 1024×1024 pixels
  - PNG format (no transparency — iOS rejects transparent icons)
  - Square (no rounded corners — iOS rounds them automatically)
  - The full design (no padding for safe areas — Canva templates handle this)
USAGE
  exit 1
fi

if [[ ! -f "$MASTER" ]]; then
  echo "❌ File not found: $MASTER" >&2
  exit 1
fi

# Verify master dimensions are 1024×1024.
W=$(sips -g pixelWidth  "$MASTER" | awk '/pixelWidth/  {print $2}')
H=$(sips -g pixelHeight "$MASTER" | awk '/pixelHeight/ {print $2}')
if [[ "$W" != "1024" || "$H" != "1024" ]]; then
  echo "❌ Master must be exactly 1024×1024. Got ${W}×${H}." >&2
  echo "   Resize in Canva (set canvas to 1024×1024) and re-export." >&2
  exit 1
fi

if [[ ! -d "$OUT" ]]; then
  echo "❌ Destination folder not found: $OUT" >&2
  echo "   Run 'npx cap add ios' first to scaffold the iOS project." >&2
  exit 1
fi

# Each entry: <output-filename>:<pixel-size>
SIZES=(
  "AppIcon-20.png:20"
  "AppIcon-20@2x.png:40"
  "AppIcon-20@3x.png:60"
  "AppIcon-29.png:29"
  "AppIcon-29@2x.png:58"
  "AppIcon-29@3x.png:87"
  "AppIcon-40.png:40"
  "AppIcon-40@2x.png:80"
  "AppIcon-40@3x.png:120"
  "AppIcon-60@2x.png:120"
  "AppIcon-60@3x.png:180"
  "AppIcon-76.png:76"
  "AppIcon-76@2x.png:152"
  "AppIcon-83.5@2x.png:167"
  "AppIcon-1024.png:1024"
)

echo "Generating ${#SIZES[@]} icon sizes from $(basename "$MASTER")…"
for entry in "${SIZES[@]}"; do
  name="${entry%%:*}"
  size="${entry##*:}"
  printf "  %-26s  %4s×%-4s\n" "$name" "$size" "$size"
  sips -Z "$size" "$MASTER" --out "$OUT/$name" >/dev/null
done

# Contents.json — Xcode reads this to map files to size/scale/idiom triples.
cat > "$OUT/Contents.json" <<'JSON'
{
  "images" : [
    { "idiom" : "iphone",        "size" : "20x20",     "scale" : "2x", "filename" : "AppIcon-20@2x.png" },
    { "idiom" : "iphone",        "size" : "20x20",     "scale" : "3x", "filename" : "AppIcon-20@3x.png" },
    { "idiom" : "iphone",        "size" : "29x29",     "scale" : "2x", "filename" : "AppIcon-29@2x.png" },
    { "idiom" : "iphone",        "size" : "29x29",     "scale" : "3x", "filename" : "AppIcon-29@3x.png" },
    { "idiom" : "iphone",        "size" : "40x40",     "scale" : "2x", "filename" : "AppIcon-40@2x.png" },
    { "idiom" : "iphone",        "size" : "40x40",     "scale" : "3x", "filename" : "AppIcon-40@3x.png" },
    { "idiom" : "iphone",        "size" : "60x60",     "scale" : "2x", "filename" : "AppIcon-60@2x.png" },
    { "idiom" : "iphone",        "size" : "60x60",     "scale" : "3x", "filename" : "AppIcon-60@3x.png" },
    { "idiom" : "ipad",          "size" : "20x20",     "scale" : "1x", "filename" : "AppIcon-20.png" },
    { "idiom" : "ipad",          "size" : "20x20",     "scale" : "2x", "filename" : "AppIcon-20@2x.png" },
    { "idiom" : "ipad",          "size" : "29x29",     "scale" : "1x", "filename" : "AppIcon-29.png" },
    { "idiom" : "ipad",          "size" : "29x29",     "scale" : "2x", "filename" : "AppIcon-29@2x.png" },
    { "idiom" : "ipad",          "size" : "40x40",     "scale" : "1x", "filename" : "AppIcon-40.png" },
    { "idiom" : "ipad",          "size" : "40x40",     "scale" : "2x", "filename" : "AppIcon-40@2x.png" },
    { "idiom" : "ipad",          "size" : "76x76",     "scale" : "1x", "filename" : "AppIcon-76.png" },
    { "idiom" : "ipad",          "size" : "76x76",     "scale" : "2x", "filename" : "AppIcon-76@2x.png" },
    { "idiom" : "ipad",          "size" : "83.5x83.5", "scale" : "2x", "filename" : "AppIcon-83.5@2x.png" },
    { "idiom" : "ios-marketing", "size" : "1024x1024", "scale" : "1x", "filename" : "AppIcon-1024.png" }
  ],
  "info" : { "version" : 1, "author" : "xcode" }
}
JSON

echo ""
echo "✅ Done. ${#SIZES[@]} icon files written to:"
echo "   $OUT/"
echo ""
echo "Next:"
echo "  npm run build && npx cap sync ios"
echo "  npx cap open ios"
echo ""
echo "Verify in Xcode → App → Assets.xcassets → AppIcon."

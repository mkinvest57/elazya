#!/bin/bash
set -e

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "🎨 Generating DMG background..."
node scripts/create-dmg-background.cjs

# Target architecture (default to aarch64 for Apple Silicon, adjustable)
TARGET="aarch64-apple-darwin"

echo "🔨 Building Tauri app for $TARGET..."
npm run tauri build -- --target "$TARGET"

SOURCE_DIR="src-tauri/target/$TARGET/release/bundle/macos"
DMG_OUTPUT="src-tauri/target/Elazya_2.0.0_aarch64.dmg"

# Ensure old DMG is removed to avoid conflicts
rm -f "$DMG_OUTPUT"

echo "📦 Creating professional DMG..."
/opt/homebrew/bin/create-dmg \
  --volname "Elazya" \
  --background "src-tauri/assets/dmg-background.png" \
  --window-pos 200 120 \
  --window-size 660 400 \
  --icon-size 100 \
  --icon "Elazya.app" 160 210 \
  --hide-extension "Elazya.app" \
  --app-drop-link 500 210 \
  "$DMG_OUTPUT" \
  "$SOURCE_DIR"

echo "✅ DMG créé : $DMG_OUTPUT"
echo "📏 Taille : $(du -sh "$DMG_OUTPUT" | cut -f1)"

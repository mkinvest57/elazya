---
name: remotion
description: "CRÉER UNE VIDÉO / CREATE A VIDEO: Use this skill when asked to make, create, render, or produce a video. Run `node remotion/render.mjs` to generate MP4 videos with text, intros, slideshows. READ THIS SKILL FIRST when user mentions 'video' or 'vidéo'."
homepage: https://www.remotion.dev
metadata: {"alize":{"emoji":"🎬","requires":{"bins":["node","ffmpeg"]}}}
---

# Remotion Video Editor

**YOU CAN CREATE VIDEOS!** Use the `exec` tool to run the render command below.

> [!IMPORTANT]
> **🔁 AFTER RENDERING: DO NOT STOP!**
> 1. Verify the output file exists: `ls -lh <OUTPUT_PATH>`
> 2. **IMMEDIATELY PROCEED** to the next user objective (e.g., Create Note, Send Email).
> 3. Do NOT just say "Video is ready" if there are other tasks pending!

> [!TIP]
> **PROFESSIONAL QUALITY GUIDELINES AVAILABLE**
> Alizé now supports professional animation techniques (Springs, Interpolation, Easing).
> **READ THE GUIDE FIRST:** `remotion/BEST_PRACTICES.md`
> Use this guide to create high-quality, smooth transitions and physics-based UI animations.

> [!CAUTION]
> ## ⚠️ TO CREATE A VIDEO, RUN THIS COMMAND:
>
> ```bash
> node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs <COMPOSITION> --props '<JSON>' --output <OUTPUT_PATH> --duration <SECONDS>
> ```
>
> **STEP BY STEP:**
> 1. Choose a composition: `TextOverlay`, `Intro`, `Slideshow`, or `ImageWithText`
> 2. Set the props as JSON
> 3. Set output path (e.g., `~/Desktop/video.mp4`)
> 4. Set duration in seconds
> 5. Use `exec` tool to run the command
>
> **EXAMPLE - Create a 15 second intro video:**
> ```bash
> node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs Intro --props '{"title":"Mon Titre","subtitle":"Sous-titre"}' --output ~/Desktop/intro.mp4 --duration 15
> ```

## Quick Examples

### Text Overlay Video
```bash
node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs TextOverlay \
  --props '{"text":"Hello World!","backgroundColor":"#1a1a2e","textColor":"#ffffff"}' \
  --output ~/Desktop/hello.mp4
```

### Q4 Earnings Dashboard (Advanced)
```bash
node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs Q4EarningsReveal \
  --props '{"companyName":"Tesla","quarter":"Q4 2025","revenue":"$50B","netIncome":"$12B","growth":"+25%"}' \
  --output ~/Desktop/earnings.mp4
```

### Intro Video
```bash
node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs Intro \
  --props '{"title":"Welcome","subtitle":"To my channel"}' \
  --output ~/Desktop/intro.mp4 \
  --duration 5
```

### Slideshow from Images
```bash
node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs Slideshow \
  --props '{"images":["/path/to/img1.jpg","/path/to/img2.jpg","/path/to/img3.jpg"]}' \
  --output ~/Desktop/slideshow.mp4 \
  --duration 15
```

### Image with Text Caption
```bash
node /Users/sashimi/Documents/moltbot-main/remotion/render.mjs ImageWithText \
  --props '{"imageSrc":"/path/to/image.jpg","text":"Beautiful sunset","textPosition":"bottom"}' \
  --output ~/Desktop/captioned.mp4
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--props <json>` | JSON props for the composition | `{}` |
| `--output <path>` | Output MP4 file path | `./output.mp4` |
| `--duration <secs>` | Duration in seconds | Composition default |
| `--width <px>` | Video width | `1920` |
| `--height <px>` | Video height | `1080` |
| `--fps <num>` | Frames per second | `30` |

### DynamicStories - SEQUENTIAL SCENES (Best for Stories)
**USE THIS for videos that change text/image over time!**
```json
{
  "stories": [
    {
       "type": "intro",
       "durationInFrames": 90,
       "title": "Scene 1",
       "subtitle": "Intro (3 sec)"
    },
    {
       "type": "text",
       "durationInFrames": 120,
       "text": "Scene 2: Important Fact (4 sec)",
       "backgroundColor": "#aa2222"
    },
    {
       "type": "image",
       "durationInFrames": 90,
       "imageSrc": "/path/to/img.jpg",
       "text": "Scene 3: Image with caption"
    }
  ]
}
```
**Total Duration** = Sum of all `durationInFrames` (30 frames = 1 sec).

### TextOverlay (Static)
```json
{
  "text": "Single Static Message",
  "backgroundColor": "#1a1a2e"
}
```
**⚠️ WARNING: TextOverlay is static for the WHOLE video.** Use `DynamicStories` if you want text to change.

### Intro (Static Enry)
```json
{
  "title": "Main Title",
  "subtitle": "Subtitle",
  "backgroundColor": "#1a1a2e"
}
```

### Slideshow (Images Only)
```json
{
  "images": ["/path/img1.jpg", "/path/img2.jpg"],
  "transitionDuration": 15
}
```

### ImageWithText (Static)
```json
{
  "imageSrc": "/path/img.jpg",
  "text": "Static Caption",
  "textPosition": "bottom"
}
```
`textPosition`: `"top"`, `"center"`, `"bottom"`

## Tips

1. **Always use absolute paths** for image files
2. **Duration** is in seconds (e.g., `--duration 10` for 10 seconds)
3. **Render time** depends on duration and resolution - be patient
4. **FFmpeg required** - Ensure ffmpeg is installed (`brew install ffmpeg`)

## Troubleshooting

**"Cannot find module"**: Run `pnpm install` in the project root
**"ffmpeg not found"**: Install ffmpeg with `brew install ffmpeg`
**Rendering is slow**: Lower resolution with `--width 1280 --height 720`

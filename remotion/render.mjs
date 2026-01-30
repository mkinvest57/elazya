#!/usr/bin/env node
/**
 * Remotion CLI Render Script
 * 
 * Usage:
 *   node render.mjs <composition> [options]
 * 
 * Examples:
 *   node render.mjs TextOverlay --props '{"text":"Hello"}' --output ./out/hello.mp4
 *   node render.mjs Intro --props '{"title":"Welcome","subtitle":"To my video"}'
 *   node render.mjs Slideshow --props '{"images":["./img1.jpg","./img2.jpg"]}' --duration 10
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function render() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help') {
        console.log(`
Remotion Video Renderer

Usage:
  node render.mjs <composition> [options]

Compositions:
  TextOverlay    - Simple text on colored background
  Slideshow      - Multiple images with transitions  
  Intro          - Animated title with subtitle
  ImageWithText  - Single image with text overlay

Options:
  --props <json>     Props to pass to the composition (JSON string)
  --output <path>    Output file path (default: ./output.mp4)
  --duration <secs>  Video duration in seconds (overrides default)
  --width <px>       Video width (default: 1920)
  --height <px>      Video height (default: 1080)
  --fps <num>        Frames per second (default: 30)

Examples:
  node render.mjs TextOverlay --props '{"text":"Hello World"}' --output hello.mp4
  node render.mjs Intro --props '{"title":"Welcome","subtitle":"Video"}'
  node render.mjs Slideshow --props '{"images":["/path/to/img1.jpg","/path/to/img2.jpg"]}' --duration 10
`);
        process.exit(0);
    }

    const compositionId = args[0];

    // Parse options
    let props = {};
    let outputPath = path.join(__dirname, 'output.mp4');
    let duration = null;
    let width = 1920;
    let height = 1080;
    let fps = 30;

    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '--props':
                try {
                    props = JSON.parse(args[++i]);
                } catch (e) {
                    console.error('Error parsing props JSON:', e.message);
                    process.exit(1);
                }
                break;
            case '--output':
                outputPath = args[++i];
                break;
            case '--duration':
                duration = parseFloat(args[++i]);
                break;
            case '--width':
                width = parseInt(args[++i]);
                break;
            case '--height':
                height = parseInt(args[++i]);
                break;
            case '--fps':
                fps = parseInt(args[++i]);
                break;
        }
    }

    console.log(`🎬 Rendering ${compositionId}...`);
    console.log(`   Props: ${JSON.stringify(props)}`);
    console.log(`   Output: ${outputPath}`);

    try {
        // Bundle the Remotion project
        console.log('📦 Bundling...');
        const bundleLocation = await bundle({
            entryPoint: path.join(__dirname, 'index.ts'),
            webpackOverride: (config) => config,
        });

        // Select composition
        console.log('🎯 Selecting composition...');
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: props,
        });

        // Override duration if specified
        if (duration) {
            composition.durationInFrames = Math.round(duration * fps);
        }

        // Render
        console.log('🎥 Rendering video...');
        await renderMedia({
            composition: {
                ...composition,
                width,
                height,
                fps,
            },
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: props,
            chromiumOptions: {
                gl: 'swangle',
            },
            onProgress: ({ progress }) => {
                process.stdout.write(`\r   Progress: ${Math.round(progress * 100)}%`);
            },
        });

        console.log(`\n✅ Video rendered successfully: ${outputPath}`);
    } catch (error) {
        console.error('❌ Render failed:', error.message);
        process.exit(1);
    }
}

render();

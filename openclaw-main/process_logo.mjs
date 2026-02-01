import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Source is the uploaded file in artifact dir
const SOURCE = '/Users/sashimi/.gemini/antigravity/brain/749308f0-305c-4131-b983-e596728d3bff/uploaded_media_4_1769960685839.jpg';
const TARGET = '/Users/sashimi/Documents/moltbot-main/alize-v1000/app-icon.png';

async function process() {
    console.log("Reading from:", SOURCE);

    // Create a 1024x1024 square canvas with transparent background
    // But since source is JPG, it has no transparency. 
    // We will just resize it to cover 1024x1024 or contain it.
    // Assuming the user wants the image as is but squared.

    await sharp(SOURCE)
        .resize(1024, 1024, {
            fit: 'cover', // or 'contain' if we want padding
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png() // Convert to PNG
        .toFile(TARGET);

    console.log("Written to:", TARGET);
}

process().catch(console.error);

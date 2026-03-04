const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyHtmlFiles(src, dest) {
    let entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        if (entry.isDirectory()) {
            copyHtmlFiles(srcPath, dest); // Flattening everything to root
        } else if (entry.name.endsWith('.html')) {
            fs.copyFileSync(srcPath, path.join(dest, entry.name));
        }
    }
}

const NEXT_DIR = path.join(process.cwd(), '.next');
const OUT_DIR = path.join(process.cwd(), 'out');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

// Copy public files
if (fs.existsSync(PUBLIC_DIR)) {
    copyDir(PUBLIC_DIR, OUT_DIR);
    console.log("Copied public/ to out/");
}

// Copy static Next.js assets
const nextStaticDir = path.join(NEXT_DIR, 'static');
const outNextStaticDir = path.join(OUT_DIR, '_next', 'static');
if (fs.existsSync(nextStaticDir)) {
    copyDir(nextStaticDir, outNextStaticDir);
    console.log("Copied .next/static to out/_next/static");
}

// Copy all generated HTML from app router
const appServerDir = path.join(NEXT_DIR, 'server', 'app');
if (fs.existsSync(appServerDir)) {
    copyHtmlFiles(appServerDir, OUT_DIR);
    console.log("Copied generated HTML to out/");
}

console.log("Static assembly complete.");

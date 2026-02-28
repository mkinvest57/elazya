const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const WIDTH = 660;
const HEIGHT = 400;

function drawBackground(ctx, width, height, scale = 1) {
  const s = (val) => val * scale;

  // 1. Background (Solid Dark)
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, width, height);

  // 2. Vibrant Bottom Glow (Purple)
  const glow = ctx.createRadialGradient(
    width / 2, height + s(50), 0, 
    width / 2, height + s(50), s(350)
  );
  glow.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
  glow.addColorStop(1, 'rgba(147, 51, 234, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // 3. Dotted Grid (40px spacing)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  const dotSpacing = s(40);
  const dotSize = s(1.5);
  for (let x = 0; x <= width; x += dotSpacing) {
    for (let y = 0; y <= height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helper for rounded rect
  function fillRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function strokeRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
  }

  // 4. Icon Placeholders (The rounded squares)
  // App Placeholder (Left)
  const squareSize = s(160);
  const leftX = s(160) - squareSize / 2;
  const rightX = s(500) - squareSize / 2;
  const squareY = s(210) - squareSize / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = s(1);
  fillRoundedRect(leftX, squareY, squareSize, squareSize, s(32));
  strokeRoundedRect(leftX, squareY, squareSize, squareSize, s(32));

  // Big white "E" for Elazya placeholder
  ctx.fillStyle = 'white';
  ctx.font = `bold ${s(80)}px -apple-system, SF Pro Display`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', s(160), s(210));

  // Applications Placeholder (Right)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  fillRoundedRect(rightX, squareY, squareSize, squareSize, s(32));
  strokeRoundedRect(rightX, squareY, squareSize, squareSize, s(32));

  // Folder icon outline in right placeholder
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = s(3);
  const folderW = s(60);
  const folderH = s(45);
  const fx = s(500) - folderW / 2;
  const fy = s(215) - folderH / 2;
  const fr = s(6);
  ctx.beginPath();
  ctx.moveTo(fx, fy + folderH - fr);
  ctx.quadraticCurveTo(fx, fy + folderH, fx + fr, fy + folderH);
  ctx.lineTo(fx + folderW - fr, fy + folderH);
  ctx.quadraticCurveTo(fx + folderW, fy + folderH, fx + folderW, fy + folderH - fr);
  ctx.lineTo(fx + folderW, fy + s(10) + fr);
  ctx.quadraticCurveTo(fx + folderW, fy + s(10), fx + folderW - fr, fy + s(10));
  ctx.lineTo(fx + s(25), fy + s(10));
  ctx.lineTo(fx + s(20), fy);
  ctx.lineTo(fx + fr, fy);
  ctx.quadraticCurveTo(fx, fy, fx, fy + fr);
  ctx.closePath();
  ctx.stroke();

  // 5. Dashed Arrow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.setLineDash([s(8), s(6)]);
  ctx.lineWidth = s(2);
  ctx.beginPath();
  ctx.moveTo(s(280), s(210));
  ctx.lineTo(s(380), s(210));
  ctx.stroke();
  
  // Arrow head
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(s(365), s(210) - s(12));
  ctx.lineTo(s(380), s(210));
  ctx.lineTo(s(365), s(210) + s(12));
  ctx.stroke();

  // 6. Labels Under Icons
  // Elazya Label (70% opacity)
  ctx.font = `${s(14)}px -apple-system, "SF Pro Display"`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('Elazya', s(160), s(315));

  // Applications Label (50% opacity)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('Applications', s(500), s(315));

  // 7. Instructions & Version
  // Main instruction center bottom (30% opacity)
  ctx.font = `${s(13)}px -apple-system, "SF Pro Text"`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('Drag Elazya to Applications to install', width / 2, height - s(40));

  // Version info bottom left (18% opacity)
  ctx.font = `${s(11)}px -apple-system, "SF Pro Text"`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.textAlign = 'left';
  ctx.fillText('v2.0.0 · macOS 13+', s(20), height - s(25));
}

// Ensure assets dir exists
const assetsDir = path.join(__dirname, '../src-tauri/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x
const canvas = createCanvas(WIDTH, HEIGHT);
drawBackground(canvas.getContext('2d'), WIDTH, HEIGHT, 1);
fs.writeFileSync(path.join(assetsDir, 'dmg-background.png'), canvas.toBuffer('image/png'));

// 2x
const canvas2x = createCanvas(WIDTH * 2, HEIGHT * 2);
drawBackground(canvas2x.getContext('2d'), WIDTH * 2, HEIGHT * 2, 2);
fs.writeFileSync(path.join(assetsDir, 'dmg-background@2x.png'), canvas2x.toBuffer('image/png'));

console.log('✅ DMG background generated in src-tauri/assets/');

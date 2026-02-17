import fs from 'fs';

// Since we might not have canvas installed, let's use a pure JS approach with a minimal PNG buffer
// A 1x1 Blue Pixel PNG
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('app-icon.png', buffer);
console.log('Created app-icon.png');

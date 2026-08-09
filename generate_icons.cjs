const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'logo.svg');
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const densities = [
  { name: 'drawable-mdpi', size: 24 },
  { name: 'drawable-hdpi', size: 36 },
  { name: 'drawable-xhdpi', size: 48 },
  { name: 'drawable-xxhdpi', size: 72 },
  { name: 'drawable-xxxhdpi', size: 96 }
];

async function generateIcons() {
  for (const density of densities) {
    const dir = path.join(resDir, density.name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const outPath = path.join(dir, 'ic_stat_aum_notification.png');
    
    await sharp(svgPath)
      .resize(density.size, density.size)
      // Notification icons should be white on transparent background
      .png()
      .toFile(outPath);
      
    console.log(`Generated ${outPath}`);
  }
}

generateIcons().catch(console.error);

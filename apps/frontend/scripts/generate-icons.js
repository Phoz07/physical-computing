const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon.png', size: 192 },
  { name: 'apple-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

const socialSizes = [
  { name: 'og-image.png', width: 1200, height: 630 },
];

const inputSvg = path.join(__dirname, '..', 'public', 'logo.svg');
const outputDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  console.log('🎨 Generating icons from logo.svg...\n');

  // Read SVG
  const svgBuffer = fs.readFileSync(inputSvg);

  // Generate square icons
  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);

    try {
      if (name.endsWith('.ico')) {
        // For ICO files, generate PNG first then convert
        await sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath.replace('.ico', '.png'));

        // Rename to .ico (browsers accept PNG as ICO)
        fs.renameSync(
          outputPath.replace('.ico', '.png'),
          outputPath
        );
        console.log(`✅ Generated: ${name} (${size}x${size})`);
      } else {
        await sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
        console.log(`✅ Generated: ${name} (${size}x${size})`);
      }
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  // Generate Open Graph / Social media images
  for (const { name, width, height } of socialSizes) {
    const outputPath = path.join(outputDir, name);

    try {
      // Create a white background with the logo centered
      await sharp(svgBuffer)
        .resize(Math.min(width * 0.5, height * 0.8), null, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: Math.floor((height - (height * 0.8)) / 2),
          bottom: Math.floor((height - (height * 0.8)) / 2),
          left: Math.floor((width - (width * 0.5)) / 2),
          right: Math.floor((width - (width * 0.5)) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated: ${name} (${width}x${height})`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  // Generate screenshot placeholder
  const screenshotPath = path.join(outputDir, 'screenshot1.png');
  try {
    await sharp(svgBuffer)
      .resize(1280, 720, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(screenshotPath);
    console.log(`✅ Generated: screenshot1.png (1280x720)`);
  } catch (error) {
    console.error(`❌ Error generating screenshot:`, error.message);
  }

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);

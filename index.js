#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .name('jpg2png')
  .description('Convert JPG images to PNG format')
  .version('1.0.0')
  .argument('<source>', 'Source JPG file or directory')
  .option('-o, --output <directory>', 'Output directory for PNG files')
  .option('-r, --recursive', 'Process directories recursively')
  .option('-q, --quality <number>', 'PNG quality (1-100)', '80')
  .action(async (source, options) => {
    try {
      const stats = fs.statSync(source);
      
      if (stats.isFile()) {
        if (path.extname(source).toLowerCase() === '.jpg' || 
            path.extname(source).toLowerCase() === '.jpeg') {
          await convertImage(source, options);
        } else {
          console.error(`Skipping non-JPG file: ${source}`);
        }
      } else if (stats.isDirectory()) {
        await processDirectory(source, options);
      }
      
      console.log('Conversion completed successfully!');
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();

async function convertImage(sourcePath, options) {
  try {
    const outputDir = options.output || path.dirname(sourcePath);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = path.basename(sourcePath, path.extname(sourcePath));
    const outputPath = path.join(outputDir, `${filename}.png`);
    
    console.log(`Converting: ${sourcePath} -> ${outputPath}`);
    
    await sharp(sourcePath)
      .png({ quality: parseInt(options.quality) })
      .toFile(outputPath);
      
  } catch (err) {
    console.error(`Failed to convert ${sourcePath}: ${err.message}`);
  }
}

async function processDirectory(dirPath, options) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isFile()) {
      if (path.extname(fullPath).toLowerCase() === '.jpg' || 
          path.extname(fullPath).toLowerCase() === '.jpeg') {
        await convertImage(fullPath, options);
      }
    } else if (entry.isDirectory() && options.recursive) {
      await processDirectory(fullPath, options);
    }
  }
}

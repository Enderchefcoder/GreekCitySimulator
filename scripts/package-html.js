
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '../dist/public');
const outputFile = path.resolve(__dirname, '../packaged-app.html');

// Read the index.html file
const indexPath = path.join(buildDir, 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Find all script tags
const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*><\/script>/g;
let match;
while ((match = scriptRegex.exec(htmlContent)) !== null) {
  const scriptSrc = match[1];
  if (scriptSrc.startsWith('/')) {
    const scriptPath = path.join(buildDir, scriptSrc);
    try {
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      // Replace the script tag with the inline version
      htmlContent = htmlContent.replace(
        match[0],
        `<script>${scriptContent}</script>`
      );
    } catch (err) {
      console.error(`Error reading script file: ${scriptPath}`, err);
    }
  }
}

// Find all link tags for CSS
const linkRegex = /<link[^>]*href="([^"]*)"[^>]*rel="stylesheet"[^>]*>/g;
while ((match = linkRegex.exec(htmlContent)) !== null) {
  const linkHref = match[1];
  if (linkHref.startsWith('/')) {
    const cssPath = path.join(buildDir, linkHref);
    try {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      // Replace the link tag with an inline style tag
      htmlContent = htmlContent.replace(
        match[0],
        `<style>${cssContent}</style>`
      );
    } catch (err) {
      console.error(`Error reading CSS file: ${cssPath}`, err);
    }
  }
}

// Handle images and other assets by converting to data URLs
const imgRegex = /url\(['"]?([^'"]*.(png|jpg|jpeg|gif|svg|webp))['"]?\)/g;
while ((match = imgRegex.exec(htmlContent)) !== null) {
  const imgPath = match[1];
  if (imgPath.startsWith('/')) {
    const fullImgPath = path.join(buildDir, imgPath);
    try {
      const imgBuffer = fs.readFileSync(fullImgPath);
      const imgExt = path.extname(fullImgPath).substring(1);
      const mimeType = `image/${imgExt === 'svg' ? 'svg+xml' : imgExt}`;
      const dataUrl = `data:${mimeType};base64,${imgBuffer.toString('base64')}`;
      
      // Replace the image URL with the data URL
      htmlContent = htmlContent.replace(imgPath, dataUrl);
    } catch (err) {
      console.error(`Error reading image file: ${fullImgPath}`, err);
    }
  }
}

// Write the combined HTML to a file
fs.writeFileSync(outputFile, htmlContent, 'utf8');
console.log(`Self-contained HTML file created at: ${outputFile}`);

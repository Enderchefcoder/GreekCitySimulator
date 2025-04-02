
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.resolve(projectRoot, 'dist/public');
const outputFile = path.resolve(projectRoot, 'bundled-app.html');

// First ensure we have a fresh build
console.log('Building the application...');
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build completed. Creating self-contained HTML...');

// Read the index.html file
const indexPath = path.join(buildDir, 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Find all script tags and inline them
const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*><\/script>/g;
let match;
while ((match = scriptRegex.exec(htmlContent)) !== null) {
  const scriptSrc = match[1];
  
  // Handle both absolute and relative paths
  let scriptPath;
  if (scriptSrc.startsWith('/')) {
    scriptPath = path.join(buildDir, scriptSrc);
  } else if (scriptSrc.startsWith('http')) {
    console.log(`Skipping external script: ${scriptSrc}`);
    continue;
  } else {
    scriptPath = path.join(path.dirname(indexPath), scriptSrc);
  }
  
  try {
    console.log(`Inlining script: ${scriptPath}`);
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

// Find all link tags for CSS and inline them
const linkRegex = /<link[^>]*href="([^"]*)"[^>]*rel="stylesheet"[^>]*>/g;
while ((match = linkRegex.exec(htmlContent)) !== null) {
  const linkHref = match[1];
  
  // Handle both absolute and relative paths
  let cssPath;
  if (linkHref.startsWith('/')) {
    cssPath = path.join(buildDir, linkHref);
  } else if (linkHref.startsWith('http')) {
    console.log(`Skipping external stylesheet: ${linkHref}`);
    continue;
  } else {
    cssPath = path.join(path.dirname(indexPath), linkHref);
  }
  
  try {
    console.log(`Inlining stylesheet: ${cssPath}`);
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

// Handle images and other assets by converting to data URLs
// Both in HTML and CSS
const processedUrls = new Set();

// Process images in CSS or inline styles
const imgRegex = /url\(['"]?([^'"]*\.(png|jpg|jpeg|gif|svg|webp))['"]?\)/g;
while ((match = imgRegex.exec(htmlContent)) !== null) {
  const imgPath = match[1];
  if (processedUrls.has(imgPath)) continue;
  
  // Handle both absolute and relative paths
  let fullImgPath;
  if (imgPath.startsWith('/')) {
    fullImgPath = path.join(buildDir, imgPath);
  } else if (imgPath.startsWith('http')) {
    console.log(`Skipping external image: ${imgPath}`);
    continue;
  } else {
    fullImgPath = path.join(path.dirname(indexPath), imgPath);
  }
  
  try {
    console.log(`Inlining image: ${fullImgPath}`);
    const imgBuffer = fs.readFileSync(fullImgPath);
    const imgExt = path.extname(fullImgPath).substring(1);
    const mimeType = `image/${imgExt === 'svg' ? 'svg+xml' : imgExt}`;
    const dataUrl = `data:${mimeType};base64,${imgBuffer.toString('base64')}`;
    
    // Replace all occurrences of this image URL with the data URL
    const escapedImgPath = imgPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceRegex = new RegExp(escapedImgPath, 'g');
    htmlContent = htmlContent.replace(replaceRegex, dataUrl);
    processedUrls.add(imgPath);
  } catch (err) {
    console.error(`Error reading image file: ${fullImgPath}`, err);
  }
}

// Process images in img tags
const imgTagRegex = /<img[^>]*src="([^"]*\.(png|jpg|jpeg|gif|svg|webp))"[^>]*>/g;
while ((match = imgTagRegex.exec(htmlContent)) !== null) {
  const imgSrc = match[1];
  if (processedUrls.has(imgSrc)) continue;
  
  // Handle both absolute and relative paths
  let fullImgPath;
  if (imgSrc.startsWith('/')) {
    fullImgPath = path.join(buildDir, imgSrc);
  } else if (imgSrc.startsWith('http')) {
    console.log(`Skipping external image: ${imgSrc}`);
    continue;
  } else {
    fullImgPath = path.join(path.dirname(indexPath), imgSrc);
  }
  
  try {
    console.log(`Inlining image tag: ${fullImgPath}`);
    const imgBuffer = fs.readFileSync(fullImgPath);
    const imgExt = path.extname(fullImgPath).substring(1);
    const mimeType = `image/${imgExt === 'svg' ? 'svg+xml' : imgExt}`;
    const dataUrl = `data:${mimeType};base64,${imgBuffer.toString('base64')}`;
    
    // Replace all occurrences of this image URL with the data URL
    const escapedImgSrc = imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceRegex = new RegExp(escapedImgSrc, 'g');
    htmlContent = htmlContent.replace(replaceRegex, dataUrl);
    processedUrls.add(imgSrc);
  } catch (err) {
    console.error(`Error reading image file: ${fullImgPath}`, err);
  }
}

// Inject a meta tag to prevent CORS issues with inlined resources
htmlContent = htmlContent.replace(
  '<head>',
  '<head>\n    <meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: \'unsafe-inline\' \'unsafe-eval\';">'
);

// Add a title if not present
if (!htmlContent.includes('<title>')) {
  htmlContent = htmlContent.replace(
    '<head>',
    '<head>\n    <title>Bundled React App</title>'
  );
}

// Write the combined HTML to a file
fs.writeFileSync(outputFile, htmlContent, 'utf8');
console.log(`\nSelf-contained HTML file created at: ${outputFile}`);
console.log(`File size: ${(fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2)} MB`);

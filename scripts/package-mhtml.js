import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.resolve(projectRoot, 'dist/public');
const outputFile = path.resolve(projectRoot, 'packaged-app.mhtml');

// Try to build the application but continue even if there are errors
console.log('Building the application...');
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.warn('Build had issues but continuing with packaging:', error.message);
  console.log('Attempting to package whatever was built...');
  // Continue with packaging - don't exit
}

// Install monolith tool if not already installed
try {
  execSync('which monolith', { stdio: 'ignore' });
  console.log('Monolith is already installed.');
} catch (error) {
  console.log('Installing monolith (HTML bundler)...');
  try {
    execSync('npm install -g monolith-bin || npm install -g @rauschma/monolith-cli', { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to install monolith. Trying to continue with npm packages...');
  }
}

// Start a temporary server to serve our built files
console.log('Starting temporary server...');
const serverProcess = require('child_process').spawn(
  'npx', ['http-server', buildDir, '-p', '8080', '--silent'], 
  { detached: true, stdio: 'ignore' }
);

// Give the server some time to start
console.log('Waiting for server to start...');
setTimeout(() => {
  try {
    console.log('Bundling the application as MHTML...');
    // Try using monolith first (preferred method)
    try {
      execSync(`monolith http://localhost:8080 -o "${outputFile}"`, {
        stdio: 'inherit',
        timeout: 30000
      });
    } catch (monolithError) {
      console.log('Monolith failed, trying alternative method...');
      // Fallback to using wget
      try {
        execSync(`wget -E -H -k -p -nH http://localhost:8080/ -O "${outputFile}"`, {
          stdio: 'inherit',
          timeout: 30000
        });
      } catch (wgetError) {
        console.log('wget failed, using custom node bundling...');

        // Custom Node.js bundling similar to bundle-app.js
        const indexPath = path.join(buildDir, 'index.html');
        let htmlContent = fs.readFileSync(indexPath, 'utf8');

        // Find all script tags and inline them
        const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*><\/script>/g;
        let match;
        while ((match = scriptRegex.exec(htmlContent)) !== null) {
          const scriptSrc = match[1];
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
            htmlContent = htmlContent.replace(
              match[0],
              `<style>${cssContent}</style>`
            );
          } catch (err) {
            console.error(`Error reading CSS file: ${cssPath}`, err);
          }
        }

        // Handle images and other assets
        const processedUrls = new Set();
        const imgRegex = /url\(['"]?([^'"]*\.(png|jpg|jpeg|gif|svg|webp))['"]?\)/g;
        while ((match = imgRegex.exec(htmlContent)) !== null) {
          const imgPath = match[1];
          if (processedUrls.has(imgPath)) continue;

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

            const escapedImgSrc = imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const replaceRegex = new RegExp(escapedImgSrc, 'g');
            htmlContent = htmlContent.replace(replaceRegex, dataUrl);
            processedUrls.add(imgSrc);
          } catch (err) {
            console.error(`Error reading image file: ${fullImgPath}`, err);
          }
        }

        // Add MHTML specific headers
        const mhtmlContent = `From: <Saved by Replit>
Subject: =?utf-8?Q?Packaged=20Application?=
Date: ${new Date().toUTCString()}
MIME-Version: 1.0
Content-Type: multipart/related;
	type="text/html";
	boundary="----MultipartBoundary--${Math.random().toString(36).slice(2)}"

------MultipartBoundary--${Math.random().toString(36).slice(2)}
Content-Type: text/html
Content-ID: <frame-0@mhtml.blink>
Content-Transfer-Encoding: quoted-printable
Content-Location: http://localhost:8080/

${htmlContent}

------MultipartBoundary--${Math.random().toString(36).slice(2)}--
`;

        fs.writeFileSync(outputFile, mhtmlContent, 'utf8');
      }
    }

    console.log(`\nMHTML file created at: ${outputFile}`);
    if (fs.existsSync(outputFile)) {
      console.log(`File size: ${(fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2)} MB`);

      // Create an info HTML file
      const infoPath = path.resolve(projectRoot, 'open-mhtml-instructions.html');
      const infoContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How to Open MHTML Files</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1, h2 { color: #333; }
    .steps { margin: 2rem 0; }
    .step { margin-bottom: 1rem; }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9rem;
    }
    .browser {
      background: #eef;
      padding: 1rem;
      border-left: 4px solid #55c;
      margin: 1rem 0;
    }
    .notes {
      background: #fffde7;
      padding: 1rem;
      border-left: 4px solid #ffd600;
      margin: 2rem 0;
    }
  </style>
</head>
<body>
  <h1>How to Open Your MHTML File</h1>

  <p>MHTML (MIME HTML) is a web archive format that combines all resources like JavaScript, CSS, and images into a single file.</p>

  <div class="steps">
    <h2>Opening the MHTML File</h2>

    <div class="browser">
      <h3>Using Chrome or Edge</h3>
      <ol>
        <li>Open Chrome or Edge browser</li>
        <li>Drag and drop the <code>packaged-app.mhtml</code> file directly into the browser window</li>
        <li>Alternatively, use <code>Ctrl+O</code> (or <code>Cmd+O</code> on Mac) to open the file dialog and select your MHTML file</li>
      </ol>
    </div>

    <div class="browser">
      <h3>Using Firefox</h3>
      <ol>
        <li>Firefox may need the UnMHT add-on to open MHTML files</li>
        <li>Install the add-on from <a href="https://addons.mozilla.org/en-US/firefox/addon/unmht/">Firefox Add-ons site</a></li>
        <li>Then open the file through the add-on or by dragging it into the browser</li>
      </ol>
    </div>
  </div>

  <div class="notes">
    <h3>Notes:</h3>
    <p>
      This is a standalone front-end only version. Any server-side functionality (like multiplayer features) 
      will not work in this packaged version.
    </p>
    <p>
      For best results, use a modern Chromium-based browser like Chrome or Edge.
    </p>
  </div>
</body>
</html>`;

      fs.writeFileSync(infoPath, infoContent);
      console.log(`Instructions for opening MHTML created at: ${infoPath}`);
    } else {
      console.error('MHTML file was not created successfully.');
    }
  } catch (err) {
    console.error('Error creating MHTML file:', err);
  } finally {
    // Kill the server process
    console.log('Stopping temporary server...');
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /F /T /PID ${serverProcess.pid}`);
      } catch (e) {
        console.log('Server may have already stopped');
      }
    } else {
      process.kill(-serverProcess.pid);
    }
    serverProcess.unref();
  }
}, 3000); // Wait 3 seconds for server to start
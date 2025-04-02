
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.resolve(projectRoot, 'dist/public');
const outputZip = path.resolve(projectRoot, 'packaged-app.zip');

// First ensure we have archiver installed
try {
  require.resolve('archiver');
} catch (e) {
  console.log('Installing archiver package...');
  execSync('npm install --no-save archiver', { cwd: projectRoot, stdio: 'inherit' });
}

// Build the application
console.log('Building the application...');
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build completed. Creating ZIP package...');

// Create a file to stream archive data to
const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`\nZIP archive created at: ${outputZip}`);
  console.log(`Total size: ${(archive.pointer() / (1024 * 1024)).toFixed(2)} MB`);
  
  // Create a simple HTML file that can be used to extract and run the app
  const launcherPath = path.resolve(projectRoot, 'launch-packaged-app.html');
  const launcherContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Launch Packaged App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #333; }
    .steps { margin: 2rem 0; }
    .step { margin-bottom: 1rem; }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9rem;
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
  <h1>Launch Your Packaged Application</h1>
  
  <p>This HTML file is a companion to the <code>packaged-app.zip</code> file that contains your compiled React application.</p>
  
  <div class="steps">
    <h2>To run your application:</h2>
    
    <div class="step">
      <h3>1. Extract the ZIP file</h3>
      <p>Extract <code>packaged-app.zip</code> to a folder on your computer.</p>
    </div>
    
    <div class="step">
      <h3>2. Open the index.html file</h3>
      <p>Inside the extracted folder, locate the <code>index.html</code> file and open it in a web browser.</p>
    </div>
  </div>
  
  <div class="notes">
    <h3>Note:</h3>
    <p>
      This is a standalone front-end only version. Any server-side functionality (like multiplayer features) 
      will not work in this packaged version.
    </p>
    <p>
      For best results, use a modern browser like Chrome, Firefox, or Edge.
    </p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(launcherPath, launcherContent);
  console.log(`Launcher HTML created at: ${launcherPath}`);
});

// Catch warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the built files to the archive
archive.directory(buildDir, false);

// Create a simple server.js file to serve the app locally
const serverContent = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  
  // If URL is '/', serve index.html
  let filePath = req.url === '/' 
    ? path.join(__dirname, 'index.html') 
    : path.join(__dirname, req.url);
  
  // Get file extension
  const extname = path.extname(filePath);
  
  // Set default content type to text/html
  let contentType = MIME_TYPES[extname] || 'text/html';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found - try to serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(\`Server Error: \${err.code}\`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}/\`);
  console.log('Press Ctrl+C to stop the server');
});
`;

// Add the server.js file to the archive
archive.append(serverContent, { name: 'server.js' });

// Add a README file
const readmeContent = `# Packaged React Application

This ZIP file contains a compiled version of your React application.

## Running the Application

### Option 1: Open directly in a browser
1. Extract this ZIP file
2. Open \`index.html\` in your browser

### Option 2: Use the included Node.js server
1. Extract this ZIP file
2. Install Node.js if you don't have it already (https://nodejs.org/)
3. Open a terminal/command prompt in this folder
4. Run \`node server.js\`
5. Open \`http://localhost:3000\` in your browser

## Notes
- This is a standalone front-end only version
- Any backend functionality will not work in this package
- For a complete experience including server functionality, use the original Replit project
`;

// Add the README file to the archive
archive.append(readmeContent, { name: 'README.md' });

// Add package.json for potential npm installations
const packageJsonContent = `{
  "name": "packaged-react-app",
  "version": "1.0.0",
  "private": true,
  "description": "Packaged React Application",
  "scripts": {
    "start": "node server.js"
  }
}`;

// Add the package.json file to the archive
archive.append(packageJsonContent, { name: 'package.json' });

// Finalize the archive
archive.finalize();

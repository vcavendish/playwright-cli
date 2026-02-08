/**
 * Browsh Renderer for Playwright-CLI
 * 
 * Provides terminal rendering using browsh via Docker.
 * Part of the playwright-browsh integration.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Check if Docker is available
 */
function isDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if browsh Docker image is available
 */
function isBrowshImageAvailable() {
  try {
    const result = execSync('docker images browsh/browsh --format "{{.Repository}}"', { encoding: 'utf8' });
    return result.trim() === 'browsh/browsh';
  } catch {
    return false;
  }
}

/**
 * Pull browsh Docker image
 */
async function pullBrowshImage() {
  return new Promise((resolve, reject) => {
    console.log('📦 Pulling browsh Docker image...');
    const pull = spawn('docker', ['pull', 'browsh/browsh'], { stdio: 'inherit' });
    pull.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Docker pull failed with code ${code}`));
    });
  });
}

/**
 * Render a URL using browsh and capture the output
 * 
 * @param {string} url - URL to render
 * @param {Object} options - Rendering options
 * @param {number} options.timeLimit - Time limit in seconds (default: 10)
 * @param {string} options.outputFile - Optional file to save output
 * @returns {Promise<string>} Rendered terminal output
 */
async function renderWithBrowsh(url, options = {}) {
  const { timeLimit = 10, outputFile = null } = options;

  if (!isDockerAvailable()) {
    throw new Error('Docker is not available. Please install Docker to use browsh rendering.');
  }

  if (!isBrowshImageAvailable()) {
    await pullBrowshImage();
  }

  return new Promise((resolve, reject) => {
    const args = [
      'run', '--rm',
      'browsh/browsh',
      '--startup-url', url,
      '--time-limit', timeLimit.toString()
    ];

    let output = '';
    const browsh = spawn('docker', args);

    browsh.stdout.on('data', data => {
      output += data.toString();
    });

    browsh.stderr.on('data', data => {
      // Browsh outputs some info to stderr, capture it
      output += data.toString();
    });

    browsh.on('close', code => {
      if (outputFile) {
        fs.writeFileSync(outputFile, output, 'utf8');
      }
      resolve(output);
    });

    browsh.on('error', reject);
  });
}

/**
 * Launch browsh interactively in a new terminal window
 * 
 * @param {string} url - URL to open
 * @param {Object} options - Launch options
 */
function launchBrowshInteractive(url, options = {}) {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Use Windows Terminal if available, fall back to pwsh
    const args = [
      'pwsh', '-NoExit', '-Command',
      `docker run -it --rm browsh/browsh --startup-url "${url}"`
    ];
    spawn('wt.exe', args, { detached: true, stdio: 'ignore' }).unref();
  } else {
    // Linux/Mac - try common terminal emulators
    const terminals = [
      ['gnome-terminal', '--', 'docker', 'run', '-it', '--rm', 'browsh/browsh', '--startup-url', url],
      ['xterm', '-e', `docker run -it --rm browsh/browsh --startup-url "${url}"`],
    ];
    
    for (const [cmd, ...args] of terminals) {
      try {
        spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
        return;
      } catch {
        continue;
      }
    }
    console.error('Could not find a terminal emulator. Please run browsh manually.');
  }
}

/**
 * Render URL and print to stdout
 * 
 * @param {string} url - URL to render
 * @param {Object} options - Rendering options
 */
async function printBrowshRender(url, options = {}) {
  const output = await renderWithBrowsh(url, options);
  
  // Clean up the output - remove browsh startup messages
  const lines = output.split('\n');
  const contentStart = lines.findIndex(line => line.includes('http'));
  
  if (contentStart > 0) {
    console.log(lines.slice(contentStart).join('\n'));
  } else {
    console.log(output);
  }
}

/**
 * Render a URL and return structured result
 * 
 * @param {string} url - URL to render
 * @param {Object} options - Rendering options
 * @returns {Promise<{url: string, title: string, content: string}>}
 */
async function renderPage(url, options = {}) {
  const output = await renderWithBrowsh(url, options);
  
  // Parse the output to extract title and URL bar
  const lines = output.split('\n');
  let title = '';
  let pageUrl = url;
  
  for (const line of lines) {
    if (line.includes('|') && !title) {
      title = line.split('|')[0].trim();
    }
    if (line.startsWith('http')) {
      pageUrl = line.trim();
      break;
    }
  }
  
  return {
    url: pageUrl,
    title,
    content: output,
  };
}

module.exports = {
  isDockerAvailable,
  isBrowshImageAvailable,
  pullBrowshImage,
  renderWithBrowsh,
  launchBrowshInteractive,
  printBrowshRender,
  renderPage,
};

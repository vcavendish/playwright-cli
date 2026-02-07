/**
 * ASCII Renderer for Playwright-CLI
 * 
 * Converts screenshots to ASCII art for terminal display.
 * Part of the playwright-browsh integration.
 */

const asciify = require('asciify-image');

// Try to load terminal-image for better quality (ESM module)
let terminalImage = null;

/**
 * Render a screenshot buffer or file path to ASCII art
 * 
 * @param {Buffer|string} input - Screenshot buffer or file path
 * @param {Object} options - Rendering options
 * @param {number} options.width - Output width in characters (default: terminal width)
 * @param {boolean} options.color - Use ANSI colors (default: true)
 * @param {string} options.fit - Fit mode: 'box', 'width', 'height', 'none' (default: 'box')
 * @returns {Promise<string>} ASCII art string
 */
async function renderToAscii(input, options = {}) {
  const defaults = {
    fit: 'width',
    width: Math.min(process.stdout.columns || 120, 150),
    height: Math.floor((process.stdout.rows || 40) * 0.9),
    color: true,
    c_ratio: 2,
  };

  const config = { ...defaults, ...options };

  try {
    const ascii = await asciify(input, config);
    // If format is array, join it; otherwise return as-is
    if (Array.isArray(ascii)) {
      return ascii.join('\n');
    }
    return ascii;
  } catch (err) {
    throw new Error(`Failed to render ASCII: ${err.message}`);
  }
}

/**
 * Render using terminal-image for higher quality (if available)
 * Falls back to asciify if not available
 * 
 * @param {string} filePath - Path to image file
 * @param {Object} options - Rendering options
 * @returns {Promise<string>} Rendered image string
 */
async function renderHighQuality(filePath, options = {}) {
  try {
    // Dynamic import for ESM module
    if (!terminalImage) {
      terminalImage = await import('terminal-image');
    }
    
    const width = options.width || process.stdout.columns || 120;
    const height = options.height || Math.floor((process.stdout.rows || 40) * 0.8);
    
    return await terminalImage.default.file(filePath, {
      width,
      height,
      preserveAspectRatio: true
    });
  } catch (err) {
    // Fallback to asciify
    console.log('(Using basic ASCII renderer)');
    return renderToAscii(filePath, options);
  }
}

/**
 * Render and print directly to stdout
 * 
 * @param {Buffer|string} input - Screenshot buffer or file path
 * @param {Object} options - Rendering options
 */
async function printAscii(input, options = {}) {
  const ascii = await renderToAscii(input, options);
  console.log(ascii);
}

/**
 * Clear terminal and render (for live updates)
 * 
 * @param {Buffer|string} input - Screenshot buffer or file path
 * @param {Object} options - Rendering options
 */
async function renderLive(input, options = {}) {
  // Clear screen and move cursor to top
  process.stdout.write('\x1b[2J\x1b[H');
  await printAscii(input, options);
}

module.exports = {
  renderToAscii,
  renderHighQuality,
  printAscii,
  renderLive,
};

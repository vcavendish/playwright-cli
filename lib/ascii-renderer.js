/**
 * ASCII Renderer for Playwright-CLI
 * 
 * Converts screenshots to ASCII art for terminal display.
 * Part of the playwright-browsh integration.
 */

const asciify = require('asciify-image');

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
    fit: 'box',
    width: Math.min(process.stdout.columns || 80, 120),
    height: Math.floor((process.stdout.rows || 24) * 0.8),
    color: true,
  };

  const config = { ...defaults, ...options };

  try {
    const ascii = await asciify(input, config);
    return ascii;
  } catch (err) {
    throw new Error(`Failed to render ASCII: ${err.message}`);
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
  printAscii,
  renderLive,
};

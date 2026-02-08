/**
 * LIVE DEMO: Single Browser + Terminal Display
 * 
 * This demonstrates:
 * 1. ONE Playwright browser instance
 * 2. Full automation (click, fill, navigate)
 * 3. Screenshot stream to YOUR terminal
 * 
 * You watch the terminal - I control the browser
 */

const { chromium } = require('playwright');
const sharp = require('sharp');

// ASCII character ramp (dark to light)
const ASCII_RAMP = ' .:-=+*#%@';

async function imageToAscii(buffer, width = 80, height = 30) {
  const { data, info } = await sharp(buffer)
    .resize(width, height, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  let ascii = '';
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const pixel = data[y * info.width + x];
      const charIndex = Math.floor((pixel / 255) * (ASCII_RAMP.length - 1));
      ascii += ASCII_RAMP[charIndex];
    }
    ascii += '\n';
  }
  return ascii;
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function printStatus(msg) {
  console.log(`\n\x1b[36m>>> ${msg}\x1b[0m\n`);
}

async function demo() {
  console.log('🎬 LIVE DEMO: Single Browser + Terminal Display');
  console.log('================================================');
  console.log('• ONE browser instance (Playwright Chromium)');
  console.log('• I control it with full automation');
  console.log('• You see screenshots rendered in THIS terminal');
  console.log('• NO duplicate requests - just visual mirroring\n');
  
  // Launch ONE browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  
  const showFrame = async (label) => {
    const screenshot = await page.screenshot({ type: 'png' });
    const ascii = await imageToAscii(screenshot, 100, 35);
    clearScreen();
    console.log(`\x1b[33m[${label}]\x1b[0m`);
    console.log(`URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}`);
    console.log('─'.repeat(100));
    console.log(ascii);
  };

  try {
    // DEMO 1: Navigate to a page
    printStatus('Step 1: Navigating to example.com...');
    await page.goto('https://example.com');
    await showFrame('example.com loaded');
    await sleep(2000);

    // DEMO 2: Navigate to Hacker News
    printStatus('Step 2: Navigating to Hacker News...');
    await page.goto('https://news.ycombinator.com');
    await showFrame('Hacker News loaded');
    await sleep(2000);

    // DEMO 3: Click on a link (first story)
    printStatus('Step 3: Clicking first story link...');
    const firstLink = page.locator('.titleline > a').first();
    const linkText = await firstLink.textContent();
    console.log(`Clicking: "${linkText}"`);
    await firstLink.click();
    await page.waitForLoadState('domcontentloaded');
    await showFrame('Clicked through to story');
    await sleep(2000);

    // DEMO 4: Go back and show it updated
    printStatus('Step 4: Going back...');
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await showFrame('Back on Hacker News');
    await sleep(2000);

    // DEMO 5: Navigate to a form page
    printStatus('Step 5: Navigating to a search page...');
    await page.goto('https://www.google.com');
    await showFrame('Google loaded');
    await sleep(2000);

    // DEMO 6: Fill a form field
    printStatus('Step 6: Typing in search box...');
    const searchBox = page.locator('textarea[name="q"], input[name="q"]').first();
    await searchBox.fill('playwright browser automation');
    await showFrame('Typed search query');
    await sleep(2000);

    // DEMO 7: Submit the form
    printStatus('Step 7: Pressing Enter to search...');
    await searchBox.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await sleep(1000);
    await showFrame('Search results');
    await sleep(3000);

    printStatus('Demo complete! All actions happened in ONE browser.');
    console.log('\n✅ Key points demonstrated:');
    console.log('   • Single browser instance controlled by Playwright');
    console.log('   • Navigation, clicking, form filling all work');
    console.log('   • Screenshots mirror what happened (no duplication)');
    console.log('   • This terminal display is like --headed mode, but in text');

  } finally {
    await browser.close();
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

demo().catch(console.error);

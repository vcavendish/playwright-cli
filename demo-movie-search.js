/**
 * MOVIE SEARCH DEMO - Terminal Display
 * 
 * Searches multiple movie sites and displays results in YOUR terminal
 */

const { chromium } = require('playwright');
const sharp = require('sharp');

const ASCII_RAMP = ' .:-=+*#%@';

async function imageToAscii(buffer, width = 120, height = 40) {
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

async function showFrame(page, label) {
  const screenshot = await page.screenshot({ type: 'png' });
  const ascii = await imageToAscii(screenshot);
  clearScreen();
  console.log('\x1b[36m' + '='.repeat(120) + '\x1b[0m');
  console.log(`\x1b[33m[${label}]\x1b[0m  URL: ${page.url()}`);
  console.log('\x1b[36m' + '='.repeat(120) + '\x1b[0m');
  console.log(ascii);
}

async function searchMovies() {
  console.log('\x1b[35m');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║          🎬 MOVIE SEARCH DEMO - Terminal Visualization 🎬          ║');
  console.log('║                                                                    ║');
  console.log('║  Watch as I search multiple movie sites in ONE browser!            ║');
  console.log('║  • IMDb Top 250                                                    ║');
  console.log('║  • Rotten Tomatoes                                                 ║');
  console.log('║  • TMDB Popular                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\x1b[0m');
  
  await sleep(3000);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    // Search 1: IMDb Top 250
    console.log('\n\x1b[32m>>> Searching IMDb Top 250...\x1b[0m');
    await page.goto('https://www.imdb.com/chart/top/', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await showFrame(page, 'IMDb Top 250 Movies');
    
    // Extract some movie titles
    const imdbMovies = await page.locator('h3.ipc-title__text').allTextContents();
    console.log('\n\x1b[33mTop 5 from IMDb:\x1b[0m');
    imdbMovies.slice(0, 5).forEach(m => console.log(`  • ${m}`));
    await sleep(3000);

    // Search 2: Rotten Tomatoes
    console.log('\n\x1b[32m>>> Navigating to Rotten Tomatoes...\x1b[0m');
    await page.goto('https://www.rottentomatoes.com/browse/movies_at_home/sort:popular', { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await showFrame(page, 'Rotten Tomatoes - Popular Movies');
    await sleep(3000);

    // Search 3: TMDB
    console.log('\n\x1b[32m>>> Navigating to TMDB Popular...\x1b[0m');
    await page.goto('https://www.themoviedb.org/movie', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await showFrame(page, 'TMDB - Popular Movies');
    
    // Extract TMDB movies
    const tmdbMovies = await page.locator('.card h2').allTextContents();
    console.log('\n\x1b[33mPopular on TMDB:\x1b[0m');
    tmdbMovies.slice(0, 5).forEach(m => console.log(`  • ${m}`));
    await sleep(3000);

    // Click on a movie
    console.log('\n\x1b[32m>>> Clicking on first movie for details...\x1b[0m');
    await page.locator('.card a').first().click();
    await page.waitForLoadState('domcontentloaded');
    await sleep(2000);
    await showFrame(page, 'Movie Details Page');
    
    const title = await page.title();
    console.log(`\n\x1b[33mViewing: ${title}\x1b[0m`);
    await sleep(3000);

    // Final summary
    clearScreen();
    console.log('\x1b[35m');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🎬 DEMO COMPLETE! 🎬                            ║');
    console.log('╠════════════════════════════════════════════════════════════════════╣');
    console.log('║                                                                    ║');
    console.log('║  ✅ Searched IMDb, Rotten Tomatoes, TMDB                          ║');
    console.log('║  ✅ All in ONE browser instance                                   ║');
    console.log('║  ✅ You saw live terminal visualization                           ║');
    console.log('║  ✅ Clicked links, navigated pages                                ║');
    console.log('║  ✅ No duplicate requests - just visual mirroring                 ║');
    console.log('║                                                                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('\x1b[0m');

  } finally {
    await browser.close();
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

searchMovies().catch(console.error);

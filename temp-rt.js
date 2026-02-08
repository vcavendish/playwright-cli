const { chromium } = require('playwright');

(async () => {
  console.log('🍅 Automating Rotten Tomatoes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.rottentomatoes.com/browse/movies_at_home/sort:popular', { waitUntil: 'domcontentloaded' });
  console.log('📄 Page loaded:', await page.title());
  
  await page.waitForTimeout(3000);
  
  // Get movie info from tiles
  const tiles = await page.locator('a[data-track="scores"]').all();
  console.log('\n🎬 Popular Movies at Home:');
  
  for (let i = 0; i < Math.min(8, tiles.length); i++) {
    const text = await tiles[i].textContent();
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      console.log('  ' + (i+1) + '. ' + lines.slice(0, 2).join(' - '));
    }
  }
  
  await browser.close();
  console.log('\n✅ RT done!');
})();

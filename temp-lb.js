const { chromium } = require('playwright');

(async () => {
  console.log('📽️ Automating Letterboxd...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://letterboxd.com/films/popular/', { waitUntil: 'domcontentloaded' });
  console.log('📄 Page loaded:', await page.title());
  
  await page.waitForTimeout(2000);
  
  // Get film posters with alt text (film titles)
  const films = await page.locator('.poster-container .image').allTextContents();
  const filmLinks = await page.locator('.poster-container a').evaluateAll(els => 
    els.map(el => el.getAttribute('data-film-name') || el.querySelector('img')?.alt || 'Unknown')
  );
  
  console.log('\n🎬 Popular Films on Letterboxd:');
  filmLinks.slice(0, 10).forEach((f, i) => {
    if (f && f !== 'Unknown') console.log('  ' + (i+1) + '. ' + f);
  });
  
  await browser.close();
  console.log('\n✅ Letterboxd done!');
})();

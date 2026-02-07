#!/usr/bin/env node
/**
 * Test browsh integration with playwright-cli
 * 
 * This demonstrates the concept:
 * 1. Playwright automates the browser
 * 2. Browsh renders the same URL for visual display
 */

const { spawn } = require('child_process');
const { chromium } = require('playwright');

async function testBrowshIntegration(url = 'https://example.com') {
  console.log(`\n🎭 Playwright + Browsh Integration Test`);
  console.log(`📍 URL: ${url}\n`);

  // Start browsh in a separate terminal for display
  console.log('🖥️  Launching browsh display...');
  const browsh = spawn('wt.exe', [
    'pwsh', '-NoExit', '-Command',
    `docker run -it --rm browsh/browsh --startup-url "${url}"`
  ], { detached: true, stdio: 'ignore' });
  browsh.unref();

  // Give browsh a moment to start
  await new Promise(r => setTimeout(r, 2000));

  // Meanwhile, Playwright can automate
  console.log('🎭 Playwright automating...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Get some info from the page
    const links = await page.locator('a').count();
    console.log(`🔗 Found ${links} links on page`);
    
    // Take a snapshot (playwright-cli style)
    const snapshot = await page.accessibility.snapshot();
    console.log(`📸 Accessibility snapshot has ${snapshot?.children?.length || 0} top-level nodes`);
    
    console.log('\n✅ Playwright automation complete!');
    console.log('👀 Check the browsh window for visual rendering');
    
  } finally {
    await browser.close();
  }
}

// Run test
const url = process.argv[2] || 'https://example.com';
testBrowshIntegration(url).catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});

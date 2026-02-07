#!/usr/bin/env node
/**
 * Test script for ASCII renderer
 * 
 * Usage: node test-ascii.js [url]
 */

const { renderToAscii, renderHighQuality, printAscii } = require('./lib/ascii-renderer');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testWithScreenshot(url = 'https://example.com') {
  console.log(`\n🌐 Testing ASCII render for: ${url}\n`);
  
  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  try {
    // Navigate and take screenshot
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const screenshotPath = path.join(__dirname, 'test-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    
    console.log('📸 Screenshot captured, converting to ASCII...\n');
    
    // Render to ASCII with color
    await printAscii(screenshotPath, {
      width: 120,
      color: true,
      fit: 'width'
    });
    
    // Cleanup
    fs.unlinkSync(screenshotPath);
    console.log('\n✅ Test complete!');
    
  } finally {
    await browser.close();
  }
}

// Run test
const url = process.argv[2] || 'https://example.com';
testWithScreenshot(url).catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});

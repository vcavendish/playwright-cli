#!/usr/bin/env node
/**
 * Playwright + Browsh Integration
 * 
 * Playwright controls automation, Browsh provides visual display.
 * Like --headed mode, but renders in terminal instead of GUI.
 * 
 * Usage:
 *   node playwright-with-browsh.js <url> [actions...]
 * 
 * Example:
 *   node playwright-with-browsh.js https://example.com
 *   node playwright-with-browsh.js https://github.com click:e5 type:"hello"
 */

const { spawn } = require('child_process');
const { chromium } = require('playwright');
const readline = require('readline');

async function main() {
  const url = process.argv[2] || 'https://example.com';
  
  console.log('🎭 Playwright + Browsh Integration\n');
  console.log('─'.repeat(50));
  console.log(`📍 URL: ${url}`);
  console.log('─'.repeat(50));
  
  // 1. Launch browsh in a visible terminal for the USER to watch
  console.log('\n🖥️  Launching browsh display (visible to you)...');
  const browshProcess = spawn('wt.exe', [
    'pwsh', '-NoExit', '-Command',
    `Write-Host '🌐 Browsh Display - Watch automation here!' -ForegroundColor Cyan; docker run -it --rm browsh/browsh --startup-url "${url}"`
  ], { detached: true, stdio: 'ignore' });
  browshProcess.unref();
  
  // Give browsh time to start
  await sleep(3000);
  
  // 2. Launch Playwright (headless) - I control this
  console.log('🎭 Launching Playwright automation...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log(`📄 Page loaded: ${title}`);
    
    // Interactive REPL for automation
    console.log('\n' + '─'.repeat(50));
    console.log('🎮 Interactive Mode - Commands:');
    console.log('   goto <url>     - Navigate to URL');
    console.log('   click <ref>    - Click element');
    console.log('   type <text>    - Type text');
    console.log('   snapshot       - Show accessibility snapshot');
    console.log('   sync           - Sync browsh to current URL');
    console.log('   quit           - Exit');
    console.log('─'.repeat(50) + '\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'playwright> '
    });
    
    rl.prompt();
    
    rl.on('line', async (line) => {
      const [cmd, ...args] = line.trim().split(' ');
      const arg = args.join(' ');
      
      try {
        switch (cmd) {
          case 'goto':
            console.log(`  Navigating to ${arg}...`);
            await page.goto(arg, { waitUntil: 'domcontentloaded' });
            console.log(`  ✅ Loaded: ${await page.title()}`);
            console.log(`  💡 Run 'sync' to update browsh display`);
            break;
            
          case 'click':
            console.log(`  Clicking ${arg}...`);
            // Try to find element by various methods
            try {
              await page.click(`[data-ref="${arg}"]`, { timeout: 2000 });
            } catch {
              await page.click(arg);
            }
            console.log(`  ✅ Clicked`);
            break;
            
          case 'type':
            console.log(`  Typing: ${arg}`);
            await page.keyboard.type(arg);
            console.log(`  ✅ Typed`);
            break;
            
          case 'snapshot':
            const snap = await page.accessibility.snapshot();
            console.log('  📸 Accessibility Snapshot:');
            console.log(JSON.stringify(snap, null, 2).slice(0, 1000) + '...');
            break;
            
          case 'sync':
            const currentUrl = page.url();
            console.log(`  🔄 Syncing browsh to: ${currentUrl}`);
            // Launch new browsh with current URL
            spawn('wt.exe', [
              'pwsh', '-NoExit', '-Command',
              `docker run -it --rm browsh/browsh --startup-url "${currentUrl}"`
            ], { detached: true, stdio: 'ignore' }).unref();
            console.log(`  ✅ New browsh window opened`);
            break;
            
          case 'url':
            console.log(`  📍 Current URL: ${page.url()}`);
            break;
            
          case 'title':
            console.log(`  📄 Title: ${await page.title()}`);
            break;
            
          case 'quit':
          case 'exit':
            console.log('  👋 Closing browser...');
            await browser.close();
            rl.close();
            process.exit(0);
            break;
            
          case '':
            break;
            
          default:
            console.log(`  ❓ Unknown command: ${cmd}`);
            console.log(`     Try: goto, click, type, snapshot, sync, quit`);
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
      }
      
      rl.prompt();
    });
    
    rl.on('close', async () => {
      await browser.close();
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await browser.close();
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);

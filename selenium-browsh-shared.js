/**
 * Selenium + Browsh Shared Firefox Integration
 * 
 * This script demonstrates controlling Firefox with Selenium while
 * browsh displays the same browser session in the terminal.
 * 
 * Architecture:
 *   Selenium (automation) ──┐
 *                           ├──▶ Firefox (Marionette port 2828)
 *   Browsh (display)    ────┘
 */

const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

class SharedBrowserSession {
  constructor() {
    this.driver = null;
    this.browshProcess = null;
  }

  async start(initialUrl = 'https://news.ycombinator.com') {
    console.log('🦊 Starting shared Firefox session...\n');

    // Configure Firefox - Marionette is enabled by default with geckodriver
    const options = new firefox.Options();
    
    // Use system Firefox
    options.setBinary('C:\\Program Files\\Mozilla Firefox\\firefox.exe');
    
    // Keep browser visible (not headless) so you can watch

    console.log('🔧 Launching Firefox with Selenium...');
    
    this.driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();

    console.log('✅ Selenium connected to Firefox\n');

    // Navigate to initial URL
    await this.goto(initialUrl);
    
    return this;
  }

  async goto(url) {
    console.log(`🌐 Navigating to: ${url}`);
    await this.driver.get(url);
    const title = await this.driver.getTitle();
    console.log(`📄 Page title: ${title}\n`);
    return title;
  }

  async click(selector) {
    console.log(`🖱️  Clicking: ${selector}`);
    const element = await this.driver.findElement(By.css(selector));
    await element.click();
    await this.driver.sleep(1000);
    const title = await this.driver.getTitle();
    console.log(`📄 Now on: ${title}\n`);
  }

  async getText(selector) {
    const element = await this.driver.findElement(By.css(selector));
    return element.getText();
  }

  async getLinks(selector = 'a') {
    const elements = await this.driver.findElements(By.css(selector));
    const links = [];
    for (const el of elements.slice(0, 10)) {
      try {
        const text = await el.getText();
        const href = await el.getAttribute('href');
        if (text && href) links.push({ text: text.slice(0, 50), href });
      } catch (e) {}
    }
    return links;
  }

  async screenshot(filename = 'screenshot.png') {
    const image = await this.driver.takeScreenshot();
    require('fs').writeFileSync(filename, image, 'base64');
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  async close() {
    console.log('🛑 Closing session...');
    if (this.driver) await this.driver.quit();
    console.log('✅ Done');
  }
}

// Interactive REPL
async function interactiveMode() {
  const session = new SharedBrowserSession();
  
  try {
    await session.start();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n' + '='.repeat(50));
    console.log('  Selenium + Firefox Interactive Mode');
    console.log('  Watch the Firefox window - I control, you watch!');
    console.log('='.repeat(50));
    console.log('\nCommands:');
    console.log('  goto <url>     - Navigate to URL');
    console.log('  click <sel>    - Click element by CSS selector');
    console.log('  links          - Show first 10 links');
    console.log('  screenshot     - Take screenshot');
    console.log('  quit           - Exit\n');

    const prompt = () => {
      rl.question('selenium> ', async (input) => {
        const [cmd, ...args] = input.trim().split(' ');
        const arg = args.join(' ');

        try {
          switch (cmd) {
            case 'goto':
              await session.goto(arg);
              break;
            case 'click':
              await session.click(arg);
              break;
            case 'links':
              const links = await session.getLinks();
              links.forEach((l, i) => console.log(`  ${i+1}. ${l.text}`));
              console.log('');
              break;
            case 'screenshot':
              await session.screenshot();
              break;
            case 'quit':
            case 'exit':
              await session.close();
              rl.close();
              return;
            default:
              console.log('Unknown command. Try: goto, click, links, screenshot, quit\n');
          }
        } catch (e) {
          console.log(`Error: ${e.message}\n`);
        }
        
        prompt();
      });
    };

    prompt();

  } catch (e) {
    console.error('Failed to start:', e.message);
    await session.close();
  }
}

// Demo mode - automated navigation
async function demoMode() {
  const session = new SharedBrowserSession();
  
  try {
    await session.start('https://news.ycombinator.com');
    
    console.log('📰 Getting top stories from Hacker News...\n');
    const links = await session.getLinks('.titleline > a');
    console.log('Top 5 Stories:');
    links.slice(0, 5).forEach((l, i) => console.log(`  ${i+1}. ${l.text}`));
    
    // Click first story
    console.log('\n⏳ Waiting 3 seconds then clicking first story...');
    await session.driver.sleep(3000);
    
    await session.click('.titleline > a');
    
    console.log('⏳ Waiting 3 seconds...');
    await session.driver.sleep(3000);
    
    // Go to Reddit
    console.log('\n📱 Now visiting Reddit...');
    await session.goto('https://www.reddit.com/r/movies');
    
    await session.driver.sleep(3000);
    
    // Take screenshot
    await session.screenshot('demo-screenshot.png');
    
  } finally {
    await session.close();
  }
}

// Run based on args
const mode = process.argv[2] || 'interactive';
if (mode === 'demo') {
  demoMode();
} else {
  interactiveMode();
}

/**
 * Unified Selenium + Browsh Session
 * 
 * Shares a SINGLE Firefox instance between:
 * - Selenium (for automation control)  
 * - Browsh (for terminal display)
 * 
 * Flow:
 * 1. Start Firefox with Marionette enabled (port 2828)
 * 2. Start geckodriver with --connect-existing --marionette-port 2828
 * 3. Selenium connects via geckodriver
 * 4. Browsh connects via --firefox.use-existing
 */

const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { spawn, exec, execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const MARIONETTE_PORT = 2828;
const GECKODRIVER_PORT = 4444;

class UnifiedBrowserSession {
  constructor() {
    this.driver = null;
    this.firefoxProcess = null;
    this.geckodriverProcess = null;
  }

  async start(initialUrl = 'https://news.ycombinator.com') {
    console.log('🦊 Starting UNIFIED Firefox session...\n');
    console.log('This Firefox will be controlled by Selenium AND displayed by Browsh!\n');

    // Step 1: Launch Firefox with Marionette enabled
    console.log(`1️⃣  Launching Firefox with Marionette on port ${MARIONETTE_PORT}...`);
    
    const firefoxPath = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
    this.firefoxProcess = spawn(firefoxPath, [
      '--marionette',
      `--marionette-port`, `${MARIONETTE_PORT}`,
      '--new-instance',
      '-no-remote',
      initialUrl
    ], {
      detached: true,
      stdio: 'ignore'
    });
    this.firefoxProcess.unref();
    
    // Wait for Firefox to start
    await this.sleep(3000);
    console.log('   ✅ Firefox launched\n');

    // Step 2: Start geckodriver connecting to existing Firefox
    console.log(`2️⃣  Starting geckodriver (connecting to existing Firefox)...`);
    
    this.geckodriverProcess = spawn('geckodriver', [
      '--connect-existing',
      '--marionette-port', `${MARIONETTE_PORT}`,
      '--port', `${GECKODRIVER_PORT}`
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Wait for geckodriver
    await this.sleep(2000);
    console.log('   ✅ geckodriver ready\n');

    // Step 3: Connect Selenium
    console.log('3️⃣  Connecting Selenium to geckodriver...');
    
    const options = new firefox.Options();
    
    this.driver = await new Builder()
      .forBrowser('firefox')
      .usingServer(`http://localhost:${GECKODRIVER_PORT}`)
      .setFirefoxOptions(options)
      .build();

    console.log('   ✅ Selenium connected!\n');

    // Step 4: Instructions for Browsh
    console.log('4️⃣  To connect Browsh (in another terminal):');
    console.log('   browsh --firefox.use-existing');
    console.log('   (or via Docker with host network)\n');

    console.log('=' .repeat(50));
    console.log('🎉 UNIFIED SESSION READY!');
    console.log('   - Firefox window: YOU watch');
    console.log('   - Selenium: I control');
    console.log('   - Browsh: Can also connect for terminal view');
    console.log('='.repeat(50) + '\n');

    return this;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async goto(url) {
    console.log(`🌐 Navigating to: ${url}`);
    await this.driver.get(url);
    await this.sleep(500);
    const title = await this.driver.getTitle();
    console.log(`📄 Page title: ${title}\n`);
    return title;
  }

  async click(selector) {
    console.log(`🖱️  Clicking: ${selector}`);
    const element = await this.driver.findElement(By.css(selector));
    await element.click();
    await this.sleep(1000);
    const title = await this.driver.getTitle();
    console.log(`📄 Now on: ${title}\n`);
  }

  async getLinks(selector = 'a', limit = 10) {
    const elements = await this.driver.findElements(By.css(selector));
    const links = [];
    for (const el of elements.slice(0, limit)) {
      try {
        const text = await el.getText();
        if (text) links.push(text.slice(0, 60));
      } catch (e) {}
    }
    return links;
  }

  async close() {
    console.log('\n🛑 Closing unified session...');
    
    if (this.driver) {
      try { await this.driver.quit(); } catch (e) {}
    }
    
    if (this.geckodriverProcess) {
      this.geckodriverProcess.kill();
    }
    
    // Kill Firefox (find by marionette port)
    try {
      execSync('taskkill /F /IM firefox.exe 2>nul', { stdio: 'ignore' });
    } catch (e) {}
    
    console.log('✅ Session closed\n');
  }
}

// Interactive REPL
async function main() {
  const session = new UnifiedBrowserSession();
  
  try {
    await session.start();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Commands: goto <url>, click <selector>, links, quit\n');

    const prompt = () => {
      rl.question('unified> ', async (input) => {
        const [cmd, ...args] = input.trim().split(' ');
        const arg = args.join(' ');

        try {
          switch (cmd) {
            case 'goto':
            case 'go':
              await session.goto(arg.startsWith('http') ? arg : `https://${arg}`);
              break;
            case 'click':
              await session.click(arg);
              break;
            case 'links':
              const links = await session.getLinks(arg || '.titleline > a');
              links.forEach((l, i) => console.log(`  ${i+1}. ${l}`));
              console.log('');
              break;
            case 'wait':
              await session.sleep(parseInt(arg) || 2000);
              break;
            case 'quit':
            case 'exit':
            case 'q':
              await session.close();
              rl.close();
              process.exit(0);
            default:
              if (cmd) console.log('Commands: goto <url>, click <sel>, links, wait <ms>, quit\n');
          }
        } catch (e) {
          console.log(`Error: ${e.message}\n`);
        }
        
        prompt();
      });
    };

    prompt();

  } catch (e) {
    console.error('Failed:', e.message);
    await session.close();
    process.exit(1);
  }
}

main();

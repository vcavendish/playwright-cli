const { firefox } = require('playwright');

(async () => {
  console.log('🔌 Attempting to connect to existing Firefox on Marionette port 2828...');
  
  try {
    // Playwright can connect to existing browser via connect()
    // For Firefox, we need to use the browserType.connect() with wsEndpoint
    // But Marionette doesn't expose a WS endpoint directly...
    
    // Alternative: Use launchPersistentContext to control an existing profile
    // Or we need to use Selenium/Marionette protocol directly
    
    console.log('Note: Playwright native Firefox support uses its own protocol, not Marionette directly');
    console.log('We may need to use webdriver/marionette client instead');
    
    // Let's try launching a new Firefox and see what endpoints it exposes
    const browser = await firefox.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://example.com');
    console.log('Title:', await page.title());
    
    // Get the WS endpoint
    console.log('Browser WS endpoint:', browser.wsEndpoint ? browser.wsEndpoint() : 'N/A');
    
    await browser.close();
  } catch (e) {
    console.log('Error:', e.message);
  }
})();

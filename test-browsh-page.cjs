// Phase 4 test: BrowshPage interface verification
const { BrowshContextFactory } = require('./src/browsh-context-factory');

(async () => {
  const factory = new BrowshContextFactory({ browser: {} });
  const { browserContext, close } = await factory.createContext({}, null, {});
  const page = browserContext.pages()[0];
  let passed = 0, failed = 0;

  function check(label, condition, detail) {
    if (condition) { console.log('  PASS  ' + label); passed++; }
    else { console.log('  FAIL  ' + label + (detail ? ': ' + detail : '')); failed++; }
  }

  console.log('=== Phase 4: BrowshPage Interface Test ===\n');

  // goto + url
  await page.goto('https://example.com');
  check('goto + url()', page.url().includes('example.com'), page.url());

  // title
  const title = await page.title();
  check('title()', title === 'Example Domain', title);

  // evaluate
  const h1 = await page.evaluate('document.querySelector("h1").textContent');
  check('evaluate()', h1 === 'Example Domain', h1);

  // _snapshotForAI
  const snap = await page._snapshotForAI({ track: 'response' });
  check('_snapshotForAI() returns full', typeof snap.full === 'string' && snap.full.length > 0);
  check('snapshot has heading', snap.full.includes('heading "Example Domain"'));
  check('snapshot has link', snap.full.includes('link "Learn more"'));
  check('snapshot has ref', snap.full.includes('[ref=e'));

  // refMap populated
  check('refMap populated', Object.keys(page._refMap).length > 0,
    Object.keys(page._refMap).length + ' refs');

  // locator + _resolveSelector
  const loc = page.locator('aria-ref=e6');
  const resolved = await loc._resolveSelector();
  check('locator._resolveSelector()', resolved.resolvedSelector.includes('getByRole'),
    resolved.resolvedSelector);

  // locator.describe (chainable)
  const described = loc.describe('Learn more link');
  check('locator.describe() chainable', described === loc);

  // locator.click navigates
  await loc.click();
  await new Promise(r => setTimeout(r, 2000));
  const newTitle = await page.title();
  check('locator.click() navigates', page.url().includes('iana.org'), page.url());

  // waitForLoadState (should not throw)
  await page.waitForLoadState('load');
  check('waitForLoadState() no-throw', true);

  // setDefaultNavigationTimeout
  page.setDefaultNavigationTimeout(30000);
  check('setDefaultNavigationTimeout()', page._navTimeout === 30000);

  // setDefaultTimeout
  page.setDefaultTimeout(3000);
  check('setDefaultTimeout()', page._actionTimeout === 3000);

  // bringToFront (no-op, should not throw)
  await page.bringToFront();
  check('bringToFront() no-throw', true);

  // Event emitter
  let closeFired = false;
  page.on('close', () => { closeFired = true; });
  check('EventEmitter.on()', typeof page.on === 'function');

  // BrowserContext interface
  check('browserContext.pages()', browserContext.pages().length === 1);
  check('browserContext._setAllowedProtocols', typeof browserContext._setAllowedProtocols === 'function');
  check('browserContext._setAllowedDirectories', typeof browserContext._setAllowedDirectories === 'function');

  // close
  await close();
  check('close() clean', true);

  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

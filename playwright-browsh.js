#!/usr/bin/env node
/**
 * Playwright-CLI with Browsh Terminal Display
 * 
 * This wraps playwright-cli commands with optional browsh rendering.
 * 
 * Usage:
 *   playwright-browsh open https://example.com          # Opens in browsh
 *   playwright-browsh snapshot https://example.com      # Shows browsh render
 *   playwright-browsh --interactive https://example.com # Interactive browsh
 */

const { renderWithBrowsh, launchBrowshInteractive, renderPage } = require('./lib/browsh-renderer');
const { spawn } = require('child_process');

const args = process.argv.slice(2);

// Parse flags
const flags = {
  interactive: args.includes('--interactive') || args.includes('-i'),
  help: args.includes('--help') || args.includes('-h'),
  timeLimit: 15,
};

// Extract time limit if specified
const timeLimitIdx = args.findIndex(a => a.startsWith('--time-limit='));
if (timeLimitIdx >= 0) {
  flags.timeLimit = parseInt(args[timeLimitIdx].split('=')[1]) || 15;
}

// Get command and URL
const cleanArgs = args.filter(a => !a.startsWith('-'));
const command = cleanArgs[0];
const url = cleanArgs[1] || 'https://example.com';

async function main() {
  if (flags.help || !command) {
    console.log(`
Playwright-CLI with Browsh Terminal Display

Usage:
  playwright-browsh <command> [url] [options]

Commands:
  open <url>        Open URL and render in terminal
  snapshot <url>    Capture and display terminal snapshot
  interactive <url> Launch interactive browsh session

Options:
  -i, --interactive  Launch interactive browsh window
  --time-limit=N     Set capture time limit (default: 15s)
  -h, --help         Show this help

Examples:
  playwright-browsh open https://news.ycombinator.com
  playwright-browsh snapshot https://github.com --time-limit=20
  playwright-browsh interactive https://example.com
`);
    return;
  }

  console.log(`🌐 Playwright-Browsh: ${command} ${url}\n`);

  switch (command) {
    case 'open':
    case 'snapshot':
      if (flags.interactive) {
        console.log('🖥️  Launching interactive browsh...');
        launchBrowshInteractive(url);
        console.log('✅ Browsh launched in new terminal window');
      } else {
        console.log(`📸 Capturing terminal snapshot (${flags.timeLimit}s)...`);
        try {
          const result = await renderPage(url, { timeLimit: flags.timeLimit });
          console.log(`\n📄 Title: ${result.title}`);
          console.log(`🔗 URL: ${result.url}\n`);
          console.log('─'.repeat(80));
          console.log(result.content);
          console.log('─'.repeat(80));
        } catch (err) {
          console.error(`❌ Error: ${err.message}`);
          process.exit(1);
        }
      }
      break;

    case 'interactive':
      console.log('🖥️  Launching interactive browsh...');
      launchBrowshInteractive(url);
      console.log('✅ Browsh launched in new terminal window');
      console.log('   Use Ctrl+L to enter URLs, Ctrl+Q to quit');
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

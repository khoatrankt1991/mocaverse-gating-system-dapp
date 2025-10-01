#!/usr/bin/env node
/**
 * Clean local D1 database
 * Run: npx tsx scripts/clean-db.ts
 */

import { BASE_URL, log } from './test-helpers';

async function cleanDatabase() {
  log('\n🧹 Cleaning local database...', 'cyan');
  
  try {
    // Note: D1 doesn't have a direct API to truncate tables from outside
    // Best approach: Delete .wrangler/state directory and re-run migrations
    
    log('To clean local database:', 'yellow');
    log('1. Stop dev server (Ctrl+C)', 'yellow');
    log('2. Run: rm -rf .wrangler/state', 'yellow');
    log('3. Run: npm run db:migrate:local', 'yellow');
    log('4. Start dev server: npm run dev', 'yellow');
    
    log('\nOr just restart dev server - local D1 persists data.', 'cyan');
    log('Tests use random emails so conflicts are unlikely.\n', 'cyan');
    
  } catch (error) {
    log('Error:', 'red');
    console.error(error);
  }
}

cleanDatabase();


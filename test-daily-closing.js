#!/usr/bin/env node

/**
 * Test Script for Daily Closing System
 * Verifies that all components are working correctly
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log('='.repeat(60));
console.log('DAILY CLOSING SYSTEM - TEST SCRIPT');
console.log('='.repeat(60));
console.log('');

let testsPassed = 0;
let testsFailed = 0;

function pass(message) {
  console.log(`✓ ${message}`);
  testsPassed++;
}

function fail(message) {
  console.log(`✗ ${message}`);
  testsFailed++;
}

function info(message) {
  console.log(`ℹ ${message}`);
}

async function runTests() {
  // Test 1: Check environment variables
  console.log('Test 1: Environment Variables');
  if (process.env.MONGODB_URI) {
    pass('MONGODB_URI is set');
  } else {
    fail('MONGODB_URI is not set in .env file');
  }
  console.log('');

  // Test 2: Check required files
  console.log('Test 2: Required Files');
  const requiredFiles = [
    'server/dailyClosingService.js',
    'server/cronJob.js',
    'setup-cron.sh',
    '.env'
  ];

  for (const file of requiredFiles) {
    const filePath = join(__dirname, file);
    if (fs.existsSync(filePath)) {
      pass(`${file} exists`);
    } else {
      fail(`${file} is missing`);
    }
  }
  console.log('');

  // Test 3: Check logs directory
  console.log('Test 3: Logs Directory');
  const logsDir = join(__dirname, 'logs');
  if (fs.existsSync(logsDir)) {
    pass('logs/ directory exists');
  } else {
    fail('logs/ directory is missing');
    info('Run: mkdir logs');
  }
  console.log('');

  // Test 4: MongoDB connection
  console.log('Test 4: MongoDB Connection');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    pass('Successfully connected to MongoDB');
    
    // Test 4.1: Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['branches', 'employees', 'dailysaleshistories'];
    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        pass(`Collection '${collection}' exists`);
      } else {
        fail(`Collection '${collection}' is missing`);
      }
    }
    
    await mongoose.disconnect();
    pass('Successfully disconnected from MongoDB');
  } catch (error) {
    fail(`MongoDB connection failed: ${error.message}`);
  }
  console.log('');

  // Test 5: Check CRON job
  console.log('Test 5: CRON Job');
  try {
    const { execSync } = await import('child_process');
    const crontab = execSync('crontab -l 2>/dev/null || echo ""', { encoding: 'utf-8' });
    
    if (crontab.includes('cronJob.js')) {
      pass('CRON job is configured');
      info('CRON entry found:');
      const cronLine = crontab.split('\n').find(line => line.includes('cronJob.js'));
      console.log(`  ${cronLine}`);
    } else {
      fail('CRON job is not configured');
      info('Run: npm run setup-cron');
    }
  } catch (error) {
    fail(`Could not check CRON job: ${error.message}`);
    info('This is normal on Windows. CRON is only for Linux/Mac.');
  }
  console.log('');

  // Test 6: Check Node.js version
  console.log('Test 6: Node.js Version');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 14) {
    pass(`Node.js version ${nodeVersion} is compatible`);
  } else {
    fail(`Node.js version ${nodeVersion} is too old (need v14+)`);
  }
  console.log('');

  // Test 7: Check package.json scripts
  console.log('Test 7: NPM Scripts');
  const packageJson = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  const requiredScripts = ['close-day', 'close-day:date', 'setup-cron', 'logs'];
  
  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      pass(`Script '${script}' is defined`);
    } else {
      fail(`Script '${script}' is missing`);
    }
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log('');

  if (testsFailed === 0) {
    console.log('🎉 All tests passed! The system is ready to use.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Setup CRON: npm run setup-cron');
    console.log('2. Test manually: npm run close-day');
    console.log('3. View logs: npm run logs');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues above.');
    console.log('');
    console.log('Common fixes:');
    console.log('- Missing files: Re-run the setup');
    console.log('- MongoDB connection: Check .env file');
    console.log('- CRON job: Run npm run setup-cron');
  }
  console.log('='.repeat(60));

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

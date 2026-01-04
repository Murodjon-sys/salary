#!/usr/bin/env node

/**
 * Test script for auto-closing functionality
 * Tests if the server can close daily data
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('='.repeat(60));
console.log('TESTING AUTO-CLOSE FUNCTIONALITY');
console.log('='.repeat(60));
console.log('');

const API_URL = `http://localhost:${process.env.PORT || 3010}/api/salary/close-day`;

console.log(`API URL: ${API_URL}`);
console.log('');

// Test API endpoint
async function testAutoClose() {
  try {
    console.log('Sending request to close today\'s data...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    console.log('');
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.ok && data.success) {
      console.log('✓ SUCCESS: Daily closing worked!');
      console.log(`  - Date: ${data.date}`);
      console.log(`  - Branches: ${data.branchesProcessed}`);
      console.log(`  - Employees: ${data.employeesProcessed}`);
      console.log(`  - Total Salary: ${data.totalSalaryAmount?.toFixed(2) || 0}`);
      console.log(`  - Total Penalty: ${data.totalPenaltyAmount?.toFixed(2) || 0}`);
    } else {
      console.log('✗ FAILED: Daily closing failed');
      console.log(`  Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('✗ ERROR: Could not connect to server');
    console.error(`  ${error.message}`);
    console.log('');
    console.log('Make sure the server is running:');
    console.log('  npm start');
  }
}

testAutoClose();

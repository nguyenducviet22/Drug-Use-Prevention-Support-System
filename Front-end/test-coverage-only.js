#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Tìm tất cả test files
function findTestFiles() {
  const testFiles = [];
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.test.jsx') || file.endsWith('.test.js')) {
        // Tìm source file tương ứng
        const sourcePath = fullPath
          .replace('.test.jsx', '.jsx')
          .replace('.test.js', '.js')
          .replace('/__tests__/', '/');
        
        if (fs.existsSync(sourcePath)) {
          testFiles.push(sourcePath);
        }
      }
    });
  }
  
  scanDir('./src');
  return testFiles;
}

const testedFiles = findTestFiles();

if (testedFiles.length === 0) {
  console.log('❌ Không tìm thấy file nào đã có test!');
  process.exit(1);
}

console.log('🎯 Files đã có test:');
testedFiles.forEach(file => console.log(`  ✅ ${file}`));

// Chạy Jest với chỉ những files đã test
const filesArg = testedFiles.map(f => `--collectCoverageOnlyFrom=${f}`).join(' ');
const command = `npx jest --coverage ${filesArg}`;

console.log('\n🚀 Chạy coverage...\n');
execSync(command, { stdio: 'inherit' });
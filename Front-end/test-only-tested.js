#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Tìm tất cả test files và source files tương ứng
function findTestedFiles() {
  const result = {
    testFiles: [],
    sourceFiles: []
  };
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.test.jsx') || file.endsWith('.test.js')) {
        result.testFiles.push(fullPath);
        
        // Tìm source file tương ứng
        const sourcePath = fullPath
          .replace('.test.jsx', '.jsx')
          .replace('.test.js', '.js')
          .replace('/__tests__/', '/');
        
        if (fs.existsSync(sourcePath)) {
          result.sourceFiles.push(sourcePath);
        }
      }
    });
  }
  
  scanDir('./src');
  return result;
}

const { testFiles, sourceFiles } = findTestedFiles();

if (testFiles.length === 0) {
  console.log('❌ Không tìm thấy test file nào!');
  process.exit(1);
}

console.log('🎯 Test files tìm thấy:');
testFiles.forEach(file => console.log(`  ✅ ${file}`));

console.log('\n📁 Source files có test:');
sourceFiles.forEach(file => console.log(`  📄 ${file}`));

// Chạy Jest chỉ với test files
const testPattern = testFiles.map(f => f.replace(/\\/g, '/')).join('|');
const coverageFiles = sourceFiles.map(f => `--collectCoverageOnlyFrom=${f}`).join(' ');

const command = process.argv.includes('--coverage') 
  ? `npx jest --testPathPattern="(${testPattern})" --coverage ${coverageFiles}`
  : `npx jest --testPathPattern="(${testPattern})"`;

console.log('\n🚀 Chạy tests...\n');
execSync(command, { stdio: 'inherit' });
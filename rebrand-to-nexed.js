const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Edemy → NexEd Rebranding Process...\n');

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        changed = true;
        content = newContent;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    if (error.code !== 'EISDIR') {
      console.error(`Error processing ${filePath}:`, error.message);
    }
    return false;
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    // Skip node_modules, .git, and certain files
    if (file === 'node_modules' || file === '.git' || file === 'rebrand-to-nexed.js' || 
        file.endsWith('package-lock.json')) {
      return;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Only process certain file types
      if (file.match(/\.(js|jsx|json|md|html|css|env|yml|yaml|txt)$/)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const replacements = [
  { from: /Edemy Platform/g, to: 'NexEd Platform' },
  { from: /Edemy Learning Platform/g, to: 'NexEd Learning Platform' },
  { from: /Edemy E-Learning Platform/g, to: 'NexEd E-Learning Platform' },
  { from: /Edemy - Online Learning Platform/g, to: 'NexEd - Empowering the Next Generation of Learners' },
  { from: /edemy-frontend/g, to: 'nexed-frontend' },
  { from: /edemy-backend/g, to: 'nexed-backend' },
  { from: /edemy-course-service/g, to: 'nexed-course-service' },
  { from: /edemy_/g, to: 'nexed_' },
  { from: /@edemy\.com/g, to: '@nexed.com' },
  { from: /edemy\.com/g, to: 'nexed.com' },
  { from: /Edemy Team/g, to: 'NexEd Team' },
  { from: /Edemy Development Team/g, to: 'NexEd Development Team' },
  { from: /About Edemy/g, to: 'About NexEd' },
  { from: /Teach on Edemy/g, to: 'Teach on NexEd' },
  { from: /Teaching on Edemy/g, to: 'Teaching on NexEd' },
  { from: /on Edemy/g, to: 'on NexEd' },
  { from: /with Edemy/g, to: 'with NexEd' },
  { from: /using Edemy/g, to: 'using NexEd' },
  { from: /for Edemy/g, to: 'for NexEd' },
  { from: /the Edemy/g, to: 'the NexEd' },
  { from: /Edemy,/g, to: 'NexEd,' },
  { from: /Edemy\./g, to: 'NexEd.' },
  { from: /Edemy!/g, to: 'NexEd!' },
  { from: /Edemy\?/g, to: 'NexEd?' },
  { from: /Edemy'/g, to: 'NexEd\'' },
  { from: /Edemy"/g, to: 'NexEd"' },
  { from: /Edemy</g, to: 'NexEd<' },
  { from: /Edemy's/g, to: 'NexEd\'s' },
  { from: /"Edemy"/g, to: '"NexEd"' },
  { from: /'Edemy'/g, to: '\'NexEd\'' },
  { from: /import AboutEdemy/g, to: 'import AboutNexEd' },
  { from: /AboutEdemy/g, to: 'AboutNexEd' },
  { from: /Edemy/g, to: 'NexEd' },
];

console.log('📝 Scanning files...\n');
const files = getAllFiles('.');
console.log(`Found ${files.length} files to process\n`);

let changedCount = 0;
const changedFiles = [];

files.forEach(file => {
  if (replaceInFile(file, replacements)) {
    changedCount++;
    changedFiles.push(file);
  }
});

console.log(`\n✅ Rebranding complete!`);
console.log(`📊 Files changed: ${changedCount}/${files.length}\n`);

if (changedFiles.length > 0 && changedFiles.length <= 50) {
  console.log('📄 Changed files:');
  changedFiles.forEach(file => {
    console.log(`   - ${path.relative('.', file)}`);
  });
}

console.log('\n🎉 Edemy has been successfully rebranded to NexEd!');
console.log('\n📋 Next steps:');
console.log('1. Review changes (git diff)');
console.log('2. Rename AboutEdemy.jsx to AboutNexEd.jsx manually');
console.log('3. Update MongoDB database name if needed');
console.log('4. Restart both servers');
console.log('5. Clear browser cache');


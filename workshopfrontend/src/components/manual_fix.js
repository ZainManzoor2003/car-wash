const fs = require('fs');

// Read the file
let content = fs.readFileSync('OurServicesPage.tsx', 'utf8');

// Find and replace the specific line
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("userEmail={localStorage.getItem('userEmail') || ''}")) {
    lines[i] = "        userEmail={localStorage.getItem('userEmail') || ''}";
    break;
  }
}

// Join back and write
content = lines.join('\n');
fs.writeFileSync('OurServicesPage.tsx', content);
console.log('Manually fixed the string literal');

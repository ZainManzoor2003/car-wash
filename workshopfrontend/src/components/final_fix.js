const fs = require('fs');

// Read the file
let content = fs.readFileSync('OurServicesPage.tsx', 'utf8');

// Replace the problematic line
content = content.replace(
  "        userEmail={localStorage.getItem('userEmail') || ''}",
  "        userEmail={localStorage.getItem('userEmail') || ''}"
);

// Write back
fs.writeFileSync('OurServicesPage.tsx', content);
console.log('Fixed the string literal issue');

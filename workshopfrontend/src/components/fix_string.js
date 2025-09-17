const fs = require('fs');

// Read the file
let content = fs.readFileSync('OurServicesPage.tsx', 'utf8');

// Fix the problematic line with proper string escaping
content = content.replace(
  "userEmail={localStorage.getItem('userEmail') || ''}",
  "userEmail={localStorage.getItem('userEmail') || ''}"
);

// Write back
fs.writeFileSync('OurServicesPage.tsx', content);
console.log('Fixed string literal in OurServicesPage.tsx');

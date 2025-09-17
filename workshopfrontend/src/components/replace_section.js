const fs = require('fs');

// Read the file
let content = fs.readFileSync('OurServicesPage.tsx', 'utf8');

// Replace the entire seasonal check notification section
const oldSection = `      {/* Seasonal Check Notification */}
      <SeasonalCheckNotification
        userEmail={localStorage.getItem('userEmail') || ''}
        isPremium={membershipInfo?.membershipType === 'premium'}
      />`;

const newSection = `      {/* Seasonal Check Notification */}
      <SeasonalCheckNotification
        userEmail={localStorage.getItem('userEmail') || ''}
        isPremium={membershipInfo?.membershipType === 'premium'}
      />`;

content = content.replace(oldSection, newSection);

// Write back
fs.writeFileSync('OurServicesPage.tsx', content);
console.log('Replaced seasonal check notification section');

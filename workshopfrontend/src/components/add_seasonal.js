const fs = require('fs');

// Read the file
let content = fs.readFileSync('OurServicesPage.tsx', 'utf8');

// Add import after the first import
content = content.replace(
  "import React, { useState, useEffect, useRef } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport SeasonalCheckNotification from './SeasonalCheckNotification';"
);

// Add the component before the closing section tag
content = content.replace(
  "    </section>",
  "      {/* Seasonal Check Notification */}\n      <SeasonalCheckNotification\n        userEmail={localStorage.getItem('userEmail') || ''}\n        isPremium={membershipInfo?.membershipType === 'premium'}\n      />\n    </section>"
);

// Write back
fs.writeFileSync('OurServicesPage.tsx', content);
console.log('Added seasonal check notification properly');

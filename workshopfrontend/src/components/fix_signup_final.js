const fs = require('fs');

// Read the file
let content = fs.readFileSync('SignupPage.tsx', 'utf8');

// Replace the SignupLogo component with proper formatting
const newSignupLogo = `const SignupLogo = () => (
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
    <img 
      id="imager11" 
      src="/nlogo.png" 
      alt="Reliable Mechanics Logo"
      style={{ height: '250px', marginTop: '20px' }}
    />
  </div>
);`;

// Find and replace the SignupLogo component
content = content.replace(
  /const SignupLogo = \(\) => \([\s\S]*?\);/
,
  newSignupLogo
);

// Replace the Sign Up heading fontSize
content = content.replace(
  /fontSize: '2rem'/g,
  "fontSize: '1.5rem'"
);

// Write back to file
fs.writeFileSync('SignupPage.tsx', content);
console.log('Fixed SignupPage.tsx successfully');

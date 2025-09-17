const fs = require('fs');

// Read the file
let content = fs.readFileSync('SignupPage.tsx', 'utf8');

// Fix the SignupLogo component
content = content.replace(
  /const SignupLogo = \(\) => \(\s*<div style=\{\{ textAlign: 'center', marginBottom: 32 \}\}>\s*<img\s*id="imager11"\s*src="\/nlogo\.png"\s*alt="Reliable Mechanics Logo"\s*\/>\s*<\/div>\s*\);/s,
  `const SignupLogo = () => (
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
    <img 
      id="imager11" 
      src="/nlogo.png" 
      alt="Reliable Mechanics Logo"
      style={{ height: '250px' }}
    />
  </div>
);`
);

// Fix the Sign Up heading
content = content.replace(
  /fontSize: '2rem'/g,
  "fontSize: '1.5rem'"
);

// Write back to file
fs.writeFileSync('SignupPage.tsx', content);
console.log('Fixed SignupPage.tsx');

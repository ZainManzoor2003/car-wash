const fs = require('fs');

// Read the file
let content = fs.readFileSync('SeasonalCheckBooking.tsx', 'utf8');

// Add seasonal settings state
content = content.replace(
  'const [bookingSuccess, setBookingSuccess] = useState(false);',
  `const [bookingSuccess, setBookingSuccess] = useState(false);
  const [seasonalSettings, setSeasonalSettings] = useState<any>(null);`
);

// Add fetch seasonal settings function
content = content.replace(
  'useEffect(() => {',
  `const fetchSeasonalSettings = async () => {
    try {
      const response = await fetch(\`\${API_BASE_URL}/api/seasonal-settings\`);
      if (response.ok) {
        const data = await response.json();
        setSeasonalSettings(data[0] || data);
      }
    } catch (error) {
      console.error('Error fetching seasonal settings:', error);
    }
  };

  useEffect(() => {`
);

// Update the useEffect to fetch seasonal settings
content = content.replace(
  '  useEffect(() => {\n    const email = localStorage.getItem(\'userEmail\');\n    if (email) {\n      setUserEmail(email);\n      fetchMembership(email);\n    }\n  }, []);',
  `  useEffect(() => {\n    const email = localStorage.getItem('userEmail');\n    if (email) {\n      setUserEmail(email);\n      fetchMembership(email);\n    }\n    fetchSeasonalSettings();\n  }, []);`
);

// Replace the hardcoded getSeasonalInfo function
content = content.replace(
  `  const getSeasonalInfo = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const isSpringSeason = currentMonth >= 2 && currentMonth <= 5; // March to June
    const isWinterSeason = currentMonth >= 9 || currentMonth <= 1; // October to February

    return {
      isSpringSeason,
      isWinterSeason,
      currentMonth,
      springMonths: 'March - June',
      winterMonths: 'October - February'
    };
  };`,
  `  const getSeasonalInfo = () => {
    if (!seasonalSettings) {
      return {
        isSpringSeason: false,
        isWinterSeason: false,
        currentMonth: new Date().getMonth(),
        springMonths: 'Loading...',
        winterMonths: 'Loading...'
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const isSpringSeason = seasonalSettings.summerMonths?.includes(currentMonth) || false;
    const isWinterSeason = seasonalSettings.winterMonths?.includes(currentMonth) || false;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

    const formatMonths = (months: number[]) => {
      if (!months || months.length === 0) return 'Not configured';
      const monthNamesList = months.map(m => monthNames[m]).join(', ');
      return monthNamesList;
    };

    return {
      isSpringSeason,
      isWinterSeason,
      currentMonth,
      springMonths: formatMonths(seasonalSettings.summerMonths || []),
      winterMonths: formatMonths(seasonalSettings.winterMonths || [])
    };
  };`
);

// Update the display to use Summer and Winter instead of Spring and Winter
content = content.replace(
  '              <h4 style={{ color: \'#28a745\', marginBottom: \'10px\' }}>Spring Check</h4>',
  '              <h4 style={{ color: \'#28a745\', marginBottom: \'10px\' }}>Summer Check</h4>'
);

content = content.replace(
  '                Current status: {seasonalInfo.isSpringSeason ? \'✅ Available\' : \'❌ Not available\'}',
  '                Current status: {seasonalInfo.isSpringSeason ? \'✅ Available\' : \'❌ Not available\'}'
);

// Update the season selection buttons
content = content.replace(
  '                    Spring Check',
  '                    Summer Check'
);

content = content.replace(
  '                    onClick={() => handleSeasonChange(\'spring\')}',
  '                    onClick={() => handleSeasonChange(\'summer\')}'
);

content = content.replace(
  '                      background: bookingForm.season === \'spring\'',
  '                      background: bookingForm.season === \'summer\''
);

// Update the form state and types
content = content.replace(
  "    season: 'spring' as 'spring' | 'winter',",
  "    season: 'summer' as 'summer' | 'winter',"
);

content = content.replace(
  "  const checkEligibility = async (email: string, season: 'spring' | 'winter') => {",
  "  const checkEligibility = async (email: string, season: 'summer' | 'winter') => {"
);

content = content.replace(
  "  const handleSeasonChange = (season: 'spring' | 'winter') => {",
  "  const handleSeasonChange = (season: 'summer' | 'winter') => {"
);

content = content.replace(
  "        checkEligibility(email, 'spring');",
  "        checkEligibility(email, 'summer');"
);

content = content.replace(
  "          season: 'spring',",
  "          season: 'summer',"
);

// Write back
fs.writeFileSync('SeasonalCheckBooking.tsx', content);
console.log('Fixed SeasonalCheckBooking.tsx to use dynamic seasonal settings');

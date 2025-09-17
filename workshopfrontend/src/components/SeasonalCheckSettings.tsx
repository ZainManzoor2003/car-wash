import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import Navbar from './Navbar';
import Footer from './Footer';

interface SeasonalSettings {
  _id?: string;
  summerMonths: number[]; // Array of month numbers (0-11)
  winterMonths: number[]; // Array of month numbers (0-11)
  isActive: boolean;
  notificationEnabled: boolean;
  lastNotificationSent?: string;
  createdAt?: string;
  updatedAt?: string;
}

const SeasonalCheckSettings: React.FC = () => {
  const [settings, setSettings] = useState<SeasonalSettings>({
    summerMonths: [5, 6, 7, 8], // June to September (0-indexed)
    winterMonths: [11, 0, 1, 2], // December to March (0-indexed)
    isActive: true,
    notificationEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setSettings(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccess('Settings saved successfully!');
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Error saving settings');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
        color: '#fff',
        paddingTop: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Navbar />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            Loading seasonal check settings...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
      color: '#fff',
      paddingTop: '200px'
    }}>
      <Navbar />
      
      <div style={{ padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 10px 0'
            }}>
              Seasonal Check Settings
            </h1>
            <p style={{ color: '#ccc', margin: 0, fontSize: '1.1rem' }}>
              Configure summer and winter check months and manage premium user notifications
            </p>
          </div>

          {/* Settings Form - Original Compact Design */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '12px', 
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ color: '#ffd600', marginBottom: '20px', fontSize: '1.5rem' }}>
              Seasonal Configuration
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
              {/* Summer Months */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#fff' }}>
                  Summer Months
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                    <label key={month} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      padding: '8px 12px', 
                      background: settings.summerMonths.includes(index) ? '#ffd600' : 'rgba(255, 255, 255, 0.1)',
                      color: settings.summerMonths.includes(index) ? '#000' : '#fff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.summerMonths.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings(prev => ({
                              ...prev,
                              summerMonths: [...prev.summerMonths, index]
                            }));
                          } else {
                            setSettings(prev => ({
                              ...prev,
                              summerMonths: prev.summerMonths.filter(m => m !== index)
                            }));
                          }
                        }}
                        style={{ margin: 0 }}
                      />
                      {month}
                    </label>
                  ))}
                </div>
              </div>

              {/* Winter Months */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#fff' }}>
                  Winter Months
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                    <label key={month} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      padding: '8px 12px', 
                      background: settings.winterMonths.includes(index) ? '#ffd600' : 'rgba(255, 255, 255, 0.1)',
                      color: settings.winterMonths.includes(index) ? '#000' : '#fff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.winterMonths.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings(prev => ({
                              ...prev,
                              winterMonths: [...prev.winterMonths, index]
                            }));
                          } else {
                            setSettings(prev => ({
                              ...prev,
                              winterMonths: prev.winterMonths.filter(m => m !== index)
                            }));
                          }
                        }}
                        style={{ margin: 0 }}
                      />
                      {month}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Settings */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.isActive}
                  onChange={(e) => setSettings(prev => ({ ...prev, isActive: e.target.checked }))}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ color: '#fff', fontWeight: '500' }}>Seasonal checks active</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.notificationEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, notificationEnabled: e.target.checked }))}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ color: '#fff', fontWeight: '500' }}>Enable notifications</span>
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              style={{
                background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>



          {/* Error/Success Messages */}
          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              color: '#f44336',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid #4CAF50',
              color: '#4CAF50',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {success}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SeasonalCheckSettings;
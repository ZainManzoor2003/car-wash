import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface SeasonalCheckNotificationProps {
  userEmail: string;
  isPremium: boolean;
}

interface SeasonalSettings {
  summerMonths: number[];
  winterMonths: number[];
  isActive: boolean;
  notificationEnabled: boolean;
}

const SeasonalCheckNotification: React.FC<SeasonalCheckNotificationProps> = ({ 
  userEmail, 
  isPremium 
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [seasonalSettings, setSeasonalSettings] = useState<SeasonalSettings | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>('');
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    if (!isPremium || !userEmail) return;

    const checkSeasonalEligibility = async () => {
      try {
        // Check if user has already seen the notification for current season
        const statusResponse = await fetch(`${API_BASE_URL}/api/seasonal-notification-status/${encodeURIComponent(userEmail)}`);
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          
          if (status.hasSeen || !status.currentSeason) {
            return; // User has already seen it or no current season
          }
          
          setCurrentSeason(status.currentSeason);
          setIsEligible(true);
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error checking seasonal eligibility:', error);
      }
    };

    checkSeasonalEligibility();
  }, [isPremium, userEmail]);

  const handleClose = () => {
    setShowNotification(false);
    // Mark notification as viewed
    if (currentSeason && userEmail) {
      fetch(`${API_BASE_URL}/api/seasonal-notification-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          season: currentSeason
        })
      }).catch(error => console.error('Error marking notification as viewed:', error));
    }
  };

  const handleBookNow = () => {
    // Mark notification as viewed
    if (currentSeason && userEmail) {
      fetch(`${API_BASE_URL}/api/seasonal-notification-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          season: currentSeason
        })
      }).catch(error => console.error('Error marking notification as viewed:', error));
    }
    
    // Navigate to seasonal check booking page
    window.location.href = '/dashboard/seasonal-check-booking';
  };

  if (!showNotification || !isEligible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Free {currentSeason} Seasonal Check Available!
          </h3>
          <p className="text-gray-600">
            As a premium member, you're entitled to a free seasonal vehicle check
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What's Included:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Comprehensive vehicle inspection</li>
              <li>• Tire condition and pressure check</li>
              <li>• Brake system inspection</li>
              <li>• Fluid levels check</li>
              <li>• Battery health assessment</li>
              <li>• Lights and electrical check</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">
                Value: £45 - Completely FREE for you!
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleBookNow}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Book Now
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          This offer is only available during the {currentSeason.toLowerCase()} season. 
          Don't miss out on this valuable service included in your premium membership!
        </p>
      </div>
    </div>
  );
};

export default SeasonalCheckNotification;

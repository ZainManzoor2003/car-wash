import React, { useState, useEffect } from 'react';

interface FluidTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  serviceId?: string;
  onSuccess?: () => void;
}

interface FluidData {
  engineOil: number;
  coolant: number;
  screenwash: number;
  steeringFluid: number;
}

interface FluidTrackingData {
  _id: string;
  quarter: string;
  allowances: FluidData;
  usage: FluidData;
  remaining: FluidData;
  notes: string;
}

const FluidTrackingModal: React.FC<FluidTrackingModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  serviceId,
  onSuccess
}) => {
  const [fluidUsage, setFluidUsage] = useState<FluidData>({
    engineOil: 0,
    coolant: 0,
    screenwash: 0,
    steeringFluid: 0
  });
  
  const [fluidTracking, setFluidTracking] = useState<FluidTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Load current fluid tracking data
  useEffect(() => {
    if (isOpen && userEmail) {
      loadFluidTrackingData();
    }
  }, [isOpen, userEmail]);

  const loadFluidTrackingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/fluid-tracking/${userEmail}`);
      const data = await response.json();
      
      if (data.success) {
        setFluidTracking(data.data);
        setNotes(data.data.notes || '');
      } else {
        setError('Failed to load fluid tracking data');
      }
    } catch (err) {
      setError('Error loading fluid tracking data');
      console.error('Error loading fluid tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFluidChange = (fluidType: keyof FluidData, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    // Validate maximum 0.5L per fluid type
    if (numValue > 0.5) {
      setError(`${fluidType} cannot exceed 0.5L per quarter`);
      return;
    }
    
    // Check if adding this amount would exceed remaining allowance
    if (fluidTracking) {
      const currentUsage = fluidTracking.usage[fluidType];
      const remaining = fluidTracking.remaining[fluidType];
      
      if (currentUsage + numValue > 0.5) {
        setError(`Total ${fluidType} usage cannot exceed 0.5L per quarter`);
        return;
      }
    }
    
    setError('');
    setFluidUsage(prev => ({
      ...prev,
      [fluidType]: numValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const response = await fetch(`http://localhost:5001/api/fluid-tracking/${userEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usage: fluidUsage,
          serviceId: serviceId,
          notes: notes
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFluidUsage({
          engineOil: 0,
          coolant: 0,
          screenwash: 0,
          steeringFluid: 0
        });
        setNotes('');
        onSuccess?.();
        onClose();
      } else {
        setError(data.error || 'Failed to save fluid usage');
      }
    } catch (err) {
      setError('Error saving fluid usage');
      console.error('Error saving fluid usage:', err);
    } finally {
      setSaving(false);
    }
  };

  const getTotalUsage = () => {
    return Object.values(fluidUsage).reduce((sum, value) => sum + value, 0);
  };

  const getTotalRemaining = () => {
    if (!fluidTracking) return 0;
    return Object.values(fluidTracking.remaining).reduce((sum, value) => sum + value, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🔧 Fluid Top-up Tracking
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fluid tracking data...</p>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800">Customer Information</h3>
              <p className="text-blue-700">Name: {userName}</p>
              <p className="text-blue-700">Email: {userEmail}</p>
              {fluidTracking && (
                <p className="text-blue-700">Quarter: {fluidTracking.quarter}</p>
              )}
            </div>

            {/* Current Allowances */}
            {fluidTracking && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-3">Current Quarter Allowances</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(fluidTracking.allowances).map(([fluid, allowance]) => (
                    <div key={fluid} className="text-center">
                      <div className="text-sm text-green-600 capitalize">
                        {fluid.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="font-bold text-green-800">
                        {allowance}L
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Input */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Fluid Usage This Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(fluidUsage).map(([fluid, value]) => (
                  <div key={fluid} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {fluid.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="0.5"
                        value={value || ''}
                        onChange={(e) => handleFluidChange(fluid as keyof FluidData, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                      <span className="text-sm text-gray-500">L</span>
                    </div>
                    {fluidTracking && (
                      <div className="text-xs text-gray-500">
                        Remaining: {fluidTracking.remaining[fluid as keyof FluidData]}L
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Usage */}
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-800">Total Usage This Service:</span>
                <span className="font-bold text-yellow-900">{getTotalUsage().toFixed(1)}L</span>
              </div>
              {fluidTracking && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-yellow-700">Total Remaining This Quarter:</span>
                  <span className="text-sm font-semibold text-yellow-800">{getTotalRemaining().toFixed(1)}L</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes about the fluid top-up service..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || getTotalUsage() === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Fluid Usage'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FluidTrackingModal;

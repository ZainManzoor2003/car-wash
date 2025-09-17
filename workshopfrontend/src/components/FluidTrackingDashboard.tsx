import React, { useState, useEffect } from 'react';

interface FluidData {
  engineOil: number;
  coolant: number;
  screenwash: number;
  steeringFluid: number;
}

interface FluidTrackingRecord {
  _id: string;
  userId: string;
  userEmail: string;
  quarter: string;
  year: number;
  quarterNumber: number;
  allowances: FluidData;
  usage: FluidData;
  remaining: FluidData;
  serviceDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const FluidTrackingDashboard: React.FC = () => {
  const [fluidRecords, setFluidRecords] = useState<FluidTrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFluidRecords();
  }, [selectedQuarter]);

  const loadFluidRecords = async () => {
    try {
      setLoading(true);
      const url = selectedQuarter 
        ? `http://localhost:5001/api/fluid-tracking?quarter=${selectedQuarter}`
        : 'http://localhost:5001/api/fluid-tracking';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setFluidRecords(data.data);
      } else {
        setError('Failed to load fluid tracking records');
      }
    } catch (err) {
      setError('Error loading fluid tracking records');
      console.error('Error loading fluid tracking records:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    let quarter;
    if (month <= 3) quarter = 1;
    else if (month <= 6) quarter = 2;
    else if (month <= 9) quarter = 3;
    else quarter = 4;
    
    return `${year}-Q${quarter}`;
  };

  const getQuarterOptions = () => {
    const currentYear = new Date().getFullYear();
    const quarters = [];
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let q = 1; q <= 4; q++) {
        quarters.push(`${year}-Q${q}`);
      }
    }
    
    return quarters;
  };

  const getTotalUsage = (record: FluidTrackingRecord) => {
    return Object.values(record.usage).reduce((sum, value) => sum + value, 0);
  };

  const getTotalRemaining = (record: FluidTrackingRecord) => {
    return Object.values(record.remaining).reduce((sum, value) => sum + value, 0);
  };

  const getUsagePercentage = (record: FluidTrackingRecord) => {
    const totalUsage = getTotalUsage(record);
    const totalAllowance = Object.values(record.allowances).reduce((sum, value) => sum + value, 0);
    return totalAllowance > 0 ? (totalUsage / totalAllowance) * 100 : 0;
  };

  const getFluidStatus = (record: FluidTrackingRecord) => {
    const usagePercentage = getUsagePercentage(record);
    if (usagePercentage === 0) return { status: 'unused', color: 'text-gray-500' };
    if (usagePercentage < 50) return { status: 'low', color: 'text-green-600' };
    if (usagePercentage < 80) return { status: 'moderate', color: 'text-yellow-600' };
    return { status: 'high', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fluid tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔧 Fluid Tracking Dashboard
        </h1>
        <p className="text-gray-600">
          Track quarterly fluid top-up allowances for premium members
        </p>
      </div>

      {/* Quarter Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Quarter
        </label>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Current Quarter ({getCurrentQuarter()})</option>
          {getQuarterOptions().map(quarter => (
            <option key={quarter} value={quarter}>
              {quarter}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Records</h3>
          <p className="text-2xl font-bold text-blue-900">{fluidRecords.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Active Users</h3>
          <p className="text-2xl font-bold text-green-900">
            {fluidRecords.filter(r => getTotalUsage(r) > 0).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">High Usage</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {fluidRecords.filter(r => getUsagePercentage(r) > 80).length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Fully Used</h3>
          <p className="text-2xl font-bold text-red-900">
            {fluidRecords.filter(r => getTotalRemaining(r) === 0).length}
          </p>
        </div>
      </div>

      {/* Fluid Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Fluid Tracking Records
          </h2>
        </div>
        
        {fluidRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No fluid tracking records found for this quarter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quarter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engine Oil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coolant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screenwash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Steering Fluid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fluidRecords.map((record) => {
                  const status = getFluidStatus(record);
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.userEmail}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.userId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.quarter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{record.usage.engineOil}L</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{record.allowances.engineOil}L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{record.usage.coolant}L</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{record.allowances.coolant}L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{record.usage.screenwash}L</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{record.allowances.screenwash}L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{record.usage.steeringFluid}L</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{record.allowances.steeringFluid}L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{getTotalUsage(record).toFixed(1)}L</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">2.0L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.status.toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-500">
                          {getUsagePercentage(record).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FluidTrackingDashboard;

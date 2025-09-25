import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from './Navbar';
import Footer from './Footer';
import ExpenseManager from './ExpenseManager';
import { API_BASE_URL } from '../config';

interface FinancialData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

interface BusinessInsight {
  type: 'success' | 'warning' | 'danger' | 'info' | 'expense' | 'revenue' | 'performance';
  icon: string;
  title: string;
  content: string;
  recommendation: string;
}

const FinancePage: React.FC = () => {
  const [viewPeriod, setViewPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  });
  const [expenseCategories, setExpenseCategories] = useState<CategoryBreakdown[]>([]);
  const [revenueCategories, setRevenueCategories] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseManager, setShowExpenseManager] = useState(false);
  const [previousPeriodData, setPreviousPeriodData] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  });

  // Fetch financial data based on selected period
  useEffect(() => {
    fetchFinancialData();
  }, [viewPeriod]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Fetch chart data
      const chartResponse = await fetch(`${API_BASE_URL}/api/finance/chart?period=${viewPeriod}`);
      const chartData = await chartResponse.json();
      if (chartData.success) {
        console.log('📊 Chart data received:', chartData);
        if (chartData.data && chartData.data.length > 0) {
          setFinancialData(chartData.data);
        } else {
          console.log('📊 No chart data available, using mock data');
          setFinancialData(generateMockData());
        }
      }

      // Fetch summary data
      const summaryResponse = await fetch(`${API_BASE_URL}/api/finance/summary?period=${viewPeriod}`);
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        console.log('📊 Summary data received:', summaryData);
        if (summaryData.data && (summaryData.data.totalRevenue > 0 || summaryData.data.totalExpenses > 0)) {
          setSummary(summaryData.data);
        } else {
          console.log('📊 No summary data available, using mock data');
          setSummary({
            totalRevenue: 15420,
            totalExpenses: 8750,
            netProfit: 6670,
            profitMargin: 43.3
          });
        }
      }

      // Fetch breakdown data
      const breakdownResponse = await fetch(`${API_BASE_URL}/api/finance/breakdown?period=${viewPeriod}`);
      const breakdownData = await breakdownResponse.json();
      if (breakdownData.success) {
        console.log('📊 Breakdown data received:', breakdownData);
        if (breakdownData.data && (breakdownData.data.expenses.length > 0 || breakdownData.data.revenue.length > 0)) {
          setExpenseCategories(breakdownData.data.expenses);
          setRevenueCategories(breakdownData.data.revenue);
        } else {
          console.log('📊 No breakdown data available, using mock data');
          setExpenseCategories([
            { name: 'Parts & Components', amount: 3200, percentage: 36.6 },
            { name: 'Labour Costs', amount: 2800, percentage: 32.0 },
            { name: 'Equipment & Tools', amount: 1200, percentage: 13.7 },
            { name: 'Fuel & Transport', amount: 800, percentage: 9.1 },
            { name: 'Marketing', amount: 500, percentage: 5.7 },
            { name: 'Insurance', amount: 250, percentage: 2.9 }
          ]);
          setRevenueCategories([
            { name: 'Mechanical Services', amount: 6800, percentage: 44.1 },
            { name: 'Tyre Services', amount: 4200, percentage: 27.2 },
            { name: 'General Services', amount: 3100, percentage: 20.1 },
            { name: 'Diagnostics', amount: 980, percentage: 6.4 },
            { name: 'Inspections', amount: 340, percentage: 2.2 }
          ]);
        }
      }

      // Fetch previous period data for comparison
      const previousPeriodResponse = await fetch(`${API_BASE_URL}/api/finance/summary?period=${viewPeriod}&previous=true`);
      const previousPeriodData = await previousPeriodResponse.json();
      if (previousPeriodData.success) {
        setPreviousPeriodData(previousPeriodData.data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Use mock data for development
      console.log('📊 Using fallback mock data due to error');
      setFinancialData(generateMockData());
      setSummary({
        totalRevenue: 15420,
        totalExpenses: 8750,
        netProfit: 6670,
        profitMargin: 43.3
      });
      setExpenseCategories([
        { name: 'Parts & Components', amount: 3200, percentage: 36.6 },
        { name: 'Labour Costs', amount: 2800, percentage: 32.0 },
        { name: 'Equipment & Tools', amount: 1200, percentage: 13.7 },
        { name: 'Fuel & Transport', amount: 800, percentage: 9.1 },
        { name: 'Marketing', amount: 500, percentage: 5.7 },
        { name: 'Insurance', amount: 250, percentage: 2.9 }
      ]);
      setRevenueCategories([
        { name: 'Mechanical Services', amount: 6800, percentage: 44.1 },
        { name: 'Tyre Services', amount: 4200, percentage: 27.2 },
        { name: 'General Services', amount: 3100, percentage: 20.1 },
        { name: 'Diagnostics', amount: 980, percentage: 6.4 },
        { name: 'Inspections', amount: 340, percentage: 2.2 }
      ]);
    }
    setLoading(false);
  };

  const generateMockData = (): FinancialData[] => {
    const data = [];
    const baseDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      const revenue = 400 + Math.random() * 600;
      const expenses = 200 + Math.random() * 300;
      
      data.push({
        date: viewPeriod === 'day' ? date.toLocaleDateString() : 
              viewPeriod === 'week' ? `Week ${Math.floor(i/7) + 1}` :
              viewPeriod === 'month' ? date.toLocaleDateString('en-GB', { month: 'short' }) :
              date.getFullYear().toString(),
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(revenue - expenses)
      });
    }
    
    return data;
  };

  const formatCurrency = (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getProfitColor = (profit: number) => profit >= 0 ? '#10b981' : '#ef4444';

  const getInsights = (): BusinessInsight[] => {
    const insights: BusinessInsight[] = [];
    
    // 📊 EXPENSE ANALYSIS
    if (expenseCategories.length > 0) {
      const highest = expenseCategories[0];
      const secondHighest = expenseCategories[1];
      
      insights.push({
        type: 'expense',
        icon: '💸',
        title: 'Biggest Expense Category',
        content: `${highest.name} is your largest expense at ${formatCurrency(highest.amount)} (${highest.percentage.toFixed(1)}% of total expenses)`,
        recommendation: highest.percentage > 50 ? 'Consider breaking down this category for better control' : ''
      });

      if (secondHighest) {
        const gap = highest.percentage - secondHighest.percentage;
        if (gap > 30) {
          insights.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Expense Concentration Risk',
            content: `${highest.name} accounts for much more than other categories (${gap.toFixed(1)}% gap with ${secondHighest.name})`,
            recommendation: 'Consider diversifying expenses to reduce dependency on single category'
          });
        }
      }
    }
    
    // 💰 REVENUE ANALYSIS
    if (revenueCategories.length > 0) {
      const topRevenue = revenueCategories[0];
      const totalBookings = financialData.length > 0 ? financialData.reduce((sum, day) => sum + (day.revenue > 0 ? 1 : 0), 0) : 1;
      const avgRevenuePerBooking = summary.totalRevenue / Math.max(totalBookings, 1);
      
      insights.push({
        type: 'revenue',
        icon: '🏆',
        title: 'Top Revenue Generator',
        content: `${topRevenue.name} is your main money maker, bringing in ${formatCurrency(topRevenue.amount)} (${topRevenue.percentage.toFixed(1)}% of total revenue)`,
        recommendation: topRevenue.percentage > 60 ? 'Consider expanding other service areas to reduce revenue risk' : 'Great revenue diversification!'
      });

      insights.push({
        type: 'performance',
        icon: '📈',
        title: 'Average Revenue Per Job',
        content: `You're earning an average of ${formatCurrency(avgRevenuePerBooking)} per completed job`,
        recommendation: avgRevenuePerBooking < 200 ? 'Consider upselling additional services or parts' : 'Strong average job value!'
      });
    }
    
    // 📊 PERIOD COMPARISON
    if (previousPeriodData.totalRevenue > 0) {
      const revenueChange = ((summary.totalRevenue - previousPeriodData.totalRevenue) / previousPeriodData.totalRevenue) * 100;
      const profitChange = ((summary.netProfit - previousPeriodData.netProfit) / Math.abs(previousPeriodData.netProfit || 1)) * 100;
      
      const periodName = viewPeriod === 'day' ? 'yesterday' : 
                        viewPeriod === 'week' ? 'last week' : 
                        viewPeriod === 'month' ? 'last month' : 'last year';
      
      if (Math.abs(revenueChange) > 5) {
        insights.push({
          type: revenueChange > 0 ? 'success' : 'warning',
          icon: revenueChange > 0 ? '📈' : '📉',
          title: `Revenue vs ${periodName.charAt(0).toUpperCase() + periodName.slice(1)}`,
          content: `Revenue is ${revenueChange > 0 ? 'up' : 'down'} ${Math.abs(revenueChange).toFixed(1)}% compared to ${periodName} (${formatCurrency(Math.abs(summary.totalRevenue - previousPeriodData.totalRevenue))})`,
          recommendation: revenueChange > 15 ? 'Excellent growth! Scale successful strategies' : 
                         revenueChange < -15 ? 'Investigate causes and take corrective action' : ''
        });
      }

      if (Math.abs(profitChange) > 10) {
        insights.push({
          type: profitChange > 0 ? 'success' : 'warning',
          icon: profitChange > 0 ? '💰' : '⚠️',
          title: `Profit Trend vs ${periodName.charAt(0).toUpperCase() + periodName.slice(1)}`,
          content: `Net profit is ${profitChange > 0 ? 'up' : 'down'} ${Math.abs(profitChange).toFixed(1)}% compared to ${periodName}`,
          recommendation: profitChange > 20 ? 'Outstanding profit improvement!' : 
                         profitChange < -20 ? 'Urgent profit recovery needed' : ''
        });
      }
    }
    
    // 🎯 BUSINESS HEALTH INDICATORS
    const profitMargin = summary.profitMargin;
    if (profitMargin > 35) {
      insights.push({
        type: 'success',
        icon: '🌟',
        title: 'Excellent Profit Margin',
        content: `Your ${profitMargin.toFixed(1)}% profit margin is exceptional for auto repair industry (typical: 20-30%)`,
        recommendation: 'Consider reinvesting profits into business growth or equipment upgrades'
      });
    } else if (profitMargin > 15) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Healthy Profit Margin',
        content: `Your ${profitMargin.toFixed(1)}% profit margin is solid but has room for improvement`,
        recommendation: 'Focus on reducing highest expense categories or premium service offerings'
      });
    } else if (profitMargin > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Profit Margin',
        content: `Your ${profitMargin.toFixed(1)}% profit margin is below industry standards - urgent optimization needed`,
        recommendation: 'Review pricing strategy and identify cost-cutting opportunities immediately'
      });
    } else {
      insights.push({
        type: 'danger',
        icon: '🚨',
        title: 'Negative Profit Margin',
        content: `You're operating at a ${Math.abs(profitMargin).toFixed(1)}% loss - immediate action required`,
        recommendation: 'Emergency cost reduction and pricing review needed. Consider business restructuring.'
      });
    }

    // 💡 OPERATIONAL INSIGHTS
    const expenseRatio = summary.totalRevenue > 0 ? (summary.totalExpenses / summary.totalRevenue) * 100 : 0;
    if (expenseRatio > 85) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'High Operating Costs',
        content: `Expenses consume ${expenseRatio.toFixed(1)}% of revenue - unsustainable long-term`,
        recommendation: 'Immediate cost reduction required. Review all expense categories for savings opportunities.'
      });
    }

    // 🔧 PARTS & LABOUR INSIGHTS
    const partsExpense = expenseCategories.find(cat => cat.name === 'Parts & Components');
    const labourExpense = expenseCategories.find(cat => cat.name === 'Labour Costs');
    
    if (partsExpense && labourExpense) {
      const partsToLabourRatio = partsExpense.amount / (labourExpense.amount || 1);
      if (partsToLabourRatio > 2) {
        insights.push({
          type: 'info',
          icon: '🔧',
          title: 'Parts-Heavy Business Model',
          content: `Parts costs are ${partsToLabourRatio.toFixed(1)}x higher than labour costs`,
          recommendation: 'Consider higher markup on parts or focus on labour-intensive services for better margins'
        });
      } else if (partsToLabourRatio < 0.5) {
        insights.push({
          type: 'info',
          icon: '👨‍🔧',
          title: 'Labour-Intensive Business Model',
          content: `Labour costs dominate with parts being only ${(partsToLabourRatio * 100).toFixed(0)}% of labour expense`,
          recommendation: 'Excellent model for high margins - consider premium service positioning'
        });
      }
    }
    
    return insights;
  };

  if (showExpenseManager) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', padding: '20px 0', marginTop: '300px' }}>
          <ExpenseManager onClose={() => {
            setShowExpenseManager(false);
            // Refresh financial data when returning from expense manager
            fetchFinancialData();
          }} />
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '300px' }}>
          <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading financial data...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <style>{`
        .finance-page {
          background: #111;
          min-height: 100vh;
          color: #fff;
          margin-top: 180px;
        }
        .finance-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .finance-header {
          padding: 32px 0;
        }
        .finance-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .finance-subtitle {
          color: #bdbdbd;
          font-size: 1.15rem;
          margin-bottom: 32px;
        }
        .finance-accent {
          width: 64px;
          height: 4px;
          background: #ffd600;
          border-radius: 2px;
          margin-bottom: 32px;
        }
        .period-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .period-btn {
          background: #232323;
          color: #fff;
          border: 2px solid #444;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .period-btn.active {
          background: #ffd600;
          color: #111;
          border-color: #ffd600;
        }
        .chart-container {
          background: #181818;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 4px 24px #0006;
        }
        .chart-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 24px;
          text-align: center;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: #181818;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 24px #0006;
          border-left: 4px solid #ffd600;
        }
        .summary-card.profit {
          border-left-color: #10b981;
        }
        .summary-card.loss {
          border-left-color: #ef4444;
        }
        .summary-card.expenses {
          border-left-color: #8b5cf6;
        }
        .card-label {
          color: #bdbdbd;
          font-size: 0.9rem;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .card-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .card-subtitle {
          font-size: 0.9rem;
          color: #888;
        }
        .breakdown-section {
          margin-bottom: 32px;
        }
        .breakdown-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .breakdown-table {
          background: #181818;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 24px #0006;
        }
        .breakdown-table h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #ffd600;
        }
        .breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #232323;
        }
        .breakdown-row:last-child {
          border-bottom: none;
        }
        .breakdown-name {
          font-weight: 500;
          flex: 1;
        }
        .breakdown-amount {
          font-weight: 600;
          margin-left: 16px;
        }
        .breakdown-percentage {
          color: #bdbdbd;
          font-size: 0.9rem;
          margin-left: 8px;
          min-width: 50px;
          text-align: right;
        }
        .insights-section {
          background: #181818;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 24px #0006;
          margin-bottom: 32px;
        }
        .insights-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #ffd600;
        }
        .insight-item {
          background: #232323;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid #10b981;
          transition: all 0.2s ease;
        }
        .insight-item:hover {
          background: #2a2a2a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .insight-item:last-child {
          margin-bottom: 0;
        }
        .insight-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .insight-icon {
          font-size: 1.5rem;
          margin-right: 12px;
          min-width: 32px;
        }
        .insight-title-text {
          color: #ffd600;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }
        .insight-content {
          color: #fff;
          line-height: 1.5;
          margin: 0 0 12px 0;
          font-size: 1rem;
        }
        .insight-recommendation {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 12px;
          color: #10b981;
          font-size: 0.95rem;
          border: 1px solid #333;
        }
        .insight-success {
          border-left-color: #10b981;
        }
        .insight-warning {
          border-left-color: #f59e0b;
        }
        .insight-danger {
          border-left-color: #ef4444;
        }
        .insight-info {
          border-left-color: #3b82f6;
        }
        .insight-expense {
          border-left-color: #8b5cf6;
        }
        .insight-revenue {
          border-left-color: #10b981;
        }
        .insight-performance {
          border-left-color: #ffd600;
        }
        @media (max-width: 768px) {
          .breakdown-grid {
            grid-template-columns: 1fr;
          }
          .finance-container {
            padding: 0 16px;
          }
          .finance-title {
            font-size: 2rem;
          }
          .period-selector {
            justify-content: center;
          }
        }
      `}</style>
      
      <Navbar />
      
      <div className="finance-page">
        <div className="finance-container">
          <div className="finance-header">
            <h1 className="finance-title">Finance Dashboard</h1>
            <p className="finance-subtitle">Track your business performance with detailed financial insights</p>
            <div className="finance-accent" />
          </div>

          {/* Period Selector */}
          <div className="period-selector">
            {(['day', 'week', 'month', 'year'] as const).map(period => (
              <button
                key={period}
                className={`period-btn ${viewPeriod === period ? 'active' : ''}`}
                onClick={() => setViewPeriod(period)}
              >
                {period === 'day' ? 'Daily' : period.charAt(0).toUpperCase() + period.slice(1) + 'ly'}
              </button>
            ))}
            <button
              className="period-btn"
              style={{ background: '#10b981', color: '#fff', marginLeft: '16px' }}
              onClick={() => setShowExpenseManager(true)}
            >
              💼 Manage Expenses
            </button>
            <button
              className="period-btn"
              style={{ background: '#3b82f6', color: '#fff', marginLeft: '8px' }}
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE_URL}/api/finance/create-test-data`, { method: 'POST' });
                  const result = await response.json();
                  if (result.success) {
                    alert(`✅ ${result.message}`);
                    fetchFinancialData(); // Refresh the data
                  } else {
                    alert(`❌ Error: ${result.error}`);
                  }
                } catch (error) {
                  alert(`❌ Error creating test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
            >
              🧪 Create Test Data
            </button>
          </div>

          {/* Line Chart */}
          <div className="chart-container">
            <h2 className="chart-title">Profit vs Expenses</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#bdbdbd"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#bdbdbd"
                  fontSize={12}
                  tickFormatter={(value) => `£${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#232323',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelStyle={{ color: '#ffd600' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Expenses"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#ffd600" 
                  strokeWidth={3}
                  name="Net Profit"
                  dot={{ fill: '#ffd600', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-label">Total Revenue</div>
              <div className="card-value" style={{ color: '#10b981' }}>
                {formatCurrency(summary.totalRevenue)}
              </div>
              <div className="card-subtitle">Money coming in</div>
            </div>
            
            <div className="summary-card expenses">
              <div className="card-label">Total Expenses</div>
              <div className="card-value" style={{ color: '#8b5cf6' }}>
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="card-subtitle">Money going out</div>
            </div>
            
            <div className={`summary-card ${summary.netProfit >= 0 ? 'profit' : 'loss'}`}>
              <div className="card-label">Net Profit</div>
              <div className="card-value" style={{ color: getProfitColor(summary.netProfit) }}>
                {formatCurrency(summary.netProfit)}
              </div>
              <div className="card-subtitle">Revenue - Expenses</div>
            </div>
            
            <div className={`summary-card ${summary.profitMargin >= 0 ? 'profit' : 'loss'}`}>
              <div className="card-label">Profit Margin</div>
              <div className="card-value" style={{ color: getProfitColor(summary.profitMargin) }}>
                {summary.profitMargin.toFixed(1)}%
              </div>
              <div className="card-subtitle">Profit as % of revenue</div>
            </div>
          </div>

          {/* Breakdown Tables */}
          <div className="breakdown-section">
            <h2 className="breakdown-title">Financial Breakdown</h2>
            <div className="breakdown-grid">
              <div className="breakdown-table">
                <h3>💰 Revenue Sources</h3>
                {revenueCategories.map((category, index) => (
                  <div key={index} className="breakdown-row">
                    <div className="breakdown-name">{category.name}</div>
                    <div className="breakdown-amount">{formatCurrency(category.amount)}</div>
                    <div className="breakdown-percentage">{category.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
              
              <div className="breakdown-table">
                <h3>💸 Expense Categories</h3>
                {expenseCategories.map((category, index) => (
                  <div key={index} className="breakdown-row">
                    <div className="breakdown-name">{category.name}</div>
                    <div className="breakdown-amount">{formatCurrency(category.amount)}</div>
                    <div className="breakdown-percentage">{category.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="insights-section">
            <h2 className="insights-title">📊 Key Insights & Trends</h2>
            {getInsights().map((insight, index) => (
              <div key={index} className={`insight-item insight-${insight.type}`}>
                <div className="insight-header">
                  <span className="insight-icon">{insight.icon}</span>
                  <h3 className="insight-title-text">{insight.title}</h3>
                </div>
                <p className="insight-content">{insight.content}</p>
                {insight.recommendation && (
                  <div className="insight-recommendation">
                    <strong>💡 Recommendation:</strong> {insight.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default FinancePage; 
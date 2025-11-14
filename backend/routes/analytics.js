const express = require('express');
const Transaction = require('../models/Transaction');
const Document = require('../models/Document');
const User = require('../models/User');
const Anomaly = require('../models/Anomaly');
const { auth, adminAuth } = require('../middleware/auth');
const { generateFinancialInsights } = require('../services/aiService');

const router = express.Router();

// Get analytics summary for current user
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Get totals
    const transactions = await Transaction.find({ user: userId });
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get document count
    const documentCount = await Document.countDocuments({ user: userId });

    // Calculate monthly performance (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await Transaction.find({
      user: userId,
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    const monthlyPerformance = {};
    monthlyTransactions.forEach(transaction => {
      const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyPerformance[monthKey]) {
        monthlyPerformance[monthKey] = { income: 0, expenses: 0 };
      }
      if (transaction.type === 'income') {
        monthlyPerformance[monthKey].income += transaction.amount;
      } else {
        monthlyPerformance[monthKey].expenses += transaction.amount;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Object.keys(monthlyPerformance).map(monthKey => {
      const [, month] = monthKey.split('-');
      const income = monthlyPerformance[monthKey].income;
      const expenses = monthlyPerformance[monthKey].expenses;
      return {
        month: monthNames[parseInt(month) - 1],
        income,
        expenses,
        profit: income - expenses
      };
    });

    // Category breakdown
    const categoryBreakdown = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryBreakdown[transaction.category] = 
          (categoryBreakdown[transaction.category] || 0) + transaction.amount;
      }
    });

    const categoryData = Object.keys(categoryBreakdown).map(category => ({
      name: category,
      value: categoryBreakdown[category]
    })).sort((a, b) => b.value - a.value);

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        totals: {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          documentCount
        },
        monthlyPerformance: monthlyData,
        categoryDistribution: categoryData,
        recentTransactions: recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get AI-powered financial insights
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Get recent transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: threeMonthsAgo }
    });

    if (transactions.length < 5) {
      return res.json({
        success: true,
        data: {
          insights: ['Upload more transactions to get personalized AI insights.'],
          message: 'Insufficient data for comprehensive analysis'
        }
      });
    }

    // Generate AI insights
    const insights = await generateFinancialInsights(transactions);

    res.json({
      success: true,
      data: {
        insights,
        transactionCount: transactions.length,
        analyzedPeriod: '3 months'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin analytics - Overall platform statistics
router.get('/admin/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const documentCount = await Document.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const anomalyCount = await Anomaly.countDocuments({ status: 'new' });

    // Total transaction volume
    const allTransactions = await Transaction.find();
    const totalVolume = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Monthly revenue/expenses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentTransactions = await Transaction.find({
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    const monthlyData = {};
    recentTransactions.forEach(transaction => {
      const monthKey = transaction.date.toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = Object.keys(monthlyData).map(monthKey => {
      const [, month] = monthKey.split('-');
      return {
        month: monthNames[parseInt(month) - 1],
        revenue: monthlyData[monthKey].income,
        expenses: monthlyData[monthKey].expenses
      };
    });

    // Category distribution
    const categoryBreakdown = {};
    allTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryBreakdown[transaction.category] = 
          (categoryBreakdown[transaction.category] || 0) + transaction.amount;
      }
    });

    const categoryData = Object.keys(categoryBreakdown)
      .map(category => ({
        name: category,
        value: Math.round((categoryBreakdown[category] / totalVolume) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: userCount,
          totalDocuments: documentCount,
          totalTransactions: transactionCount,
          anomaliesDetected: anomalyCount,
          totalVolume
        },
        revenueData,
        categoryData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

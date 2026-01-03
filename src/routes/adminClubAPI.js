import express from 'express';
import ClubAPITransaction from '../models/ClubAPITransaction.js';
import { requireAdminAuth } from '../middlewares/adminAuth.js';
import { ok, fail } from '../utils/response.js';

const router = express.Router();

// Get all ClubAPI transactions with pagination and filters
router.get('/transactions', requireAdminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      userId,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { urid: { $regex: search, $options: 'i' } },
        { accountRef: { $regex: search, $options: 'i' } },
        { customerMobile: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await ClubAPITransaction.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ClubAPITransaction.countDocuments(query);

    ok(res, {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin ClubAPI transactions error:', error);
    fail(res, 'FETCH_FAILED', 'Failed to fetch transactions', 500);
  }
});

// Get transaction details by ID
router.get('/transactions/:id', requireAdminAuth, async (req, res) => {
  try {
    const transaction = await ClubAPITransaction.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!transaction) {
      return fail(res, 'NOT_FOUND', 'Transaction not found', 404);
    }

    ok(res, transaction);
  } catch (error) {
    console.error('Admin ClubAPI transaction detail error:', error);
    fail(res, 'FETCH_FAILED', 'Failed to fetch transaction details', 500);
  }
});

// Update transaction status
router.put('/transactions/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(status)) {
      return fail(res, 'INVALID_STATUS', 'Invalid status value', 400);
    }

    const transaction = await ClubAPITransaction.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(notes && { notes }),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!transaction) {
      return fail(res, 'NOT_FOUND', 'Transaction not found', 404);
    }

    ok(res, transaction);
  } catch (error) {
    console.error('Admin ClubAPI status update error:', error);
    fail(res, 'UPDATE_FAILED', 'Failed to update transaction status', 500);
  }
});

// Get transaction statistics
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const stats = await ClubAPITransaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    const typeStats = await ClubAPITransaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    ok(res, {
      overview: stats[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0
      },
      byType: typeStats
    });
  } catch (error) {
    console.error('Admin ClubAPI stats error:', error);
    fail(res, 'STATS_FAILED', 'Failed to fetch statistics', 500);
  }
});

// Get recent transactions for dashboard
router.get('/recent', requireAdminAuth, async (req, res) => {
  try {
    const transactions = await ClubAPITransaction.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    ok(res, transactions);
  } catch (error) {
    console.error('Admin ClubAPI recent transactions error:', error);
    fail(res, 'FETCH_FAILED', 'Failed to fetch recent transactions', 500);
  }
});

export default router;

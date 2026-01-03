import express from 'express';
const router = express.Router();
import apiClient from '../utils/apiClient.js';
import Transaction from '../models/Transaction.js';

// BBPS Bill Fetch
router.post('/bbps/fetchbill', async (req, res) => {
  try {
    const { urid, operatorId, mobile, amount, bbpsId, customerMobile, opvalue1, opvalue2, opvalue3 } = req.body;

    // Validate required fields
    if (!urid || !operatorId || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: urid, operatorId, mobile'
      });
    }

    const apiData = {
      urid,
      operatorId,
      mobile,
      ...(amount && { amount: amount.toString() }),
      ...(bbpsId && { bbpsId }),
      ...(customerMobile && { customerMobile }),
      ...(opvalue1 && { opvalue1 }),
      ...(opvalue2 && { opvalue2 }),
      ...(opvalue3 && { opvalue3 })
    };

    const result = await apiClient.makeRequest('/api/bbps/fetchbill', apiData);

    res.json({
      success: true,
      message: 'BBPS bill fetched successfully',
      data: result
    });

  } catch (error) {
    console.error('BBPS fetch bill error:', error);
    res.status(500).json({
      success: false,
      message: 'BBPS bill fetch failed',
      error: error.message
    });
  }
});

// BBPS Bill Payment
router.post('/bbps/pay', async (req, res) => {
  try {
    const { urid, operatorId, mobile, amount, bbpsId, customerMobile, opvalue1, opvalue2, opvalue3 } = req.body;

    // Validate required fields
    if (!urid || !operatorId || !mobile || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: urid, operatorId, mobile, amount'
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      urid,
      operatorId,
      mobile,
      amount,
      transactionType: 'bbps',
      bbpsId,
      customerMobile,
      opvalue1,
      opvalue2,
      opvalue3
    });

    await transaction.save();

    const apiData = {
      urid,
      operatorId,
      mobile,
      amount: amount.toString(),
      ...(bbpsId && { bbpsId }),
      ...(customerMobile && { customerMobile }),
      ...(opvalue1 && { opvalue1 }),
      ...(opvalue2 && { opvalue2 }),
      ...(opvalue3 && { opvalue3 })
    };

    const result = await apiClient.makeRequest('/api/bbps/pay', apiData);

    // Update transaction with API response
    transaction.clubapiResponse = result;
    transaction.status = result.status || 'processing';
    await transaction.save();

    res.json({
      success: true,
      message: 'BBPS payment initiated successfully',
      data: result,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('BBPS payment error:', error);
    res.status(500).json({
      success: false,
      message: 'BBPS payment failed',
      error: error.message
    });
  }
});

export default router;

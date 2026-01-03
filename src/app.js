import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import baseRoutes from './routes/index.js';
import userRoutes from './routes/users.js';
import loanRoutes from './routes/loans.js';
import paymentRoutes from './routes/payments.js';
import qrRoutes from './routes/qr.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import faqRoutes from './routes/faq.js';
import billRoutes from './routes/bills.js';
import kycRoutes from './routes/kyc.js';
import supportRoutes from './routes/support.js';
import employeeAuthRoutes from './routes/employeeAuth.js';
import employeeRoutes from './routes/employees.js';
import adminLoans from './routes/adminLoans.js';
import repayments from './routes/repayments.js';
import adminPush from './routes/adminPush.js';
import notifications from './routes/notifications.js';
import withdrawalRoutes from './routes/withdrawals.js';
import adminWithdrawalRoutes from './routes/adminWithdrawals.js';
import reportsRoutes from './routes/reports.js';
import adminSettlementsRoutes from './routes/adminSettlements.js';
import adminTrackLoanRoutes from './routes/adminTrackLoan.js';
import adminNotifications from './routes/adminNotifications.js';
import adminEmiControl from './routes/adminEmiControl.js';
import adminCollections from './routes/adminCollections.js';
import agents from './routes/agents.js';
import adminVirtualAccounts from './routes/adminVirtualAccounts.js';
import adminPayouts from './routes/adminPayouts.js';
import adminQR from './routes/adminQR.js';
import adminEarnings from './routes/adminEarnings.js';

// ClubAPI routes
import rechargeRoutes from './routes/recharge.js';
import dthRoutes from './routes/dth.js';
import operatorsRoutes from './routes/operators.js';
import bbpsRoutes from './routes/bbps.js';
import statusRoutes from './routes/status.js';

dotenv.config();
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/loans', adminLoans);
app.use('/api/admin/withdrawals', adminWithdrawalRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/employee/auth', employeeAuthRoutes);
app.use('/api/employees', employeeRoutes); // Single employee route
app.use('/api/repayments', repayments);
app.use('/api/notifications', notifications);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin/settlements', adminSettlementsRoutes);
app.use('/api/admin/track-loan', adminTrackLoanRoutes);
app.use('/api/admin/notifications', adminNotifications);
app.use('/api/admin/emi-control', adminEmiControl);
app.use('/api/admin/collections', adminCollections);
app.use('/api/agents', agents);
app.use('/api/admin/virtual-accounts', adminVirtualAccounts);
app.use('/api/admin/payouts', adminPayouts);
app.use('/api/admin/qr', adminQR);
app.use('/api/admin/earnings', adminEarnings);
app.use('/api/admin/push', adminPush);

// ClubAPI Routes
app.use('/api/recharge', rechargeRoutes);
app.use('/api/dth', dthRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/bbps', bbpsRoutes);
app.use('/api/status', statusRoutes);

// Base route (should be last)
app.use('/api', baseRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
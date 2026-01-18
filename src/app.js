import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// DB
import { connectDB } from './config/db.js';

// Middlewares
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// Routes
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

/* =======================
   BASIC SAFETY CHECK
======================= */
if (!process.env.PORT) {
  console.error("❌ PORT not defined in environment variables");
  process.exit(1);
}

/* =======================
   MIDDLEWARES
======================= */
app.use(helmet({
  crossOriginResourcePolicy: false, // hosting proxy safe
}));

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* =======================
   STATIC FILES
======================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =======================
   DATABASE CONNECT
   ❌ NO process.exit(1)
======================= */
(async () => {
  try {
    await connectDB();
    console.log('🗄️ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
})();

/* =======================
   HEALTH CHECK (IMPORTANT)
======================= */
app.get('/res', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running successfully ✅',
    environment: process.env.NODE_ENV || 'production',
    uptime: `${process.uptime().toFixed(2)} seconds`,
    timestamp: new Date().toISOString()
  });
});

/* =======================
   API ROUTES
======================= */
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
app.use('/api/employees', employeeRoutes);
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

// Club APIs
app.use('/api/recharge', rechargeRoutes);
app.use('/api/dth', dthRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/bbps', bbpsRoutes);
app.use('/api/status', statusRoutes);

// Base route
app.use('/api', baseRoutes);

/* =======================
   ERROR HANDLERS
======================= */
app.use(notFound);
app.use(errorHandler);

/* =======================
   SERVER START
   (503 FIXED PART)
======================= */
const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Backend Server Started
🌐 Port: ${PORT}
📁 Uploads: /uploads
🔍 Health Check: /res
⏱️  Time: ${new Date().toLocaleString()}
----------------------------------
`);
});

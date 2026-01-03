import { Router } from 'express';
import QRCode from '../models/QRCode.js';
import { requireAdmin } from '../middlewares/adminAuth.js';
import { ok, fail } from '../utils/response.js';
import { deleteFromCloudinary } from '../services/cloudinary.js';

const router = Router();

// Get all QR codes (paginated)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'ALL', type = 'ALL' } = req.query;
    const query = {};
    if (status === 'ACTIVE') query.isActive = true;
    else if (status === 'INACTIVE') query.isActive = false;
    if (type !== 'ALL') query.type = type;

    const qrCodes = await QRCode.find(query)
      .populate('userId', 'name email mobile')
      .populate('virtualAccountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await QRCode.countDocuments(query);

    ok(res, { items: qrCodes, total });
  } catch (e) { next(e); }
});

// Get QR details
router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const qrCode = await QRCode.findById(req.params.id)
      .populate('userId', 'name email mobile')
      .populate('virtualAccountId');

    if (!qrCode) return fail(res, 'NOT_FOUND', 'QR code not found', 404);

    ok(res, qrCode);
  } catch (e) { next(e); }
});

// Deactivate QR
router.put('/:id/deactivate', requireAdmin, async (req, res, next) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) return fail(res, 'NOT_FOUND', 'QR code not found', 404);

    qrCode.isActive = false;
    await qrCode.save();

    ok(res, qrCode, 'QR code deactivated successfully');
  } catch (e) { next(e); }
});

// Delete QR (only if inactive)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) return fail(res, 'NOT_FOUND', 'QR code not found', 404);

    if (qrCode.isActive) {
      return fail(res, 'CANNOT_DELETE', 'Only inactive QR codes can be deleted', 400);
    }

    // Delete from Cloudinary if publicId exists
    if (qrCode.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(qrCode.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }

    await QRCode.findByIdAndDelete(req.params.id);

    ok(res, null, 'QR code deleted successfully');
  } catch (e) { next(e); }
});

export default router;

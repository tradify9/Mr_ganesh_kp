import express from 'express';
import Invoice from '../models/Invoice.js';
import { generateInvoicePDF, generateInvoiceCSV } from '../services/invoiceService.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// Get all invoices
router.get('/', adminAuth, async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('userId', 'name email mobile');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice
router.post('/', adminAuth, async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update invoice
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete invoice
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate PDF
router.get('/:id/pdf', adminAuth, async (req, res) => {
  try {
    const pdfBuffer = await generateInvoicePDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate CSV
router.get('/csv', adminAuth, async (req, res) => {
  try {
    const csv = await generateInvoiceCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

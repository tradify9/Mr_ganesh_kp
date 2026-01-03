import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';

export const generateInvoicePDF = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId).populate('userId', 'name email mobile');
  if (!invoice) throw new Error('Invoice not found');

  const doc = new PDFDocument();
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Header
  doc.fontSize(20).text('Khatu Pay Invoice', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${invoice.date.toDateString()}`);
  doc.text(`Due Date: ${invoice.dueDate ? invoice.dueDate.toDateString() : 'N/A'}`);
  doc.text(`Status: ${invoice.status}`);
  doc.moveDown();

  // User details
  doc.text(`Customer: ${invoice.userId.name}`);
  doc.text(`Email: ${invoice.userId.email}`);
  doc.text(`Mobile: ${invoice.userId.mobile}`);
  doc.moveDown();

  // Items table
  doc.text('Items:', { underline: true });
  doc.moveDown();
  invoice.items.forEach(item => {
    doc.text(`${item.description} - Qty: ${item.quantity} - Rate: ${item.rate} - Total: ${item.total}`);
  });
  doc.moveDown();

  // Total
  doc.fontSize(14).text(`Total Amount: ${invoice.amount}`, { align: 'right' });

  doc.end();
  return Buffer.concat(buffers);
};

export const generateInvoiceCSV = async () => {
  const invoices = await Invoice.find().populate('userId', 'name email mobile');
  const fields = ['invoiceNumber', 'userId.name', 'userId.email', 'amount', 'date', 'status'];
  const opts = { fields };
  const parser = new Parser(opts);
  const csv = parser.parse(invoices);
  return csv;
};

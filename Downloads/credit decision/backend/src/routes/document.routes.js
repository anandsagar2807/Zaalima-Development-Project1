const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, param, validationResult } = require('express-validator');
const { getPrismaClient, getMongoModels } = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const extractionService = require('../services/extractionService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const appDir = path.join(uploadDir, req.params.applicationId || 'temp');
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    cb(null, appDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, PNG, JPG, Excel, CSV'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// GET /documents/:applicationId - List documents for application
router.get('/:applicationId', authenticateToken, [
  param('applicationId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const prisma = getPrismaClient();
    const { Extraction } = getMongoModels();

    const documents = await prisma.document.findMany({
      where: { applicationId: req.params.applicationId },
      orderBy: { uploadedAt: 'desc' }
    });

    // Get extraction data from MongoDB
    const documentIds = documents.map(d => d.id);
    const extractions = await Extraction.find({
      _id: { $in: documentIds }
    });

    // Merge extraction data with documents
    const documentsWithExtractions = documents.map(doc => {
      const extraction = extractions.find(e => e._id === doc.id);
      return {
        ...doc,
        extraction: extraction ? {
          confidenceScore: extraction.confidenceScore,
          extractedData: extraction.extractedData,
          riskFlags: extraction.riskFlags
        } : null
      };
    });

    res.json({
      success: true,
      data: documentsWithExtractions
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' }
    });
  }
});

// GET /documents/:id - Get document details
router.get('/detail/:id', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const prisma = getPrismaClient();
    const { Extraction } = getMongoModels();

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        application: true,
        company: true
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      });
    }

    // Get extraction data
    const extraction = await Extraction.findById(req.params.id);

    res.json({
      success: true,
      data: {
        ...document,
        extraction
      }
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch document' }
    });
  }
});

// POST /documents/upload/:applicationId - Upload documents
router.post('/upload/:applicationId', authenticateToken, [
  param('applicationId').isString().notEmpty()
], upload.array('files', 10), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No files uploaded' }
      });
    }

    const prisma = getPrismaClient();
    const { applicationId } = req.params;
    const { documentTypes } = req.body; // JSON string of document types mapping

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { company: true }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    // Parse document types if provided
    let docTypeMap = {};
    try {
      docTypeMap = documentTypes ? JSON.parse(documentTypes) : {};
    } catch (e) {
      // Ignore parsing errors
    }

    const uploadedDocuments = [];

    for (const file of req.files) {
      const docType = docTypeMap[file.originalname] || 'UNKNOWN';

      const document = await prisma.document.create({
        data: {
          id: uuidv4(),
          applicationId,
          companyId: application.companyId,
          name: file.originalname,
          type: docType,
          mimeType: file.mimetype,
          filename: file.filename,
          s3Key: file.path, // Local path for now, can be S3 key later
          size: file.size,
          status: 'UPLOADED'
        }
      });

      uploadedDocuments.push(document);

      // Trigger async OCR processing (placeholder)
      triggerOCRProcessing(document.id, file.path, docType, applicationId, application.companyId);

      logger.info(`Document uploaded: ${document.id} for application: ${applicationId}`);
    }

    res.status(201).json({
      success: true,
      data: uploadedDocuments
    });
  } catch (error) {
    logger.error('Error uploading documents:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to upload documents' }
    });
  }
});

// POST /documents/:id/reprocess - Reprocess document
router.post('/:id/reprocess', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const prisma = getPrismaClient();

    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      });
    }

    // Update status to processing
    await prisma.document.update({
      where: { id: req.params.id },
      data: { status: 'PROCESSING' }
    });

    // Trigger OCR reprocessing
    triggerOCRProcessing(document.id, document.s3Key, document.type, document.applicationId, document.companyId);

    res.json({
      success: true,
      message: 'Document reprocessing initiated'
    });
  } catch (error) {
    logger.error('Error reprocessing document:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reprocess document' }
    });
  }
});

// GET /documents/:id/extraction - Get extracted data
router.get('/:id/extraction', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { Extraction } = getMongoModels();

    const extraction = await Extraction.findById(req.params.id);

    if (!extraction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Extraction data not found' }
      });
    }

    res.json({
      success: true,
      data: extraction
    });
  } catch (error) {
    logger.error('Error fetching extraction:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch extraction data' }
    });
  }
});

// DELETE /documents/:id - Delete document
router.delete('/:id', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const prisma = getPrismaClient();
    const { Extraction } = getMongoModels();

    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.s3Key)) {
      fs.unlinkSync(document.s3Key);
    }

    // Delete extraction data from MongoDB
    await Extraction.findByIdAndDelete(req.params.id);

    // Delete document record
    await prisma.document.delete({
      where: { id: req.params.id }
    });

    logger.info(`Document deleted: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' }
    });
  }
});

// GET /documents/:id/download - Download document
router.get('/:id/download', authenticateToken, [
  param('id').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const prisma = getPrismaClient();

    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      });
    }

    if (!fs.existsSync(document.s3Key)) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File not found on server' }
      });
    }

    res.download(document.s3Key, document.name);
  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to download document' }
    });
  }
});

// OCR Processing function (placeholder - would integrate with actual OCR service)
async function triggerOCRProcessing(documentId, filePath, documentType, applicationId, companyId) {
  try {
    logger.info(`Starting OCR processing for document: ${documentId}`);

    const prisma = getPrismaClient();
    const { Extraction } = getMongoModels();

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' }
    });

    // Use extraction service to parse document
    const extractionResult = await extractionService.extractFinancials(
      { path: filePath },
      documentType
    );

    // Map document type to extraction type
    const extractionData = extractionResult.data || {};

    // Save extraction to MongoDB
    const extraction = new Extraction({
      _id: documentId,
      applicationId,
      companyId,
      documentType,
      success: extractionResult.success,
      rawText: extractionResult.rawText || '',
      confidenceScore: extractionData.healthScore || extractionData.gstScore || extractionData.itrScore || extractionData.balanceSheetScore || 0.85,
      extractedData: extractionData,
      processingTime: extractionData.processingTime || 1500,
      extractionVersion: '2.0.0',
      financials: extractionData, // Store full extraction data
      createdAt: new Date()
    });

    await extraction.save();

    // Update document status to parsed
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'PARSED',
        extractionId: documentId,
        processedAt: new Date()
      }
    });

    logger.info(`OCR processing completed for document: ${documentId}`);
  } catch (error) {
    logger.error(`OCR processing failed for document: ${documentId}`, error);

    const prisma = getPrismaClient();
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FLAGGED', errorMessage: error.message }
    });
  }
}

module.exports = router;
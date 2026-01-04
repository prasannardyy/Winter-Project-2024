const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDocument, getMyDocuments, getAllPendingDocuments, updateVerificationStatus, getDocumentById } = require('../controllers/document.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Ensure absolute path for uploads to avoid CWD issues
// routes/ is in src/routes via __dirname. 
// We want backend/uploads.
// src/routes -> ../../uploads
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${Date.now()}-${cleanName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports images/pdf!'));
    }
});

router.post('/upload', verifyToken, upload.single('document'), uploadDocument);
router.get('/my-documents', verifyToken, getMyDocuments);
router.get('/:id', verifyToken, getDocumentById);

router.get('/pending', verifyToken, getAllPendingDocuments);
router.put('/:id/verify', verifyToken, updateVerificationStatus);

module.exports = router;

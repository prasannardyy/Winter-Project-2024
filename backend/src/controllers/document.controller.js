const Document = require('../models/Document');
const Tesseract = require('tesseract.js');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { docType } = req.body;
        const userId = req.user.id;

        // 1. Create Initial Record
        const newDoc = await Document.create({
            userId,
            type: docType || 'ID_PROOF',
            filePath: req.file.path,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            verificationStatus: 'PENDING',
            aiConfidence: 0.0,
        });

        res.status(201).json({
            message: 'Document uploaded. AI Analysis in progress...',
            documentId: newDoc.id,
            document: newDoc
        });

        // 2. Perform OCR and Verification (Background Process)
        setImmediate(async () => {
            console.log('[AI AGENT] Starting processing on ' + req.file.path + '...');

            try {
                // --- STEP A: Image Preprocessing ---
                // Load image, convert to greyscale, increase contrast to help OCR read text better
                const image = await Jimp.read(req.file.path);
                const processedPath = req.file.path + '_processed.jpg';

                await image
                    .greyscale()
                    .contrast(0.5)  // Increase contrast
                    .brightness(0.1)
                    .quality(100)
                    .writeAsync(processedPath);

                console.log('[AI AGENT] Image pre-processed at ' + processedPath);

                // --- STEP B: Run OCR on processed image ---
                const { data: { text } } = await Tesseract.recognize(
                    path.resolve(processedPath),
                    'eng', // Default to English
                    { logger: m => { } } // Silence trivial logs
                );

                // Cleanup temp file
                try { fs.unlinkSync(processedPath); } catch (e) { }

                console.log('[AI AGENT] OCR Text Length:', text.length);
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);

                // --- STEP C: SMART PARSING ---
                let detectedType = "Unknown ID";
                let idNumber = "Not Detected";
                let dob = null;
                let name = null;
                let score = 0.50; // Start neutral

                const upperText = text.toUpperCase();

                // 1. Detect Type based on Keywords
                if (upperText.includes("INCOME TAX") || upperText.includes("PERMANENT ACCOUNT") || upperText.includes("PAN CARD")) {
                    detectedType = "PAN Card";
                    score = 0.90;
                } else if (upperText.includes("AADHAAR") || upperText.includes("GOVT OF INDIA") || upperText.includes("UNIQUE IDENTIFICATION")) {
                    detectedType = "Aadhaar Card";
                    score = 0.90;
                } else if (upperText.includes("ELECTION") || upperText.includes("VOTER") || upperText.includes("IDENTITY CARD")) {
                    detectedType = "Voter ID";
                    score = 0.90;
                } else if (upperText.includes("DRIVING") || upperText.includes("LICENSE")) {
                    detectedType = "Driving License";
                    score = 0.90;
                }

                // 2. Extract Generic Key-Values (Very Robust)
                // We look for any line that looks like "Label: Value"
                const genericData = {};
                lines.forEach(line => {
                    // Fix common OCR colon errors: "Name ; John" or "Name . John" or "Name John"
                    // We look for known keys first

                    const keysOfInterest = ["NAME", "FATHER", "DOB", "DATE OF BIRTH", "ID NO", "NV", "ACCOUNT NO"];

                    keysOfInterest.forEach(key => {
                        if (line.toUpperCase().startsWith(key)) {
                            // Cleaning: Remove the key and any separator chars
                            let val = line.substring(key.length).replace(/^[^a-zA-Z0-9]+/, '').trim();
                            if (val.length > 2) {
                                genericData[key.toLowerCase().replace(/ /g, '_')] = val;

                                // Special handling
                                if (key === "NAME" && !name) name = val;
                                if ((key === "DOB" || key === "DATE OF BIRTH") && !dob) dob = val;
                            }
                        }
                    });
                });

                // 3. Regex for ID Numbers (Fallback if generic parsing missed it)
                // Pan: ABCDE1234F
                const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
                if (panMatch) { idNumber = panMatch[0]; if (detectedType === "Unknown ID") detectedType = "PAN Card"; }

                // Aadhaar: 12 digit (grouped or not)
                const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
                if (aadhaarMatch) { idNumber = aadhaarMatch[0]; if (detectedType === "Unknown ID") detectedType = "Aadhaar Card"; }

                // 4. Name extraction fallback (Line by line analysis)
                if (!name) {
                    // Heuristic: If we found "INCOME TAX", the next capitalized line might be the name
                    const nameIdx = lines.findIndex(l => l.toUpperCase().includes("NAME") || l.toUpperCase().includes("INCOME TAX"));
                    if (nameIdx !== -1 && lines[nameIdx + 1]) {
                        // Check if next line is uppercase text (common in IDs)
                        if (/^[A-Z\s.]+$/.test(lines[nameIdx + 1])) {
                            name = lines[nameIdx + 1];
                        }
                    }
                }

                // Consolidate Data
                if (idNumber !== "Not Detected") score += 0.1;
                if (name) score += 0.1;
                if (score > 1) score = 0.99;

                const status = score > 0.6 ? 'VERIFIED' : 'PENDING';

                const finalExtractedData = {
                    document_type: detectedType,
                    id_number: idNumber,
                    dob: dob || "Not Found",
                    name_guess: name || "Not Found",
                    ai_confidence: (score * 100).toFixed(0) + '%',
                    raw_text: text, // Keep raw text for debugging
                    ...genericData
                };

                await newDoc.update({
                    aiConfidence: score,
                    verificationStatus: status,
                    extractedData: finalExtractedData,
                    adminComments: 'Processed with Image Enhancement. Type: ' + detectedType
                });

                console.log('[AI AGENT] Success. Type: ' + detectedType + ', ID: ' + idNumber);

            } catch (err) {
                console.error('[AI AGENT] Processing Error:', err);
                await newDoc.update({ adminComments: "AI Processing Failed: " + err.message });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed' });
    }
};

const getMyDocuments = async (req, res) => {
    try {
        const docs = await Document.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

const getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Not found' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

const getAllPendingDocuments = async (req, res) => {
    try {
        const docs = await Document.findAll({
            where: { verificationStatus: ['PENDING', 'REJECTED'] },
            include: 'User',
            order: [['createdAt', 'DESC']]
        });
        res.json(docs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending documents' });
    }
};

const updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;

        const doc = await Document.findByPk(id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        await doc.update({
            verificationStatus: status,
            adminComments: comments
        });

        res.json({ message: 'Document marked as ' + status, document: doc });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

module.exports = { uploadDocument, getMyDocuments, getAllPendingDocuments, updateVerificationStatus, getDocumentById };

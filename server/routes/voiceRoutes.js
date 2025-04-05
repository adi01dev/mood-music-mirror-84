
const express = require('express');
const multer = require('multer');
const { convertSpeechToText, analyzeVoice } = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Set up multer for handling audio uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

router.post('/transcribe', upload.single('audio'), convertSpeechToText);
router.post('/analyze', upload.single('audio'), analyzeVoice);

module.exports = router;

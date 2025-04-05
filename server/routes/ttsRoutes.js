
const express = require('express');
const { generateVoiceFeedback, convertTextToSpeech } = require('../controllers/ttsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/feedback', generateVoiceFeedback);
router.post('/convert', convertTextToSpeech);

module.exports = router;

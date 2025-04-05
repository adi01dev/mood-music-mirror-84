
const express = require('express');
const { generateWeeklyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/weekly', generateWeeklyReport);

module.exports = router;


const express = require('express');
const { 
  getMoods, 
  getMood, 
  createMood, 
  updateMood, 
  deleteMood,
  analyzeVoiceMood
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMoods)
  .post(createMood);

router.route('/:id')
  .get(getMood)
  .put(updateMood)
  .delete(deleteMood);

router.post('/analyze', analyzeVoiceMood);

module.exports = router;

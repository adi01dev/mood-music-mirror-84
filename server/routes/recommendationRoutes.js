
const express = require('express');
const { 
  getRecommendations,
  getYouTubeVideos,
  getSpotifyPlaylists
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:moodCategory', getRecommendations);
router.get('/youtube/:moodCategory', getYouTubeVideos);
router.get('/spotify/:moodCategory', getSpotifyPlaylists);

module.exports = router;

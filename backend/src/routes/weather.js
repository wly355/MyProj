const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const auth = require('../middleware/auth');

router.get('/', auth, weatherController.getWeather);
router.get('/current', auth, weatherController.getCurrentWeather);
router.get('/forecast', auth, weatherController.getWeatherForecast);

module.exports = router;


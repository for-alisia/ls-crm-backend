const express = require('express');
const { check } = require('express-validator');

const newsCtrl = require('../../controllers/news-controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/news', auth, newsCtrl.getNews);
router.post('/news', auth, [check('title').not().isEmpty(), check('text').isLength({ min: 5 })], newsCtrl.createNews);
router.patch('/news/:id', auth, newsCtrl.updateNews);
router.delete('/news/:id', auth, newsCtrl.deleteNews);

module.exports = router;

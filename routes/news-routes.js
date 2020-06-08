const express = require('express');

const newsCtrl = require('../controllers/news-controller');

const router = express.Router();

router.get('/news', newsCtrl.getNews);
router.post('/news', newsCtrl.createNews);
router.patch('/news/:id', newsCtrl.updateNews);
router.delete('/news/:id', newsCtrl.deleteNews);

module.exports = router;

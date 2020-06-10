const express = require('express');

const authCtrl = require('../../controllers/auth-controller');

const router = express.Router();

router.post('/login', authCtrl.login);
router.post('/refresh-token', authCtrl.refreshToken);

module.exports = router;

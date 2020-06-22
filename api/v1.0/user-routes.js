const express = require('express');
const { check } = require('express-validator');

const userCtrl = require('../../controllers/user-controller');
const authCtrl = require('../../controllers/auth-controller');
const auth = require('../../middlewares/auth');
const fileUpload = require('../../middlewares/file-upload');
const resizeImg = require('../../middlewares/resize-img');

const router = express.Router();

router.post(
  '/registration',
  [check('username').not().isEmpty(), check('password').isLength({ min: 4 })],
  authCtrl.createUser
);
router.post('/login', authCtrl.login);
router.post('/refresh-token', authCtrl.refreshToken);

router.get('/profile', auth, userCtrl.getUser);
router.patch('/profile', auth, fileUpload.single('avatar'), resizeImg, userCtrl.updateUser);
router.delete('/users/:id', auth, userCtrl.softDeleteUser);
router.get('/users', auth, userCtrl.getAllUsers);
router.patch('/users/:id/permission', auth, userCtrl.updatePermission);

module.exports = router;

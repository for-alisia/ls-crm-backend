const express = require('express');
const { check } = require('express-validator');

const userCtrl = require('../../controllers/user-controller');

const router = express.Router();

router.post(
  '/registration',
  [check('username').not().isEmpty(), check('password').isLength({ min: 4 })],
  userCtrl.createUser
);
router.get('/profile', userCtrl.getUser);
router.patch('/profile', userCtrl.updateUser);
router.delete('/users/:id', userCtrl.deleteUser);
router.get('/users', userCtrl.getAllUsers);
router.patch('/users/:id/permission', userCtrl.updatePermission);
router.post('/login', userCtrl.login);
router.post('/refresh-token', userCtrl.refreshToken);

module.exports = router;

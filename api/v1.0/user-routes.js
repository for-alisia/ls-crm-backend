const express = require('express');

const userCtrl = require('../../controllers/user-controller');

const router = express.Router();

router.post('/registration', userCtrl.createUser);
router.get('/profile', userCtrl.getUser);
router.patch('/profile', userCtrl.updateUser);
router.delete('/users/:id', userCtrl.deleteUser);
router.get('/users', userCtrl.getAllUsers);
router.patch('/users/:id/permission', userCtrl.updatePermission);

module.exports = router;

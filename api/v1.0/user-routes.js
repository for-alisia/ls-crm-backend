const express = require("express");
const { check } = require("express-validator");

const userCtrl = require("../../controllers/user-controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.post(
  "/registration",
  [check("username").not().isEmpty(), check("password").isLength({ min: 4 })],
  userCtrl.createUser
);
router.get("/profile", auth, userCtrl.getUser);
router.patch("/profile", auth, userCtrl.updateUser);
router.delete("/users/:id", auth, userCtrl.deleteUser);
router.get("/users", auth, userCtrl.getAllUsers);
router.patch("/users/:id/permission", auth, userCtrl.updatePermission);
router.post("/login", userCtrl.login);
router.post("/refresh-token", userCtrl.refreshToken);

module.exports = router;

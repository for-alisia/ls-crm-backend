const express = require("express");
const { check } = require("express-validator");

const userCtrl = require("../../controllers/user-controller");
const auth = require("../../middlewares/auth");
const fileUpload = require("../../middlewares/file-upload");

const router = express.Router();

router.post(
  "/registration",
  [check("username").not().isEmpty(), check("password").isLength({ min: 4 })],
  userCtrl.createUser
);
router.post("/login", userCtrl.login);
router.post("/refresh-token", userCtrl.refreshToken);

router.get("/profile", auth, userCtrl.getUser);
router.patch(
  "/profile",
  auth,
  fileUpload.single("avatar"),
  userCtrl.updateUser
);
router.delete("/users/:id", auth, userCtrl.deleteUser);
router.get("/users", auth, userCtrl.getAllUsers);
router.patch("/users/:id/permission", auth, userCtrl.updatePermission);

module.exports = router;

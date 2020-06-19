const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const HttpError = require("../utils/http-error");
const { ERR_DATA, RESIZE } = require("../config");
const User = require("../models/user-model");
const News = require("../models/news-model");

// GET PROFILE (return user's obj without password and tokens)
const getUser = async (req, res, next) => {
  const { id } = res.locals.userData;
  let user;
  // Get user from DB
  try {
    user = await User.findOne({ _id: id }, "-tokens -password");
  } catch (err) {
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }
  // If user doesn't exist
  if (!user) {
    return next(new HttpError(ERR_DATA.no_user.message, ERR_DATA.no_user.status));
  }
  // If user exists
  res.send(user);
};

// UPDATE PROFILE INFO (return updated user's profile)
const updateUser = async (req, res, next) => {
  const { id } = res.locals.userData;
  const { firstName, middleName, surName, oldPassword, newPassword } = req.body;
  let image = req.file ? req.file.path : null;
  let user;
  // Check if the user exists
  try {
    user = await User.findOne({ _id: id }, "-tokens");
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }

  if (!user) {
    return next(new HttpError(ERR_DATA.no_user.message, ERR_DATA.no_user.status));
  }
  // If user wants to change password, check if the old password is valid
  if (newPassword) {
    isValidPassword = await user.checkPassword(oldPassword);

    if (!isValidPassword.result) {
      return next(new HttpError(isValidPassword.msg, isValidPassword.status));
    }

    if (!isValidPassword) {
      return next(new HttpError(ERR_DATA.invalid_credentials.message, ERR_DATA.invalid_credentials.status));
    }
    user.password = newPassword;
  }
  // If user wants to change avatar, resize it, save, delete the old one
  if (image) {
    const newImage = path.join("uploads", "images", req.file.filename);
    sharp(image)
      .resize(RESIZE.w, RESIZE.h)
      .toFile(newImage, (err) => {
        if (err) {
          console.log(err);
        } else {
          fs.unlink(image, () => {});
          if (user.image) {
            fs.unlink(user.image, () => {});
          }
          user.image = newImage;
        }
      });
  }
  // Save other fields
  user.firstName = firstName || user.firstName;
  user.middleName = middleName || user.middleName;
  user.surName = surName || user.surName;
  // Save all changes in DB
  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.update_failed.message, ERR_DATA.update_failed.status));
  }

  res.send(user);
};

// DELETE USER (return ?)
const deleteUser = async (req, res, next) => {
  const { id: deletedUserId } = req.params;
  const { id } = res.locals.userData;
  const permissionType = {
    type: "settings",
    operation: "D",
  };
  let userToDelete, user, news;
  // Check if the deleted user exists and user is allowed to delete users
  try {
    userToDelete = await User.findById(deletedUserId);
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }
  if (!userToDelete) {
    return next(new HttpError(ERR_DATA.no_user.message, ERR_DATA.no_user.status));
  }
  try {
    const validateUser = await User.checkProvidedUser(id, permissionType);
    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
    user = validateUser.user;
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.no_check.message, ERR_DATA.no_check.status));
  }
  // Remove all news, created by the deleted user
  try {
    news = await News.find({ user: deletedUserId });
    news.forEach((item) => item.remove());
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.delete_failed.message, ERR_DATA.delete_failed.status));
  }
  // Remove avatar of the deleted user
  if (userToDelete.image) {
    fs.unlink(userToDelete.image, (err) => {
      console.log(err);
    });
  }
  // Remove user
  try {
    await userToDelete.remove();
  } catch (err) {
    return next(new HttpError(ERR_DATA.delete_failed.message, ERR_DATA.delete_failed.status));
  }
  //TODO: ?Что послать клиенту?
  res.send("OK");
};

// GET LIST OF ALL USERS (return user's list for authenticated users)
const getAllUsers = async (req, res, next) => {
  const { id } = res.locals.userData;
  const permissionType = {
    type: "settings",
    operation: "R",
  };
  let users, user;
  // Check if user has permission to get all users
  try {
    const validateUser = await User.checkProvidedUser(id, permissionType);
    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
    user = validateUser.user;
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.no_check.message, ERR_DATA.no_check.status));
  }
  // Get all users from DB
  try {
    users = await User.find({}, "-password -tokens");
  } catch (err) {
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }

  res.send(users.map((u) => u.toObject({ getters: true })));
};

// UPDATE PERMISSION (return ?)
const updatePermission = async (req, res, next) => {
  const { id } = res.locals.userData;
  const { id: updatedUserId } = req.params;
  const { permission } = req.body;
  const permissionType = {
    type: "settings",
    operation: "U",
  };
  let user, updatedUser;
  // Check if user exists and he has a permission to do this
  try {
    const validateUser = await User.checkProvidedUser(id, permissionType);

    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }

    user = validateUser.user;
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.no_check.message, ERR_DATA.no_check.status));
  }
  // Find an updated user
  try {
    updatedUser = await User.findOne({ _id: updatedUserId }, "-tokens -password");
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }

  if (!updatedUser) {
    return next(new HttpError(ERR_DATA.no_user.message, ERR_DATA.no_user.status));
  }

  updatedUser.permission = permission;
  // Save updated user in DB
  try {
    await updatedUser.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.update_failed.message, ERR_DATA.update_failed.status));
  }

  res.send(updatedUser);
};

exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
exports.updatePermission = updatePermission;

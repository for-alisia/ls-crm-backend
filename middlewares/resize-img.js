const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const { RESIZE, ERR_DATA } = require('../config');
const HttpError = require('../utils/http-error');

module.exports = async (req, res, next) => {
  const image = req.file ? req.file.path : null;

  if (image) {
    const newImage = path.join('uploads', 'images', req.file.filename);
    try {
      await sharp(image).resize(RESIZE.w, RESIZE.h).toFile(newImage);
      res.locals.userImage = newImage;
      fs.unlink(image, () => {});
      next();
    } catch (err) {
      console.log(err);
      return next(new HttpError(ERR_DATA.no_img.message, ERR_DATA.no_img.status));
    }
  } else {
    next();
  }
};

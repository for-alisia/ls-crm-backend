const multer = require('multer');
const uuid = require('uuid').v4;

const { MIME_TYPE_MAP, IMG_LIMIT, ERR_DATA } = require('../config');
const HttpError = require('../utils/http-error');

const fileUpload = multer({
  limits: IMG_LIMIT,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/temp');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${uuid()}.${ext}`);
    },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      const error = isValid ? null : new HttpError(ERR_DATA.no_mime.message, ERR_DATA.no_mime.status);
      cb(error, isValid);
    },
  }),
});

module.exports = fileUpload;

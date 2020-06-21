const { validationResult } = require('express-validator');

const HttpError = require('../utils/http-error');
const News = require('../models/news-model');
const User = require('../models/user-model');
const { ERR_DATA } = require('../config');

// GET ALL NEWS (return news list)
const getNews = async (req, res, next) => {
  let responseList;
  try {
    const newsList = await News.find({});
    responseList = await generateResponseList(newsList);
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.get_data.message, ERR_DATA.get_data.status));
  }

  res.send(responseList);
};

// CREATE NEWS (return updated news list)
const createNews = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(ERR_DATA.invalid_inputs.message, ERR_DATA.invalid_inputs.status));
  }

  const { text, title } = req.body;
  const { id } = res.locals.userData;

  const permissionType = {
    type: 'news',
    operation: 'C',
  };

  let responseList;
  // Check user and his permissions
  try {
    const validateUser = await User.checkProvidedUser(id, permissionType);

    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.no_check.message, ERR_DATA.no_check.status));
  }
  // Create news
  const news = new News({
    title,
    text,
    user: id,
  });
  // Save news in DB
  try {
    await news.save();

    const newsList = await News.find({});
    responseList = await generateResponseList(newsList);
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.creation_failed.message, ERR_DATA.creation_failed.status));
  }

  res.send(responseList);
};

// UPDATE NEWS (return updated news list)
const updateNews = async (req, res, next) => {
  const { id: newsId } = req.params;
  const { id: userId } = res.locals.userData;
  const { text, title } = req.body;
  const permissionType = {
    type: 'news',
    operation: 'U',
  };
  let news, responseList;
  // Check user and his permissions
  try {
    const validateUser = await User.checkProvidedUser(userId, permissionType);

    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.no_check.message, ERR_DATA.no_check.status));
  }
  // Update news and save it
  try {
    news = await News.findById(newsId);

    news.title = title;
    news.text = text;

    await news.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.update_failed.message, ERR_DATA.update_failed.status));
  }

  try {
    const newsList = await News.find({});
    responseList = await generateResponseList(newsList);
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.get_data.message, ERR_DATA.get_data.status));
  }

  res.send(responseList);
};

// DELETE NEWS (return updated news list)
const deleteNews = async (req, res, next) => {
  const { id: newsId } = req.params;
  const { id: userId } = res.locals.userData;
  const permissionType = {
    type: 'news',
    operation: 'D',
  };
  let news, responseList;
  // Check user
  try {
    const validateUser = await User.checkProvidedUser(userId, permissionType);

    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.no_check.message, ERR_DATA.no_check.status));
  }
  // Delete news
  try {
    news = await News.findById(newsId);
    await news.remove();
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.delete_failed.message, ERR_DATA.delete_failed.status));
  }

  try {
    const newsList = await News.find({});
    responseList = await generateResponseList(newsList);
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.get_data.message, ERR_DATA.get_data.status));
  }

  res.send(responseList);
};

// Configure response object
async function generateResponseNews(news) {
  try {
    const user = await User.findOne({ _id: news.user }, '-password -tokens');

    return {
      id: news.id,
      text: news.text,
      title: news.title,
      created_at: news.created,
      user,
    };
  } catch (err) {
    throw new Error("Can't find a user");
  }
}
// Configure response list
async function generateResponseList(list) {
  return Promise.all(list.map((item) => generateResponseNews(item)));
}

exports.getNews = getNews;
exports.createNews = createNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;

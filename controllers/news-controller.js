const { validationResult } = require("express-validator");

const HttpError = require("../utils/http-error");
const News = require("../models/news-model");
const User = require("../models/user-model");

// GET ALL NEWS (return news list)
const getNews = async (req, res, next) => {
  try {
    const newsList = await News.find({});
    const responseList = await generateResponseList(newsList);

    res.send(responseList);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't retrieve news list from database", 500));
  }
};

// CREATE NEWS (return updated news list)
const createNews = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check your data", 422));
  }

  const { text, title } = req.body;
  const { id } = res.locals.userData;

  const permissionType = {
    type: "news",
    operation: "C",
  };
  // Check user and his permissions
  try {
    const validateUser = await User.checkProvidedUser(id, permissionType);

    if (validateUser.result === "Error") {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't check user", 500));
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
    const responseList = await generateResponseList(newsList);

    res.send(responseList);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't create news", 500));
  }
};

// UPDATE NEWS (return updated news list)
const updateNews = async (req, res, next) => {
  const { id: newsId } = req.params;
  const { id: userId } = res.locals.userData;
  const { text, title } = req.body;
  const permissionType = {
    type: "news",
    operation: "U",
  };
  let news;
  // Check user and his permissions
  try {
    const validateUser = await User.checkProvidedUser(userId, permissionType);

    if (validateUser.result === "Error") {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't check user", 500));
  }
  // Update news and save it
  try {
    news = await News.findById(newsId);
    news.title = title;
    news.text = text;
    await news.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't update news, please try again", 500));
  }

  try {
    const newsList = await News.find({});
    const responseList = await generateResponseList(newsList);

    res.send(responseList);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't return news, please try again", 500));
  }
};

// DELETE NEWS (return updated news list)
const deleteNews = async (req, res, next) => {
  const { id: newsId } = req.params;
  const { id: userId } = res.locals.userData;
  const permissionType = {
    type: "news",
    operation: "D",
  };
  let news;
  // Check user
  try {
    const validateUser = await User.checkProvidedUser(userId, permissionType);

    if (validateUser.result === "Error") {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't check user", 500));
  }
  // Delete news
  try {
    news = await News.findById(newsId);
    await news.remove();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't delete news, please try again", 500));
  }

  try {
    const newsList = await News.find({});
    const responseList = await generateResponseList(newsList);

    res.send(responseList);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Can't return news, please try again", 500));
  }
};

// Configure response object
async function generateResponseNews(news) {
  try {
    const user = await User.findOne({ _id: news.user }, "-password -tokens");

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

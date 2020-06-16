const { validationResult } = require("express-validator");

const HttpError = require("../utils/http-error");
const News = require("../models/news-model");
const User = require("../models/user-model");

const getNews = async (req, res, next) => {
  res.send("News got");
};
const createNews = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check your data", 422));
  }

  const { text, title } = req.body;
  const { id } = res.locals.userData;

  const news = new News({
    title,
    text,
    user: id,
  });

  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    return next(new HttpError("Connection failed", 500));
  }

  if (!user) {
    return next(
      new HttpError("We can not find a user with the provided ID", 404)
    );
  }

  try {
    await news.save();

    const newsResponse = await generateResponseNews(news);

    res.send(newsResponse);
  } catch (err) {
    return next(new HttpError("Creation failed, please try again", 500));
  }
};
const updateNews = async (req, res, next) => {
  res.send("News updated");
};
const deleteNews = async (req, res, next) => {
  res.send("News deleted");
};

// Configure response object
const generateResponseNews = async (news) => {
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
    throw new Error("Could't find a user");
  }
};

exports.getNews = getNews;
exports.createNews = createNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;

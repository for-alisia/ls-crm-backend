const getNews = async (req, res, next) => {
  res.send('News got');
};
const createNews = async (req, res, next) => {
  res.send('News created');
};
const updateNews = async (req, res, next) => {
  res.send('News updated');
};
const deleteNews = async (req, res, next) => {
  res.send('News deleted');
};

exports.getNews = getNews;
exports.createNews = createNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;

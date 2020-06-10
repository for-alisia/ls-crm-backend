const login = async (req, res, next) => {
  res.send('User signed in');
};
const refreshToken = async (req, res, next) => {
  res.send('Token refreshed');
};

exports.login = login;
exports.refreshToken = refreshToken;

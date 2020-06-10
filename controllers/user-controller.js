const createUser = async (req, res, next) => {
  res.send('User created');
};
const getUser = async (req, res, next) => {
  res.send('User object');
};
const updateUser = async (req, res, next) => {
  res.send('User updated');
};
const deleteUser = async (req, res, next) => {
  res.send('User deleted');
};
const getAllUsers = async (req, res, next) => {
  res.send('Users got');
};
const updatePermission = async (req, res, next) => {
  res.send('Permissions updated');
};

exports.createUser = createUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
exports.updatePermission = updatePermission;

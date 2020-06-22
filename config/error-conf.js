module.exports = {
  not_found: {
    status: 404,
    message: 'Page not found',
  },
  unknown: {
    status: 500,
    message: 'Unknown interval error, please try again',
  },
  invalid_inputs: {
    status: 422,
    message: 'Invalid inputs are passed, please check your data',
  },
  creation_failed: {
    status: 500,
    message: "Can't create data, please try again",
  },
  user_exists: {
    status: 422,
    message: 'User already exists, sign in or choose another username',
  },
  interval: {
    status: 500,
    message: 'Interval server error, please try again',
  },
  no_user: {
    status: 404,
    message: "User with provided ID doesn't exist",
  },
  invalid_credentials: {
    status: 403,
    message: 'Invalid credentials, please check your data',
  },
  update_failed: {
    status: 500,
    message: "Can't update data, please try again",
  },
  delete_failed: {
    status: 500,
    message: "Can't delete data, please try again",
  },
  no_check: {
    status: 500,
    message: "Can't check your permissions, please try again",
  },
  no_permission: {
    status: 403,
    message: 'You are not allowed to do this',
  },
  no_mime: {
    status: 422,
    message: 'Invalid mime-type, please choose another image',
  },
  get_data: {
    status: 500,
    message: "Can't retrieve data, please try again",
  },
  no_img: {
    status: 500,
    message: "Cant't save image, please try again",
  },
};

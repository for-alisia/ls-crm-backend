/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../../../models/user-model');

describe('User.generateAccessToken', () => {
  const payload = { _id: new mongoose.Types.ObjectId() };
  const user = new User(payload);

  it('returns object with 2 keys', async () => {
    const token = await user.generateAccessToken();

    expect(token.accessTokenExpiredAt).toBeTruthy();
    expect(token.accessToken).toBeTruthy();
  });

  it('returns a valid JWT token with provided ID in payload', async () => {
    const token = await user.generateAccessToken();
    const decodedToken = await jwt.verify(token.accessToken, process.env.SECRET);

    expect(decodedToken).toHaveProperty('id', payload._id.toHexString());
  });

  it('returns an expire time', async () => {
    const token = await user.generateAccessToken();

    expect(typeof token.accessTokenExpiredAt).toBe('number');
  });
});

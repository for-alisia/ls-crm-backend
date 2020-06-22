/* eslint-disable no-undef */
const request = require('supertest');

const User = require('../../models/user-model');

let server;

describe('auth controllers', () => {
  beforeEach(() => {
    server = require('../../app');
  });
  afterEach(() => {
    server.close();
  });

  describe('registration of a new user', () => {
    const payload = { username: 'test', password: 'test' };

    it('returns 422 if payload are not provided', async () => {
      const res = await request(server).post('/api/registration');

      expect(res.status).toBe(422);
    });

    it('returns correct user on correct request', async () => {
      const res = await request(server).post('/api/registration').send(payload);

      expect(res.status).toBe(200);

      const userToDelete = await User.findOne({ username: payload.username });

      if (userToDelete) {
        await userToDelete.remove();
      }
    });
  });
});

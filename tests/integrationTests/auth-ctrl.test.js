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
    it('returns 422 if payload are not provided', async () => {
      const res = await request(server).post('/api/registration');

      expect(res.status).toBe(422);
    });

    it('returns 422 if payload are not provided', async () => {
      const res = await request(server).post('/api/registration').send({ username: 'test1', password: 'test' });

      expect(res.status).toBe(200);
    });

    // it("returns correct user's object in the response", async () => {});
  });
});

const { assert } = require('chai');

const {
  generateRandomString,
  findUserByEmail,
} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('generateRandomString', function() {
  it('should generate a random string of 6 characters', function() {
    const characters = 6;
    assert.strictEqual((generateRandomString()).length, characters);
  });
});

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(findUserByEmail("user@example.com", testUsers), expectedOutput);
  });

  it('should return false when passed a non-existing email', function() {
    assert.strictEqual(findUserByEmail("doesnot@exist.com", testUsers), false);
  });
});
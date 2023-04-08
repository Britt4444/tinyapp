const { assert } = require('chai');

const { getUserByEmail, isValidUrl, returnUserID, urlsForUser } = require('../helpers.js');

// TEST OBJECTS

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

const testURLDatabase = {
  "2h4d7g": {
    longURL: "http://www.test.com",
    userID: "4hd82k",
  },
  "58fj7g": {
    longURL: "http://www.test3.com",
    userID: "4hd82k",
  },
  "2h6s7g": {
    longURL: "http://www.test2.com",
    userID: "8z444k",
  },
};

// getUserByEmail
describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined with invalid email', () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedUser = undefined;
    assert.equal(user, expectedUser);
  });
});

// isValidURL
describe('isValidURL', () => {
  it('should return true with valid URL', () => {
    const URL = "http://www.google.com";
    assert.equal(isValidUrl(URL), true);
  });
  it('should return false with invalid URL', () => {
    const URL = "haaaaaiiiiiii";
    assert.equal(isValidUrl(URL), false);
  });
});

// returnUserID
describe('returnUserID', () => {
  it('should return id for user in database', () => {
    const id = "userRandomID";
    assert.equal(returnUserID("user@example.com", testUsers), id);
  });
  it('should return undefined with user not in database', () => {
    const id = undefined;
    assert.equal(returnUserID("user3@example.com", testUsers), id);
  });
});

// urlsForUser
describe('urlsForUser', () => {
  it('should return URLs for specific userID', () => {
    const id = "4hd82k";
    const usersURLs = {
      "2h4d7g": {
        longURL: "http://www.test.com",
        userID: "4hd82k",
      },
      "58fj7g": {
        longURL: "http://www.test3.com",
        userID: "4hd82k",
      },
    };
    assert.deepEqual(urlsForUser(id, testURLDatabase), usersURLs);
  });
  it('should return {} with userid not in database', () => {
    const usersURLs = {};
    assert.deepEqual(urlsForUser("g8fj3s", testURLDatabase), usersURLs);
  });
});



///helper functions

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// checks for a valid URL in a string
const isValidUrl = (string) => {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
};

// returns userID from users database via user email
const returnUserID = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

// returns users database for individual user via email
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

// returns users database for individual user via userID
const urlsForUser = (userID, urlDatabase) => {
  let usersURLs = {};
  for (const tinyURL in urlDatabase) {
    if (urlDatabase[tinyURL].userID === userID) {
      usersURLs[tinyURL] = urlDatabase[tinyURL];
    }
  }
  return usersURLs;
};

module.exports = { generateRandomString, isValidUrl, returnUserID, getUserByEmail, urlsForUser };
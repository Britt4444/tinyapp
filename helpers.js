///helper functions

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isValidUrl = (string) => {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
};

const returnUserID = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

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
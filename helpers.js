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
  let url = '';
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
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
  console.log('userID: ', userID);
  console.log('urlDatabase', urlDatabase);
  for (const tinyURL in urlDatabase) {
    if (urlDatabase[tinyURL].userID === userID) {
      usersURLs[tinyURL] = urlDatabase[tinyURL];
    }
  }
  return usersURLs;
};

module.exports = { generateRandomString, isValidUrl, returnUserID, getUserByEmail, urlsForUser };
// Setup

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//CONSTANTS

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
};

const users = {};

app.set("view engine", "ejs");

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//GET routes

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['userID'];
  const usersURLs = urlsForUser(userID);
  if (!userID) {
    return res.status(401).send('Please log in or register new user');
  }
  const templateVars = {
    urls: usersURLs,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['userID'];
  if (!userID) {
    res.redirect("/login");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies['userID'];
  const tinyURL = req.params.id;
  if (!userID) {
    return res.status(401).send('Please log in to access this page');
  }
  if (urlDatabase[tinyURL]) {
    const templateVars = {
      id: tinyURL,
      longURL: urlDatabase[tinyURL].longURL,
      urlUserID: urlDatabase[tinyURL].userID, 
      user: users[userID],
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const tinyURL = req.params.id;
  if (!urlDatabase[tinyURL]) {
    return res.status(404).send('TinyURL does not exist in your database!');
  }
  const longURL = urlDatabase[tinyURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.cookies['userID'];
  if (req.cookies['userID']) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_register", templateVars);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.cookies['userID']) {
    res.redirect("/urls");
  }
  const userID = req.cookies['userID'];
  const templateVars = { user: users[userID] };
  res.render("urls_login", templateVars);
});

// POST routes

app.post("/urls", (req, res) => {
  const userID = req.cookies['userID'];
  const longURL = req.body.longURL.trim();
  if (!userID) {
    return res.status(401).send('Must be logged in to create new URLs');
  }
  if (isValidUrl(longURL) === false) {
    return res.status(400).send('Please enter a valid URL!');
  }
  const tinyURL = generateRandomString();
  urlDatabase[tinyURL] = {
    longURL: longURL,
    userID: userID,
  };
  res.redirect(`/urls/${tinyURL}`);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  if (email === '' || password === '') {
    return res.status(401).send('Please enter valid credentials');
  }
  if (getUserByEmail(email, users) !== null) {
    return res.status(401).send('Email is already registered');
  }
  users[userID] = { id: userID, email: email, password: password };
  res.cookie('userID', userID);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies['userID'];
  const tinyURL = req.params.id;
  if (!userID) {
    return res.status(401).send('Must be logged in to access this feature');
  } else if (!urlDatabase.hasOwnProperty(tinyURL)) {
    return res.status(404).send('TinyURL does not exist!');
  } else if (userID !== urlDatabase[tinyURL].userID) {
    return res.status(403).send('Request not authorized');
  } else {
    delete urlDatabase[tinyURL];
    res.redirect('/urls');
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies['userID'];
  const tinyURL = req.params.id;
  const longURL = req.body.longURL.trim();
  if (!userID) {
    return res.status(401).send('Must be logged in to access this feature');
  } else if (!urlDatabase.hasOwnProperty(tinyURL)) {
    return res.status(404).send('TinyURL does not exist!');
  } else if (userID !== urlDatabase[tinyURL].userID) {
    return res.status(403).send('Request not authorized');
  } else {
    urlDatabase[tinyURL].longURL = longURL;
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const client = getUserByEmail(email, users);
  if (!client) {
    return res.status(401).send('User not found!');
  } else if (client && client.password === password) { 
    const userID = returnUserID(email, users);
    res.cookie('userID', userID);
    res.redirect('/urls');
  } else {
    return res.status(401).send('Invalid login credentials');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/login');
});

// Listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


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

const returnUserID = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const getUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let usersURLs = {};
  for (const tinyURL in urlDatabase) {
    if (urlDatabase[tinyURL].userID === id) {
      usersURLs[tinyURL] = urlDatabase[tinyURL];
    }
  }
  return usersURLs;
};
// Setup

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//CONSTANTS

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinsosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
  const templateVars = {
    urls: urlDatabase,
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
  console.log('userID');
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userID],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const tinyURL = req.params.id;
  if (!urlDatabase[tinyURL]) {
    return res.status(404).send('TinyURL does not exist');
  }
  const longURL = urlDatabase[tinyURL];
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
  if (!userID) {
    return res.status(401).send('Must be logged in to create new URLs');
  }
  if (isValidUrl(req.body.longURL) === false) {
    return res.status(400).send('Please enter a valid URL!');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (req.body.email.trim() === '' || req.body.password.trim() === '') {
    return res.status(400).send('Please enter valid credentials');
  }
  if (getUserByEmail(req.body.email, users) !== null) {
    return res.status(400).send('Email is already registered');
  }
  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
  res.cookie('userID', userID);
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const client = getUserByEmail(req.body.email, users);
  if (!client) {
    return res.status(403).send('User not found!');
  } else if (client && client.password === req.body.password) { 
    const userID = returnUserID(req.body.email, users);
    res.cookie('userID', userID);
    res.redirect('/urls');
  } else {
    return res.status(403).send('Invalid login credentials');
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
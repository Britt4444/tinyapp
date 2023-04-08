// REQUIREMENTS
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const { generateRandomString, isValidUrl, returnUserID, getUserByEmail, urlsForUser } = require('./helpers');
const PORT = 8080;

// DATABASES
const urlDatabase = {};
const users = {};

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString(), generateRandomString()],
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

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
  const userID = req.session.userID;
  const usersURLs = urlsForUser(userID, urlDatabase);
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
  const userID = req.session.userID;
  if (!userID) {
    res.redirect("/login");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
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
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_login", templateVars);
});

// POST routes

app.post("/urls", (req, res) => {
  const userID = req.session.userID;
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    return res.status(401).send('Please enter valid credentials');
  }
  if (getUserByEmail(email, users) !== null) {
    return res.status(401).send('Email is already registered');
  }
  users[userID] = { id: userID, email: email, password: hashedPassword };
  req.session.userID = userID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const client = getUserByEmail(email, users);
  if (!client) {
    return res.status(401).send('User not found!');
  } else if (client && bcrypt.compareSync(password, hashedPassword)) {
    const userID = returnUserID(email, users);
    req.session.userID = userID;
    res.redirect('/urls');
  } else {
    return res.status(401).send('Invalid login credentials');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.put("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const tinyURL = req.params.id;
  const longURL = req.body.longURL.trim();
  if (!userID) {
    return res.status(401).send('Must be logged in to access this feature');
  } else if (!(Object.prototype.hasOwnProperty.call(urlDatabase, tinyURL))) {
    return res.status(404).send('TinyURL does not exist!');
  } else if (userID !== urlDatabase[tinyURL].userID) {
    return res.status(403).send('Request not authorized');
  } else {
    urlDatabase[tinyURL].longURL = longURL;
    res.redirect('/urls');
  }
});

app.delete("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const tinyURL = req.params.id;
  if (!userID) {
    return res.status(401).send('Must be logged in to access this feature');
  } else if ((Object.prototype.hasOwnProperty.call(urlDatabase, tinyURL))) {
    return res.status(404).send('TinyURL does not exist!');
  } else if (userID !== urlDatabase[tinyURL].userID) {
    return res.status(403).send('Request not authorized');
  } else {
    delete urlDatabase[tinyURL];
    res.redirect('/urls');
  }
});

// Listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
// REQUIREMENTS
const express = require("express");
const app = express();

const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const methodOverride = require('method-override');

const { generateRandomString, isValidUrl, returnUserID, getUserByEmail, urlsForUser } = require('./helpers');
const { urlDatabase, users } = require('./database');

//PORT
const PORT = 8080;


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
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

//render My URLs page
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

// Render Create New URLs page
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect("/login");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

// POST request to generate new TinyURL and add to urlDatabase
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

// render urls_show to display TinyURL card if TinyURL exists and was created by user
app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const tinyURL = req.params.id;
  if (!userID) {
    return res.status(401).send('Please log in to access this page');
  } else if (!(Object.prototype.hasOwnProperty.call(urlDatabase, tinyURL))) {
    return res.status(404).send('TinyURL does not exist!');
  } else if (userID !== urlDatabase[tinyURL].userID) {
    return res.status(403).send('Request not authorized');
  } else {
    const templateVars = {
      id: tinyURL,
      longURL: urlDatabase[tinyURL].longURL,
      urlUserID: urlDatabase[tinyURL].userID,
      user: users[userID],
    };
    res.render("urls_show", templateVars);
  }
});

// redirect to longURL page if TinyURL was created by user
app.get("/u/:id", (req, res) => {
  const tinyURL = req.params.id;
  if (!urlDatabase[tinyURL]) {
    return res.status(404).send('TinyURL does not exist in your database!');
  }
  const longURL = urlDatabase[tinyURL].longURL;
  res.redirect(longURL);
});

// AUTHORIZATION ROUTES

// Render registration page
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_register", templateVars);
});

// Render login page
app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_login", templateVars);
});

// register new user and assign to users database, storing hashed password
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

// compare login info to registration information stored in users database
app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const client = getUserByEmail(email, users);
  if (!client) {
    return res.status(401).send('User not found!');
  } else if (client && bcrypt.compareSync(password, client.password)) {
    const userID = returnUserID(email, users);
    req.session.userID = userID;
    res.redirect('/urls');
  } else {
    return res.status(401).send('Invalid login credentials');
  }
});

// logout and clear cookie session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// METHOD-OVERRIDE; PUT/DELETE ROUTES

// PUT request to edit longURL associated with TinyURL if it exists in urlDatabase and is owned by user
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

// DELETE request to remove TinyURL from urlDatabase if it exists and is owned by user
app.delete("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const tinyURL = req.params.id;
  if (!userID) {
    return res.status(401).send('Must be logged in to access this feature');
  } else if (!(Object.prototype.hasOwnProperty.call(urlDatabase, tinyURL))) {
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
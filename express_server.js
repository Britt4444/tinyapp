const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
//default port
const PORT = 8080;

app.set("view engine", "ejs");

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

//must come before all routes; converts req body from buffer to string, then adds to req.body
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

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
  // define longURL
  const longURL = urlDatabase[req.params.id];
  // redirect to longURL page
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.cookies['userID'];
  const templateVars = { user: users[userID] };
  res.render("urls_register", templateVars);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (isValidUrl(req.body.longURL) === false) {
    return res.status(400).end('Please enter a valid URL!');
  }
  //create new shortURL
  const shortURL = generateRandomString();
  //assign shortURL key/value pair to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  //redirect to new id path
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const userID = req.cookies['userID'];
  const templateVars = { user: users[userID] };
  res.render("urls_login", templateVars);
  res.redirect("/urls");
})

//POST add user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).end('Please enter valid email and password');
  }
  if (getUserByEmail(req.body.email, users) !== null) {
    return res.status(400).end('Email is already registered');
  }
  users[userID] = { id: userID, email: req.body.email, password: req.body.password };
  res.cookie('userID', userID);
  res.redirect("/urls");
});

//post method to delete url ids
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//post method to edit urls
app.post("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect('/urls');
});

//post login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = returnUserID(email, users);
  res.cookie('userID', userID);
  res.redirect('/urls');
});

//post logout
app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

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
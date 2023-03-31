const express = require("express");
const app = express();
//default port
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

//must come before all routes; converts req body from buffer to string, then adds to req.body
app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // define longURL
  const longURL = urlDatabase[req.params.id];
  // redirect to longURL page
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  //create new shortURL
  const shortURL = generateRandomString();
  //assign shortURL key/value pair to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  //redirect to new id path
  res.redirect(`/urls/${shortURL}`);
});

//post method to delete url ids
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//post method to edit urls
app.post("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  urlDatabase[tinyURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
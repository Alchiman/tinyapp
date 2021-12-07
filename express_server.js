const express = require("express");

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

const { generateRandomString, getUserByEmail, userAuth } = require("./helpers");

const { listOfUsers, urlDatabase } = require("./dataBase");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    secret: "still-learning",

    maxAge: 24 * 60 * 60 * 1000,
  })
);
const PORT = process.env.PORT || 8080;

// ============================================GETS============================================

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user_id: user_id,
    user: listOfUsers[user_id],
    urls: urlDatabase[user_id],
  };

  if (user_id) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: listOfUsers,
  };

  if (req.session.user_id) {
    return res.redirect("/urls/");
  }
  res.render("login", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

// handles the main page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user_id: user_id,
    user: listOfUsers[user_id],
    urls: urlDatabase,
  };

  if (user_id) {
    return res.render("urls_index", templateVars);
  }

  res.redirect("/login");
});

// create new url route
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    const templateVars = {
      user_id: user_id,
      user: listOfUsers[user_id],
      urls: urlDatabase[user_id],
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// user can read and edit details of short url
app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;

  if (
    urlDatabase[req.params.id] &&
    req.session.user_id === urlDatabase[req.params.id].userID
  ) {
    const templateVars = {
      user_id: user_id,
      user: listOfUsers[user_id],
      urls: urlDatabase[user_id],
      shortURL: req.params.id,
      fullURL: urlDatabase[req.params.id].longURL,
    };
    res.render("urls_show", templateVars);
  }

  // handles the case if the shortURL does not exist
  if (!urlDatabase[req.params.id]) {
    return res
      .status(404)
      .send("Sorry, the URL you are looking for does not exist");
  }

  // handles the case when the user does not own the shortURL
  res.status(403).send("Sorry, you do not own this shortURL");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (longURL == undefined) {
    return res.status(404).send("the link you are looking for does not exist");
  }

  res.redirect(longURL);
});
// ============================================POSTS===========================================

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const { email, password } = req.body;
  const templateVars = {
    user_id: req.session.user_id,
    user: listOfUsers,
  };

  if (getUserByEmail(email, listOfUsers)) {
    return res.status(400).send("Use another email");
  }

  if (email === "" || password === "") {
    return res.status(400).send("page not found");
  }
  listOfUsers[randomID] = {
    id: randomID,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  req.session.user_id = randomID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = userAuth(email, password, listOfUsers);

  if (!email || !password) {
    return res.status(403).send("your password/email field is empty");
  }

  if (!userId) {
    return res.status(403).send("the password/email you entered is wrong! ");
  }
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// this endpoint handles posts for newURLS
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    return res.redirect(`/urls/${shortURL}`);
  }
  res.status(400).send("please login!");
});

//updates the URL resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  if (longURL.length > 0) {
    if (userID === urlDatabase[shortURL].userID) {
      urlDatabase[req.params.shortURL].longURL = longURL;
      return res.redirect("/urls");
    }

    res.status(400).send("You do not have permission to edit this URL");
  }
});

// handles deleting a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!userID) {
    res.status(400).send("you need to login to delete this url");
  }
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  res.status(400).send("You don't have permission to delete this URL");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const express = require("express");
// const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

const {
  emailExists,
  generateRandomString,
  getUserByEmail,
  userAuth,
  urlsForUser,
} = require("./helpers");

const { listOfUsers, urlDatabase } = require("./dataBase");

const app = express();

app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    secret: "still-learning",

    maxAge: 24 * 60 * 60 * 1000,
  })
);
const PORT = 8080;

// ============================================
// get requests here except for the weird ones

app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    user_id: req.session.user_id,
    user: listOfUsers,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: listOfUsers,
  };
  if (req.session.user_id) {
    res.redirect("/urls/");
  } else {
    res.render("login", templateVars);
  }
});

// this is the home endpoint
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log(req.session.user_id);
  console.log(urlDatabase);
  const templateVars = {
    user_id: req.session.user_id,
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };

  if (templateVars.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// endpoint for creating new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    users: listOfUsers,
  };
  if (templateVars.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].longURL,
    user_id: req.session.user_id,
    user: listOfUsers,
  };

  if (urlDatabase[req.params.id] && req.session.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls/new");
  }
});

// end of get requests
// ============================================
// post requests start here:

// register post endpoint
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const { email, password } = req.body;

  if (getUserByEmail(email, listOfUsers)) {
    res.status(400);
    res.send("Use another email");
  }

  if (email === "" || password === "") {
    res.status(400);
    res.send("page not found");
  } else {
    listOfUsers[randomID] = {
      id: randomID,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = userAuth(email, password, listOfUsers);

  if (!email || !password) {
    res.status(403).send("your password/email field is empty");
  }

  if (!userId) {
    res.status(403).send("error loggin in ");
  }
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = "";
  res.redirect("/urls");
});

// this endpoint handles posts for new
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect("http://localhost:8080/urls/" + shortURL);
});

//updates the URL resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  if (longURL.length > 0) {
    if (userID === urlDatabase[shortURL].userID) {
      urlDatabase[req.params.shortURL].longURL = longURL;
      res.redirect("/urls");
    } else {
      res.status(400).send("You do not have permission to edit this URL");
    }
  }
});

// handles deleting a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(urlDatabase[shortURL]);
  const userID = req.session.user_id;
  if (!userID) {
    res.status(400).send("you need to login to delete this url");
  }
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("You don't have permission to delete this URL");
  }
});

// end of post requests
// ============================================
// wierd gets that have to be at the end maybe:
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]?.longURL;

  if (longURL == undefined) {
    res.send("the link you are looking for does not exist");
  } else {
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

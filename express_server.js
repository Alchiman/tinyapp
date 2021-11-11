const { Template } = require("ejs");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { json } = require("express");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Objects:
//============================================
// userData
const listOfUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "alireza.chaychi@gmail.com",
    password: "password",
  },
};

// UrlData
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//============================================
// Functions start here:
function generateRandomString() {
  return Math.random()
    .toString(15)
    .substring(4, 9);
}

const emailExists = function(checkingEmail) {
  for (const userId in userDB) {
    if (listOfusers[userId].email === checkingEmail) {
      return true;
    }
    return false;
  }
};

const userAuthentication = function(userDb, email, password) {
  for (const key in userDb) {
    if (userDb[key].email === email && userDb[key].password === password) {
      return true;
    }
    return false;
  }
};
// end of functions
// ============================================
// get requests here except for the weird ones

// this is the home endpoint
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// register get endpoint
app.get("/register", (req, res) => {
  const templateVars = {
    vars: {
      shortURL: req.params.id,
      fullURL: urlDatabase[req.params.id],
      username: req.cookies["user_id"],
    },
  };
  res.render("register");
});
// login get endpoint
app.get("/login", (req, res) => {
  res.render("login");
});

// here is the endpoint for list of existing urls
app.get("/urls", (req, res) => {
  const templateVars = { userId: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// endpoint for creating new urls
app.get("/urls/new", (req, res) => {
  const templateVars = { userId: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});
// end of get requests
// ============================================
// post requests start here:

// register post endpoint
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const { email, password } = req.body;
  if (emailExists(email)) {
    res.status(400);
    res.send("Use another email");
  }

  if (email === "" || password === "") {
    res.status(400);
    res.send("page not found");
  } else {
    listOfUsers[randomID] = { id: randomID, email: email, password: password };
  }

  res.cookie("user_id", randomID);
  res.redirect("/urls");
  // res.json(listOfUsers);
});

// this endpoint handles post for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (emailExists) {
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("The email or the password is wrong ");
  }

  // if (userAuthentication(listOfUsers, email, password)) {
  //   res.cookie("user_id", randomID);
  //   res.redirect("/urls");
});

// this endpoint handles posts for new
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// endpoint for logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//updates the URL resource
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
  // const shortURL = res;
});

// handles deleting a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
// come back to to this later for edit
// app.get("/urls/:shorURL", (req, res) => {
//   req.render("urls_new");
// });

// end of post requests
// ============================================
// wierd gets that have to be at the end maybe:

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[shortURL]) {
    res.send("The short URL you are looking for does not exist.");
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    userId: req.cookies["user_id"],
  };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

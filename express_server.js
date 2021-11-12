const express = require("express");
// const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

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
const PORT = 8080; // default port 8080
// const { json } = require("express");

// Objects:
//============================================
// userData
const listOfUsers = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "alireza.chaychi@gmail.com",
    password: "000",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//============================================
// Functions start here:
function generateRandomString() {
  return Math.random()
    .toString(15)
    .substring(4, 9);
}

const emailExists = function(checkingEmail) {
  for (const userId in listOfUsers) {
    if (listOfUsers[userId].email === checkingEmail) {
      return true;
    }
    return false;
  }
};
const userAuth = function(email, password) {
  // console.log("this is the user sent email", email);
  // console.log("this is the user sent passwor", password);

  for (const userID in listOfUsers) {
    if (
      listOfUsers[userID].email === email &&
      bcrypt.compareSync(password, listOfUsers[userID].password)
      // listOfUsers[userID].password === password
    ) {
      return listOfUsers[userID].id;
    }
  }
  // console.log(listOfUsers);
  // console.log("this is database email", listOfUsers["user3RandomID"].email);
  // console.log(
  //   "this is database password",
  //   listOfUsers["user3RandomID"].password
  // );
  return false;
};

const urlsForUser = function(userID) {
  /*
  get all the keys of database 
  the itirate over all the key via map 
return entrie were the use id matches 
return undefined otherwise
filter the undefined results

  */
  // console.log("I am working!");
  const results = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === userID) {
      results[shortUrl] = urlDatabase[shortUrl];
    }
  }
  // console.log(results);
  return results;
  // const entries = Object.keys(urlDatabase)
  //   .map((shortURL) => {
  //     const entry = urlDatabase[shortURL];
  //     if (entry.userID === userID) {
  //       return [shortURL, entry];
  //     } else {
  //       return undefined;
  //     }
  //   })
  //   .filter((a) => !!a);
  // return Object.fromEntries(entries);
};
// end of functions
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
    // shortURL: req.params.id,
    // fullURL: urlDatabase[req.params.id],
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

// login get endpoint

// here is the endpoint for list of existing urls
app.get("/urls", (req, res) => {
  console.log(req.session.user_id);
  console.log(urlDatabase);
  const templateVars = {
    user_id: req.session.user_id,
    urls: urlsForUser(req.session.user_id),
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

  if (emailExists(email)) {
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

  // res.json(listOfUsers);
});

// this endpoint handles post for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = userAuth(email, password);

  if (!email || !password) {
    res.status(403).send("your password/email field is empty");
  }

  if (!userId) {
    res.status(403).send("error loggin in ");
  }
  req.session.user_id = userId;
  res.redirect("/urls");

  // for (const userId in listOfUsers) {
  //   if (
  //     listOfUsers[userId].email === email &&
  //     listOfUsers[userId].password === password
  //   ) {
  //     res.cookie("user_id", listOfUsers[userId]["id"]);
  //   } else {
  //     res.status(403);
  //     res.send("The email or the password is wrong ");
  //   }
  // }
});

// endpoint for logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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
  // if (!urlDatabase[shortURL]) {
  //   res.send("The short URL you are looking for does not exist.");
  // }
  if (longURL == undefined) {
    res.send("the link you are looking for does not exist");
  } else {
    res.redirect(longURL);
  }
});

// app.get("/urls/:shortURL", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const templateVars = {
//     shortURL: shortURL,
//     longURL: urlDatabase[shortURL].longURL,
//     // user_id: req.cookies["user_id"],
//     user_id: "abc",
//   };

//   res.render("urls_show", templateVars);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

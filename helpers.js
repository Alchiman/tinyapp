const bcrypt = require("bcryptjs");

const emailExists = function(checkingEmail, dataBase) {
  for (const userId in dataBase) {
    if (dataBase[userId].email === checkingEmail) {
      return true;
    }
  }
  return false;
};

function generateRandomString() {
  return Math.random()
    .toString(15)
    .substring(4, 9);
}

const getUserByEmail = function(email, dataBase) {
  // lookup magic...
  if (email === "") {
    return undefined;
  }
  for (const user in dataBase) {
    if (dataBase[user].email === email) {
      return dataBase[user];
    }
  }

  return false;
};

const userAuth = function(email, password, dataBase) {
  for (const userID in dataBase) {
    if (
      dataBase[userID].email === email &&
      bcrypt.compareSync(password, dataBase[userID].password)
    ) {
      return dataBase[userID].id;
    }
  }

  return false;
};

const urlsForUser = function(userID, dataBase) {
  const results = {};
  for (const shortUrl in dataBase) {
    if (dataBase[shortUrl].userID === userID) {
      results[shortUrl] = dataBase[shortUrl];
    }
  }
  return results;
  //
};

module.exports = {
  emailExists,
  generateRandomString,
  getUserByEmail,
  userAuth,
  urlsForUser,
};

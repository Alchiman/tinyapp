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

const getUserByEmail = function(email, database) {
  // lookup magic...
  for (const user in database) {
    if (database[user].email === email) {
      return user;
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

module.exports = {
  emailExists,
  generateRandomString,
  getUserByEmail,
  userAuth,
};

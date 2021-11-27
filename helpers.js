const bcrypt = require("bcryptjs");

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

module.exports = {
  generateRandomString,
  getUserByEmail,
  userAuth,
};

const generateRandomString = () => {
  return Math.random().toString(20).substring(2, 8);
};

const createUser = (id, email, password, userDatabase) => {
  userDatabase[id] = {
    id,
    email,
    password,
  }
  return userDatabase[id];
};

const findUserById = (user_id, userDatabase) => {
  for (let user in userDatabase) {
    if (userDatabase[user].id === user_id) {
      return userDatabase[user];
    }
  }
  return false;
};

const findUserByEmail = (email, userDatabase) => {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  const urlsToShow = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      urlsToShow[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return urlsToShow;
};

module.exports = {
  generateRandomString,
  createUser,
  findUserById,
  findUserByEmail,
  urlsForUser
}
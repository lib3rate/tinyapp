// Generates a random 6-character string for using as IDs

const generateRandomString = () => {
  return Math.random().toString(20).substring(2, 8);
};

// Creates a new user object and adds it to the user database

const createUser = (id, email, password, userDatabase) => {
  userDatabase[id] = {
    id,
    email,
    password,
  };
  return userDatabase[id];
};

// Finds a user in the user database by ID

const findUserById = (user_id, userDatabase) => {
  for (let user in userDatabase) {
    if (userDatabase[user].id === user_id) {
      return userDatabase[user];
    }
  }
  return false;
};

// Finds a user in the user database by email

const findUserByEmail = (email, userDatabase) => {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
  return false;
};

// Returns an object with the URLs created by the user with the provided ID

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
};
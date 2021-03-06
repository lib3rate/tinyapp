const PORT = 8080;
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();

const {
  generateRandomString,
  createUser,
  findUserById,
  findUserByEmail,
  urlsForUser
} = require('./helpers');

// Setting the rendering engine to EJS

app.set('view engine', 'ejs');

// Setting Express to use Body Parser and Cookie Session middleware, as well as their configuration

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Defining the database with the URLs

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "7c2j6a" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "20h42g" },
  g9536a: { longURL: "https://www.lighthouselabs.ca", userID: "6e1a50" },
};

// Defining the user database

const users = {
  "Bob": {
    id: "7c2j6a",
    email: "bob@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "John": {
    id: "20h42g",
    email: "john@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "Caleb": {
    id: "6e1a50",
    email: "caleb@example.com",
    password: bcrypt.hashSync("qwer", 10)
  },
};

// Accessing the welcome page

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Accessing the happy page

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Accessing the registration page

app.get('/register', (req, res) => {
  res.render('registration');
});

// Accessing the login page

app.get('/login', (req, res) => {
  res.render('login');
});

// Accessing the general webpage with a list of all the added URLs for the current user

app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = findUserById(userId, users);
  if (!user) {
    res.send('Please login or register to view the list of URLs');
    return;
  }
  const urlsToShow = urlsForUser(userId, urlDatabase);
  let templateVars = {
    urls: urlsToShow,
    user,
  };
  res.render('urls_index', templateVars);
});

// Accessing the page with an interface to create a new short URL if the user is logged in

app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  const user = findUserById(userId, users);
  if (!user) {
    res.redirect('/login');
    return;
  }
  let templateVars = { user };
  res.render('urls_new', templateVars);
});

// Accessing the page with information on the short URL belonging to the user

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const user = findUserById(userId, users);
  const listOfUserUrls = Object.keys(urlsForUser(userId, urlDatabase));
  for (let url of listOfUserUrls) {
    if (url === shortURL) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user,
      };
      res.render('urls_show', templateVars);
      return;
    }
  }
  res.send('You do not have permission to view this page');
});

// Redirecting to an external website with the long URL

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  for (let url of Object.keys(urlDatabase)) {
    if (url === shortURL) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      res.redirect(longURL);
      return;
    }
  }
  res.send('The requested URL does not exist');
});

// Registering a new user if the form meets the requirements and encrypting the password

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status(400).send('Email or password are empty');
  } else if (findUserByEmail(email, users)) {
    res.status(400).send('User with the provided email is already registered');
  } else {
    createUser(userId, email, bcrypt.hashSync(password, 10), users);
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

// Checking the credentials and logging the user in

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (!user) {
    res.status(403).send('User with the provided email cannot be found, please register');
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Passwords do not match');
  } else {
    const userId = user.id;
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

// Clearing the cookies and redirecting to the main page with the list of URLs on logout

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Updating a short URL that belongs to the user with a new long URL

app.post('/urls/:shortURL', (req, res) => {
  const shortUrlToUpdate = req.params.shortURL;
  const newLongUrl = req.body.longURL;
  const userId = req.session.user_id;
  const listOfUserUrls = Object.keys(urlsForUser(userId, urlDatabase));
  for (let url of listOfUserUrls) {
    if (url === shortUrlToUpdate) {
      urlDatabase[shortUrlToUpdate].longURL = newLongUrl;
      res.redirect('/urls');
      return;
    }
  }
  res.send('You do not have permission to view this page');
});

// Adding a new short URL to the database

app.post('/urls', (req, res) => {
  const newLongUrl = req.body.longURL;
  const newShortUrl = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[newShortUrl] = {
    longURL: newLongUrl,
    userID: userId
  };
  res.redirect(`/urls/${newShortUrl}`);
});

// Removing an existing short URL belonging to the user from the database

app.post('/urls/:shortURL/delete', (req, res) => {
  let urlToDelete = req.params.shortURL;
  const userId = req.session.user_id;
  const listOfUserUrls = Object.keys(urlsForUser(userId, urlDatabase));
  for (let url of listOfUserUrls) {
    if (url === urlToDelete) {
      delete urlDatabase[urlToDelete];
      res.redirect('/urls');
      return;
    }
  }
  res.send('You do not have permission to delete this URL');
});

// Setting the app to listen to HTTP requests at the specified port

app.listen(PORT, () => {
  console.log(`Please know that we are listening on port ${PORT}!`);
});
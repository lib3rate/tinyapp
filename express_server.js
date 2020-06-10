const PORT = 8080;
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

const createUser = (id, email, password) => {
  users[id] = {
    id,
    email,
    password,
  }
  return users[id];
};

const findUserById = (user_id) => {
  for (let user in users) {
    if (users[user].id === user_id) {
      return users[user];
    }
  }
  return false;
};

const findUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Access the registration page

app.get('/register', (req, res) => {
  res.render('registration');
});

// Access the login page

app.get('/login', (req, res) => {
  res.render('login');
});

// Access the general webpage with a list of all the added URLs

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = findUserById(userId);
  let templateVars = {
    urls: urlDatabase,
    user,
  };
  res.cookie('user_id', userId);
  res.render('urls_index', templateVars);
});

// Access the page with an interface to create a new short URL

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = findUserById(userId);
  let templateVars = { user };
  res.cookie('user_id', userId);
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = findUserById(userId);
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user,
  };
  res.cookie('user_id', userId);
  res.render('urls_show', templateVars);
});

// Redirecting to an external website with the long URL

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Registering a new user

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status(400).send('Email or password are empty')
  } else if (findUserByEmail(email)) {
    res.status(400).send('User is already registered')
  } else {
    const user = createUser(userId, email, password);
  };
  // const templateVars = { user };
  res.cookie('user_id', userId);
  res.redirect('/urls'); // Do we need to pass templateVars here?
});

// Logging an existing user in

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (!user) {
    res.status(403).send('User with the provided email cannot be found, please register')
  } else if (password !== user.password) {
    res.status(403).send('Passwords do not match')
  } else {
    const userId = user.id;
    res.cookie('user_id', userId);
    res.redirect('/urls');
  };
});

// Clearing the cookies and redirecting to the main page with the list of URLs on logout

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const urltoUpdate = req.params.shortURL;
  let newLongUrl = req.body.longURL;
  urlDatabase[urltoUpdate] = newLongUrl;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let newLongUrl = req.body.longURL;
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = newLongUrl;
  res.redirect(`/u/${newShortUrl}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let urlToDelete = req.body.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`We are listening to you on port ${PORT}!`);
});
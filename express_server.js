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
  for (let userId in users) {
    if (users[userId].email === [user_id].email) {
      return userId;
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

app.get('/register', (req, res) => {
  res.render('registration');
});

// Access the general webpage with a list of all the added URLs

app.get('/urls', (req, res) => {
  console.log(req.cookies);
  const userId = req.cookies['user_Id'];
  console.log(userId);
  const user = findUserById(userId);
  console.log(user);
  let templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"]
    user,
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Registering a new user

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = createUser(id, email, password);
  const templateVars = { user };
  res.cookie('user_id', id);
  res.redirect('/urls'); // Add templateVars
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
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
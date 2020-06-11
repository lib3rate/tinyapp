const PORT = 8080;
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "7c2j6a" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "20h42g" },
  g9536a: { longURL: "https://www.lighthouselabs.ca", userID: "6e1a50" },
};

const users = { 
  "Bob": {
    id: "7c2j6a",
    email: "bob@example.com",
    password: "purple-monkey-dinosaur"
  },
 "John": {
    id: "20h42g",
    email: "john@example.com",
    password: "dishwasher-funk"
  },
  "Caleb": {
    id: "6e1a50",
    email: "caleb@example.com",
    password: "qwer"
  },
};

const generateRandomString = () => {
  return Math.random().toString(20).substring(2, 8);
};

const createUser = (id, email, password) => {
  users[id] = {
    id,
    email,
    password,
  }
  return users[id];
};

const findUserById = user_id => {
  for (let user in users) {
    if (users[user].id === user_id) {
      return users[user];
    }
  }
  return false;
};

const findUserByEmail = email => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = id => {
  const urlsToShow = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      urlsToShow[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return urlsToShow;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

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

// Accessing the general webpage with a list of all the added URLs

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = findUserById(userId);
  if (!user) {
   res.send('Please login or register to view the list of URLs') 
  }
  const urlsToShow = urlsForUser(userId);
  let templateVars = {
    urls: urlsToShow,
    user,
  };
  // res.cookie('user_id', userId);
  res.render('urls_index', templateVars);
});

// Accessing the page with an interface to create a new short URL

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = findUserById(userId);
  if (!user) {
    res.redirect('/login')
  };
  let templateVars = { user };
  // res.cookie('user_id', userId);
  res.render('urls_new', templateVars);
});

// Accessing the page with information on the short URL

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const user = findUserById(userId);
  const listOfUserUrls = Object.keys(urlsForUser(userId));
  for (let url of listOfUserUrls) {
    if (url === shortURL) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user,
      };
      // res.cookie('user_id', userId);
      res.render('urls_show', templateVars);
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
    }
  }
  res.send('The requested URL does not exist')
});

// Registering a new user

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status(400).send('Email or password are empty')
  } else if (findUserByEmail(email)) {
    res.status(400).send('User with the provided email is already registered')
  } else {
    createUser(userId, email, password);
  };
  res.cookie('user_id', userId);
  res.redirect('/urls');
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

// Updating a short URL with a new long URL

app.post('/urls/:shortURL', (req, res) => {
  const shortUrlToUpdate = req.params.shortURL;
  const newLongUrl = req.body.longURL;
  const userId = req.cookies['user_id'];
  const listOfUserUrls = Object.keys(urlsForUser(userId));
  for (let url of listOfUserUrls) {
    if (url === shortUrlToUpdate) {
      urlDatabase[shortUrlToUpdate].longURL = newLongUrl;
      res.redirect('/urls');
    }
  }
  res.send('You do not have permission to view this page');
});

// Adding a new short URL to the database

app.post('/urls', (req, res) => {
  const newLongUrl = req.body.longURL;
  const newShortUrl = generateRandomString();
  const userId = req.cookies['user_id'];
  urlDatabase[newShortUrl] = {
    longURL: newLongUrl,
    userID: userId
  };
  res.redirect(`/urls/${newShortUrl}`);
});

// Removing an existing short URL from the database

app.post('/urls/:shortURL/delete', (req, res) => {
  let urlToDelete = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const listOfUserUrls = Object.keys(urlsForUser(userId));
  for (let url of listOfUserUrls) {
    if (url === urlToDelete) {
      delete urlDatabase[urlToDelete];
      res.redirect('/urls');
    }
  }
  res.send('You do not have permission to delete this URL');
});

app.listen(PORT, () => {
  console.log(`We are listening to you on port ${PORT}!`);
});
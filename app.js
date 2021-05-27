const { sequelize } = require('./models');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//test database connection and sync the model
(async () => {
  //sync database every time
  await sequelize.sync();
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (err) {
    console.error('Error connecting to the database: ', err);
  }
})();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 
app.use(function(req, res, next) {
  const err = new Error();
  err.status = 404;
  res.status(404).render('page-not-found', { err });
});

// error handler
app.use(function(err, req, res, next) {
  if(err.status === 404){
    res.status(404).render('page-not-found', { err });
  } else {
    err.message = (err.message || "You've encountered a server-side error.");
    res.status(err.status||500).render('error', {err})
  }
});

module.exports = app;

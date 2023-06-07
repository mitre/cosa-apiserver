var createError = require('http-errors');
var express = require('express');
var mysql = require('mysql');
const basicAuth = require('express-basic-auth');
var config = require('./config');
var logger = require('morgan');

const mysqlOptions = {
  connectionLimit: 10,
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database
};

var connection = mysql.createPool(mysqlOptions);



var app = express();

app.use(logger('dev'));

app.use(express.json());
//app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(function (req, res, next) {
  req.mysql = connection;
  req.config = config;
  next();
});

var indexRouter = require('./routes/index');
var aipRouter = require('./routes/api');
app.use('/', indexRouter);
app.use('/API', basicAuth({
  users: config.users
}), aipRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: err
  });
});

module.exports = app;

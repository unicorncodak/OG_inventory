const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const devicesRouter = require('./routes/devices');
const assignmentsRouter = require('./routes/assignments');

const app = express();

// Importing middlewares
const isAuthAdmin = require('./middleware/isAuthAdmin');

// Setup passport
require('./config/passport')(passport);

// Setup dotenv
require('dotenv').config();

// Setup mongoose
const mongoUrl = process.env.MONGO_URL;
// Connect to mongo
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected'))
  .catch(err => console.log(err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', usersRouter);

app.use('/devices', devicesRouter);
app.use('/assign', assignmentsRouter);
// Only logged in admins can access this endpoint.
const middleware = [isAuthAdmin, authorized];
app.use('/', middleware, indexRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Express session
app.use(session({
  secret: 'og inventory system',
  resave: true,
  saveUninitialized: true
}));

// Passport config middleware
app.use(passport.initialize());

// // App middleware
function authorized(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      res.status(401).json({ msg: "Unauthorized" });
    }
  // Check is user is an admin after signed in
    if (user.role.toLowerCase() === 'admin') {
      next();
    } else {
      res.status(401).json({ msg: "You don't have the right access" });
    }
  })(req, res, next)
}

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

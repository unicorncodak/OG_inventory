const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Find user
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(null, false, { err });
        }

        if (!user) {
          return done(null, false, { msg: 'User is not registered' });
        } else {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              return done(null, false, { err });
            }
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { msg: 'Email and password pair incorrect' });
            }
          });
        }
      })
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

}
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/register', (req, res) => {
  const { fullName, ogId, campaign, role, password, phone, email } = req.body;
  const errors = [];
  // Check required fields
  if (!fullName || !ogId || !campaign || !role || !password || !phone || !email) {
    res.status(400).json({ msg: 'Please fill in all fields' });
  }

  // Check password length
  if (password.length < 8) {
    res.status(400).json({ msg: 'Password should be at least 8 characters' });
  }

  if (errors.length > 0) {

  } else {
    User.findOne({ ogId: ogId }, (err, user) => {
      if (user) {
        res.status(400).json({ msg: 'User already exists' });
      } else {
        const newUser = new User({
          fullName,
          ogId,
          campaign,
          role,
          phone,
          email,
          password
        })

        // Generate salt
        bcrypt.genSalt(10, (err, salt) => {
          // Generate has if no errors generating salt
          if (!err) {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (!err) {
                // Set password to hash
                newUser.password = hash;
                newUser.save((err, saved) => {
                  if (err) {
                    res.status(500).json({ err });
                  } else {
                    res.status(200).json(newUser);
                  }
                })
              }
            });
          }
        });
      }
    });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, done, info) => {
    if (err) {
      res.status(400).json({ err });
    }

    if (done) {
      res.status(200).json({ done });
    } else {
      res.status(400).json(info);
    }
  })(req, res, next)
});

module.exports = router;

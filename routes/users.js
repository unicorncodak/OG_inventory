const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Importing middlewares
const isAuthAdmin = require('../middleware/isAuthAdmin');

// User model
const User = require('../models/User');

/* GET users listing. */
router.get('/', isAuthAdmin, (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(users);
    }
  });
});

router.post("/details", async(req, res) => {
    try{
        const user = await User.findOne({ogId: req.body.ogId})
        res.status(200).json({message: "User details found successfully!", data: user})
    }catch(err){
        res.status(422).json({message: "Some errors occured", errors: err})
    }
})

router.post('/register', isAuthAdmin, (req, res) => {
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
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      res.status(400).json({ err });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.json(err);
      }
    })
    if (user) {
      const token = jwt.sign(JSON.parse(JSON.stringify(user)), 'this is my jwt secret, nice right?');
      res.status(200).json({ user, token });
    } else {
      res.status(400).json(info);
    }
  })(req, res, next)
});

//update User
router.post('/:userId', isAuthAdmin, (req, res, next) => {
  console.log(req.body);
  const id = req.params.userId;
  const updateOps = {};
  for (const ops in req.body) {
    updateOps[ops.propName] = ops.value;
  }
  User.update({ ogId: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//delete User
router.delete('/:userId', isAuthAdmin, (req, res, next) => {
  const id = req.params.userId;
  User.remove({ ogId: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

function isAdmin(req, res, next) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user && user.role.toLowerCase() === 'admin') {
      next();
    }
  })
}


module.exports = router;

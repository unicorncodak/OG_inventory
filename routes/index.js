const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ msg: "Welcome Home" });
});

module.exports = router;

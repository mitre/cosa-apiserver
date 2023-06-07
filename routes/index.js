var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let appName = req.config.appname;
  res.status(200).send("--- " + appName + " ---");
});

module.exports = router;

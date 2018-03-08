var express = require('express');
var router = express.Router();

/* incoming mail */
router.post('/', function(req, res, next) {
  console.log('Received mail: ' + JSON.stringify(req.body));
  res.send('Ok');
});

module.exports = router;

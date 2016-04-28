var express = require('express');
var router = express.Router();

/* Return page to test GET, POST, PUT */
router.get('/', function (req, res, next) {
  var endPoint = req.endPoint;
  var endPointShort = endPoint.split('/').splice(-1)[0] || endPoint;

  res.render('mokkapitest', {
    title: 'Test page for API: ' + endPoint,
    endPoint: endPoint,
    endPointShort: endPointShort,
    GET: true,
    POST: true,
    PUT: true
  });
});

module.exports = router;

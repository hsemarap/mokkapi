var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var glob = require('glob');

var routes = require('./routes/index');
var mokkapiTest = require('./routes/mokkapi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

var mocks = 'mocks';

// Recurse through all json in mocks and create a GET endpoint for it
var mockFiles = glob.sync('./**/*.json', {
  cwd: mocks
});

app.use(function (req, res, next) {
  req.mocks = mocks;
  next();
});

mockFiles.forEach(function (jsonFile) {
  var endPoint = jsonFile.substring(1, jsonFile.lastIndexOf('.json'));
  var endPointWithId = endPoint + "/:id";
  var router = express.Router();
  console.log("Endpoint: " + endPoint + " : " + jsonFile);

  // GET to list all entries
  app.get(endPoint, function (req, res, next) {
    var filePath = req.mocks + endPoint + ".json";
    var fileContent = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(fileContent);
    var queryParams = Object.keys(req.query);
    queryParams.forEach(function (queryParam) {
      jsonContent = jsonContent.filter(function (item) {
        return item[queryParam] == req.query[queryParam];
      });
    })
    res.json(jsonContent);
  });

  // GET to list entry by id
  app.get(endPointWithId, function (req, res, next) {
    var itemId = req.params.id;
    var filePath = req.mocks + endPoint + ".json";
    var fileContent = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(fileContent);
    var item = jsonContent.filter(function (item) {
      return item.id === itemId;
    });
    res.json(item.length ? item[0] : {});
  });

  // GET to test GET and POST
  app.get("/mokkapi" + endPoint, function (req, res, next) {
    req.endPoint = endPoint;
    req.endPointWithId = endPointWithId;
    console.log("Hit test");
    next();
  });

  app.use("/mokkapi" + endPoint, mokkapiTest);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

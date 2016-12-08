var debug = require('debug')('app');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
var expressWs = require('express-ws')(app);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'ejs');  

// Initialize event proxy
require('./src/events/proxy');

// API & WS setup
debug("Initializing API and WebSocket endpoints");

app.use('/api/interaction', require('./routes/api/interaction'));
app.use('/api/elevator', require('./routes/api/elevator'));
app.use('/ws', require('./routes/ws/elevator')(app._router));

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/floor/:floor', (req, res) => {
  var floor = req.params.floor; 

  if(floor < 0) {
    floor = 0;
  } else if(floor > 3) {
    floor = 3;
  }

  res.render('floor/floor', { floor: floor });
})

app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'allow'
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

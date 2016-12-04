var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var expressWs = require('express-ws')(app);
//var manager = require('./lib/state/manager')
var debug = require('debug')('app');

var stateMonitor = require('./src/state/monitor');

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

Object.deepClone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isWebsocketConnected(ws) {
  return ws.readyState == 1;
}

var elevatorApi = require('./src/elevator/api');
app.ws('/sock/elevator', function (ws, req) {
  debug("WebSocket connection established");
  debug("Sending initial state");
  ws.send(JSON.stringify(stateMonitor.getCurrentState()));

  var newStateListener = (newState) => {
    debug("Sending new state");
    debug(ws.readyState);

    if (isWebsocketConnected(ws)) {
      ws.send(JSON.stringify(newState));
    }
  }

  ws.on('close', function () {
    debug("Connection closed");
    stateMonitor.Observable.removeListener(stateMonitor.Events.CHANGED, newStateListener);
  });

  stateMonitor.Observable.on(stateMonitor.Events.CHANGED, newStateListener);

  ws.on('message', function (msg) {
    debug("WS MESSAGE");
    debug("WebSocket message of type: " + (JSON.parse(msg)).type);

    try {
      msg = JSON.parse(msg);
    } catch (error) {
      debug("Error with parsing, probably just string");
    }

    switch (msg.type) {
      case 'setOutput':
        debug("Setting output of pin " + msg.data.pin + " to value " + msg.data.value);
        elevatorApi.setOutput(msg.data.pin, msg.data.value);
        break;

      case 'GO_TO_FLOOR':
        var destinationFloor = msg.data.value;

        debug("Going to floor" + destinationFloor);
        elevatorApi.goToFloor(destinationFloor);
    }
  });

  stateMonitor.forceStateRefresh();
});

// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'allow'
}));

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

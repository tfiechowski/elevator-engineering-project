// Module for monitoring state of the Elevator Model through GPIO ports and
// dispatching corresponding events indicating changes in state.

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var gpio = require('../board/gpio');

var pinout = require('../../config/config.json').pinout;
var debug = require('debug')('state/monitor');
var debugInit = require('debug')('state/monitor/initialization');


// Variables and Event definitions
var Events = {
    "CHANGED": "state.changed"
}

var currentState = {
    floors: [0, 0, 0, 0],
    start: 0,
    direction: 0,
    speed: 0
}



// Monitor Observable:

function StateMonitorObservable() {
    EventEmitter.call(this);
}

util.inherits(StateMonitorObservable, EventEmitter);

// TODO: Only this module can emit change state, maybe dont prototype it? 
StateMonitorObservable.prototype.changeState = function (newState) {
    debug("State changed, emitting Event! New state:");
    debug(JSON.stringify(newState));
    this.emit(Events.CHANGED, newState);
}

var stateMonitorObservable = new StateMonitorObservable();


// Initialization

function initializeMonitoring() {
    debugInit("Initializing GPIO monitoring : ");

    var initOutputPinMonitoring = (key) => {
        debugInit('Setting ' + key + ' ...');
        var pin = pinout[key];

        gpio.open(pin, gpio.OUTPUT, gpio.HIGH);
        gpio.monitor(pin, () => {
            debug("New state on pin " + pin);
            currentState[key] = gpio.read(pin);
            stateMonitorObservable.changeState(currentState);
        });
        gpio.write(pin, gpio.HIGH);
    }

    debugInit("Output pins...");
    initOutputPinMonitoring('start');
    initOutputPinMonitoring('direction');
    initOutputPinMonitoring('speed');


    debugInit("Input pins...");
    for (var i of pinout.floors) {
        ((pin) => {
            gpio.open(pin, gpio.INPUT);
            gpio.monitor(pin, () => {
                pinIndex = pinout.floors.indexOf(pin);
                currentState.floors[pinIndex] = gpio.read(pin);
                debug("Pin " + pinIndex + " changed state");
                debug(JSON.stringify(currentState));
                stateMonitorObservable.changeState(currentState);
            });
        })(i);
    }
    gpio.open(pinout['limit'], gpio.OUTPUT);
    gpio.monitor(pinout['limit'], () => {
        debug("Limit pin changed state");
        currentState['limit'] = gpio.read(pinout['limit']);
        stateMonitorObservable.changeState(currentState);
    });

    debugInit("Done!");
}

initializeMonitoring();
debug("Start state:");
debug(JSON.stringify(currentState));

module.exports = {
    Observable: stateMonitorObservable,
    Events: Events,
    getCurrentState: () => {
        return Object.deepClone(currentState);
    }
}
// Module for monitoring state of the Elevator Model through GPIO ports and
// dispatching corresponding events indicating changes in state.

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var gpio = require('../board/gpio').GPIO;
var gpioValues = require('../board/gpio').Values
var gpioModes = require('../board/gpio').Modes

var pinout = require('../../config/config.json').pinout;
var debug = require('debug')('state/monitor');


// Variables and Event definitions
var Events = {
    "CHANGED": "changed"
}

var currentState = {
    floors: [0, 0, 0, 0],
    limit: 0,
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
    debug("State changed. Emitting event!");
    this.emit(Events.CHANGED, newState);
}

var stateMonitorObservable = new StateMonitorObservable();


// Initialization

function initializeMonitoring() {
    debug("Initializing GPIO monitoring : ");

    var initOutputPinMonitoring = (key) => {
        debug('        Setting ' + key + ' ...'); 
        var pin = pinout[key];

        gpio.open(pin, gpioModes.OUTPUT);
        gpio.monitor(pin, () => {
            currentState[key] = gpio.read(pin);
            stateMonitorObservable.changeState(currentState);
        });    
    }

    debug("    Output pins...");
    initOutputPinMonitoring('start');
    initOutputPinMonitoring('direction');
    initOutputPinMonitoring('speed');


    debug("    Input pins...");
    for(var i of pinout.floors) {
        ((pin) => {
            gpio.open(pin, gpioModes.INPUT);
            gpio.monitor(pin, () => {
                currentState[key] = gpio.read(pin);
                stateMonitorObservable.changeState(currentState);
            });    
        })(i);
    }

    debug("    Done!");
}

initializeMonitoring();

module.exports = {
    Observable: stateMonitorObservable,
    Events: Events
}
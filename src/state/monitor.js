// Module for monitoring state of the Elevator Model through GPIO ports and
// dispatching corresponding events indicating changes in state.

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var gpio = require('../board/gpio');

var pinout = require('../../config/config.json').pinout;
var debug = require('debug')('state:monitor');
var debugInit = require('debug')('state:monitor:init');
var stateUtils = require('./utils');


// Variables and Event definitions
var EVENTS = {
    "CHANGED": "STATE.CHANGED",
    "FLOOR_CHANGED": "STATE.FLOOR_CHANGED",
    "NEAR_FLOOR": "STATE.NEAR_FLOOR"
}

var currentState = {
    floors: [0, 0, 0, 0],
    limit: 0,
    start: 0,
    direction: 0,
    speed: 0
}

var lastFloor = -1;
var last3rdpin = -1;
var last4thpin = -1;


// Monitor Observable:

function StateMonitorObservable() {
    EventEmitter.call(this);
}

util.inherits(StateMonitorObservable, EventEmitter);

// TODO: Only this module can emit change state, maybe dont prototype it? 
StateMonitorObservable.prototype.changeState = function (newState) {
    debug("State changed, emitting Event! New state:");
    debug(JSON.stringify(newState));
    this.emit(EVENTS.CHANGED, newState);

    currentState = newState;
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

function forceStateRefresh() {
    currentState.start = gpio.read(pinout['start']);
    currentState.direction = gpio.read(pinout['direction']);
    currentState.speed = gpio.read(pinout['speed']);

    for (var pin of pinout.floors) {
        var pinIndex = pinout.floors.indexOf(pin);
        currentState.floors[pinIndex] = gpio.read(pin);
    }

    stateMonitorObservable.changeState(currentState);
}

function getCurrentState() {
    return Object.deepClone(currentState);
}

stateMonitorObservable.on(EVENTS.CHANGED, (newState) => {
    // We check floors[2] becouse this transoptor is in HIGH state on every floor.
    if (newState.floors[2] === 1 && last3rdpin !== 1) {
        var timeout = 15;

        setTimeout(() => {
            var currentFloor = stateUtils.translateStateToFloor(getCurrentState());

            if (currentFloor != lastFloor) {
                lastFloor = currentFloor;

                stateMonitorObservable.emit(EVENTS.FLOOR_CHANGED, currentFloor);
            }

        }, timeout);
    }

    last3rdpin = newState.floors[2];

    if (newState.floors[3] !== last4thpin) {
        debug("Elevator changed proximity");
        stateMonitorObservable.emit(EVENTS.NEAR_FLOOR, newState.floors[3]);
    }

    last4thpin = newState.floors[3];
});


initializeMonitoring();
debug("Start state:");
debug(JSON.stringify(currentState));

module.exports = {
    Observable: stateMonitorObservable,
    EVENTS: EVENTS,
    getCurrentState: getCurrentState,
    forceStateRefresh: forceStateRefresh,
    getCurrentFloor: () => {
        debug("RETURNING CURRENT FLOOR: " + lastFloor);
        return lastFloor;
    }
}
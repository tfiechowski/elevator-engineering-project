// Module for monitoring state of the Elevator Model through GPIO ports and
// dispatching corresponding events indicating changes in state.

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var gpio = require('../board/gpio');

var pinout = require('../../config/config.json').pinout;
var debug = require('debug')('state:monitor');
var debugInit = require('debug')('state:monitor:init');
var stateUtils = require('./utils');
var constants = require('./constants');


// Variables and Event definitions
var EVENTS = {
    "CHANGED": "STATE.CHANGED",
    "FLOOR_CHANGED": "STATE.FLOOR_CHANGED",
    "ELEVATOR_STOPPED": "STATE.ELEVATOR_STOPPED",
    "NEAR_FLOOR": "STATE.NEAR_FLOOR"
}


var position = 0;
var lastFloor = -1;
var currentState = {
    floors: [0, 0, 0, 0],
    limit: 0,
    start: 0,
    direction: 0,
    speed: 0
}

var previousState = JSON.parse(JSON.stringify(currentState));

// Monitor Observable:

function StateMonitorObservable() {
    EventEmitter.call(this);
}

util.inherits(StateMonitorObservable, EventEmitter);

// TODO: Only this module can emit change state, maybe dont prototype it? 
StateMonitorObservable.prototype.changeState = function (newState) {
    debug("State changed, emitting Event! New state:");
    debug(JSON.stringify(newState));

    previousState = Object.deepClone(currentState);
    currentState = newState;

    this.emit(EVENTS.CHANGED, newState);
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

            var newState = Object.deepClone(currentState);
            newState[key] = gpio.read(pin);

            stateMonitorObservable.changeState(newState);
        });
        gpio.write(pin, gpio.HIGH);
    }

    debugInit("Output pins...");
    initOutputPinMonitoring('start');
    initOutputPinMonitoring('direction');
    initOutputPinMonitoring('speed');

    debugInit("Input pins...");
    // Floor 0 & 1 - just floor identifiers
    for (var i = 0; i < 2; i++) {
        ((pin) => {
            gpio.open(pin, gpio.INPUT);
            gpio.monitor(pin, () => {
                pinIndex = pinout.floors.indexOf(pin);

                var newState = Object.deepClone(currentState);
                newState.floors[pinIndex] = gpio.read(pin);

                debug("Pin " + pinIndex + " changed state");
                debug(JSON.stringify(newState));
                stateMonitorObservable.changeState(newState);
            });
        })(pinout.floors[i]);
    }

    // Floor & proximity sensor
    for (var i = 2; i < 4; i++) {
        ((pin) => {
            gpio.open(pin, gpio.INPUT);
            gpio.monitor(pin, () => {
                pinIndex = pinout.floors.indexOf(pin);

                var newState = Object.deepClone(currentState);

                var newValue = gpio.read(pin);
                newState.floors[pinIndex] = newValue;

                if (currentState.direction === constants.DIRECTION.UP) {
                    position++;
                } else {
                    position--;
                }

                debug("Pin " + pinIndex + " changed state");
                debug(JSON.stringify(newState));
                stateMonitorObservable.changeState(newState);
            });
        })(pinout.floors[i]);
    }

    gpio.open(pinout['limit'], gpio.OUTPUT);
    gpio.monitor(pinout['limit'], () => {
        debug("Limit pin changed state");

        var newState = Object.deepClone(currentState);
        newState[key] = gpio.read(pinout['limit']);

        stateMonitorObservable.changeState(newState);
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

function checkFloorChange(newState) {
    // We check floors[2] becouse this transoptor is in HIGH state on every floor.
    if (newState.floors[2] === 1 && previousState.floors[2] !== 1) {
        var timeout = 15;

        setTimeout(() => {
            var currentFloor = stateUtils.translateStateToFloor(getCurrentState());

            if (currentFloor != lastFloor) {
                lastFloor = currentFloor;

                stateMonitorObservable.emit(EVENTS.FLOOR_CHANGED, currentFloor);
            }
        }, timeout);
    }
}

function checkElevatorStopped(newState) {
    if (newState.start == 1 && previousState.start == 0) {
        debug("Elevator stopped at floor");
        var currentFloor = stateUtils.translateStateToFloor(newState);

        setTimeout(() => {
            debug("Emitting elevator stoped");
            stateMonitorObservable.emit(EVENTS.ELEVATOR_STOPPED, lastFloor);
        }, 20);
    }
}

function checkProximity(newState) {
    if (newState.floors[3] !== previousState.floors[3]) {
        debug("Elevator changed proximity");
        stateMonitorObservable.emit(EVENTS.NEAR_FLOOR, newState.floors[3]);
    }
}

function isFloorPosition(positionValue) {
    return [3, 7, 11, 15].indexOf(positionValue) !== -1;
}


function checkPosition(newState) {
    var positionValue = stateUtils.translateStateToPosition(newState);

    // var isFloor = ;

    if (isFloorPosition(positionValue)) {
        position = positionValue;
    } else {

        // checking going up

    }
}

stateMonitorObservable.on(EVENTS.CHANGED, (newState) => {
    checkPosition(newState);
    checkFloorChange(newState);
    checkElevatorStopped(newState);
    checkProximity(newState);
});


initializeMonitoring();
debug("Start state:");
debug(JSON.stringify(currentState));

module.exports = {
    Observable: stateMonitorObservable,
    EVENTS: EVENTS,
    getCurrentState: getCurrentState,
    forceStateRefresh: forceStateRefresh,
    getCurrentPosition: () => {
        return position;
    },
    getCurrentFloor: () => {
        debug("RETURNING REMEMBERED FLOOR: " + lastFloor);
        return lastFloor;
    },
    getCurrentDirection: () => {
        return currentState.direction;
    }
}
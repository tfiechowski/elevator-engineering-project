var debug = require('debug')('interaction');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stateMonitor = require('../state/monitor');


var EVENTS = {
    CALL: "INTERACTION.CALL",
    CONSOLE_CHANGE: "INTERACTION.CONSOLE_CHANGE",
    REQUEST_MOVE: "INTERACTION.REQUEST_MOVE"
}

// Observable

function UserInteractionObservable() {
    EventEmitter.call(this);
}

util.inherits(UserInteractionObservable, EventEmitter);

var userInteractionObservable = new UserInteractionObservable();

/**
 * This object represents user interaction buttons state at the different 
 * floors (up/down) and inside the elevator (console).
*/
var buttonStates = {
    up: [0, 0, 0, 0],
    down: [0, 0, 0, 0],
    console: [0, 0, 0, 0]
}

/**
 * This function returns current user interaction buttons state.
 * 
 * @return {Object} object that contains arrays for up, down, and console buttons states
 */
function getButtonsState() {
    return Object.deepClone(buttonStates);
}

/**
 * This function emits the CONSOLE_CHANGE event. It should be triggered after processing
 * CALL request - when console buttons change.
 */
function emitConsoleChange() {
    debug("Emitting " + EVENTS.CONSOLE_CHANGE + " event. Buttons state: " + JSON.stringify(getButtonsState()));
    userInteractionObservable.emit(EVENTS.CONSOLE_CHANGE, getButtonsState());
}

/**
 * This function processes the CALL request and updates corresponding 
 * values in the 'buttonStates' object.
 * 
 * @param {Object} req call request object
 */
function processCallRequest(req) {
    var floor = req.floor;

    if (req.up == true) {
        buttonStates.up[floor] = 1;
    }

    if (req.down == true) {
        buttonStates.down[floor] = 1;
    }

    debug("Processed CALL request. New ButtonsState: " + JSON.stringify(buttonStates));
    emitConsoleChange();
}

function processRequestMoveRequest(req) {
    if (req.destinationFloors.length > 0) {
        // For each destination floor, we mark corresponding console value to 1
        for (var i of req.destinationFloors) {
            buttonStates.console[i] = 1;
        }

        emitConsoleChange();
    }

}

UserInteractionObservable.prototype.callElevator = function (data) {
    processCallRequest(data);

    debug("Emitting " + EVENTS.CALL + " event");
    return this.emit(EVENTS.CALL, data);
}

UserInteractionObservable.prototype.requestMove = function(data) {
    processRequestMoveRequest(data);

    debug("Emitting " + EVENTS.REQUEST_MOVE + " event");
    return this.emit(EVENTS.REQUEST_MOVE, data);
}

stateMonitor.Observable.on(stateMonitor.EVENTS.ELEVATOR_STOPPED, (floor) => {
    // After reaching the floor, we reset all console values there

    debug("Resetting console on floor: " + floor);

    // buttonStates.up[newFloor] = 0;
    // buttonStates.down[newFloor] = 0;
    buttonStates.console[floor] = 0;

    // emitConsoleChange();
});

function resetButtonStatesForFloor(floor) {
    buttonStates.up[floor] = 0;
    buttonStates.down[floor] = 0;
    buttonStates.console[floor] = 0;

    emitConsoleChange();
}

module.exports = {
    Observable: userInteractionObservable,
    getButtonsState: getButtonsState,
    emitConsoleChange: emitConsoleChange,
    resetButtonStatesForFloor: resetButtonStatesForFloor,
    EVENTS: EVENTS
}
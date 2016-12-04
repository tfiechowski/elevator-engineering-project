var debug = require('debug')('interaction/interaction');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var EVENTS = { 
    CALL: "INTERACTION.CALL"
}

function UserInteractionObservable() {
    EventEmitter.call(this);
}

/**
 * This object represents user interaction buttons state at the different 
 * floors (up/down) and inside the elevator (console).
*/
var buttonStates = {
    up: [0,0,0,0],
    down: [0,0,0,0],
    console: [0,0,0,0]
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
 * This function processes the CALL request and updates corresponding 
 * values in the 'buttonStates' object.
 * 
 * @param {Object} req call request object
 */
function processCallRequest(req) {
    var floor = req.floor;

    if(req.up) {
        buttonStates.up[floor] = 1;
    }

    if(req.down) {
        buttonStates.down[floor] = 1;
    }

    if(req.destinationFloors.length > 0) {
        // For each destination floor, we mark corresponding console value to 1
        for(var i of req.destinationFloors) {
            buttonStates.console[i] = 1;
        }
    }

    debug("Processed CALL request. New ButtonsState: " + JSON.stringify(buttonStates));
}

// Observable

util.inherits(UserInteractionObservable, EventEmitter);
 
UserInteractionObservable.prototype.callElevator = function (data) {
    processCallRequest(data);
    
    debug("Emitting " + EVENTS.CALL + " event");
    return this.emit(EVENTS.CALL, data);
}

var userInteractionObservable = new UserInteractionObservable();


module.exports = {
    Observable: userInteractionObservable,
    getButtonsState: getButtonsState,
    EVENTS: EVENTS
}
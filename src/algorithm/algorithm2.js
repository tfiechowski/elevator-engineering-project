"use strict";
var debug = require('debug')('algorithm2');
var state = require('../state/monitor');
var stateConstants = require('../state/constants');
var interaction = require('../interaction/interaction');
var elevator = require('../elevator/api');

debug("Initializing algorithm2");

var elevatorConsole = interaction.elevatorConsole;

var floorQueue = [];
var isMoving = false;

interaction.Observable.on(interaction.EVENTS.CALL, (callRequest) => {
    debug("Recieved CALL event");
    var floor = callRequest.floor;

    // If no up or down is specified, the elevator will not move!
    if (callRequest.up == true) {
        elevatorConsole.up.push(floor);
        Array.merge(floorQueue, [floor]);
    }

    if (callRequest.down == true) {
        elevatorConsole.down.push(floor);
        Array.merge(floorQueue, [floor]);
    }
});

interaction.Observable.on(interaction.EVENTS.REQUEST_MOVE, (moveRequest) => {
    debug("Recieved move request!");
    Array.merge(elevatorConsole.destinationFloors, moveRequest.destinationFloors);

    Array.merge(floorQueue, moveRequest.destinationFloors);
});

state.Observable.on(state.EVENTS.ELEVATOR_STOPPED, (floor) => {
    debug("Elevator stopped at floor " + floor + ". Choosing next floor to go to.");
    isMoving = false;

    // Those ifs are commented out for purpose of ELEVATOR_STOPPED emulation

    //    if (state.getCurrentDirection() == stateConstants.DIRECTION.UP) {
    elevatorConsole.up.remove(floor);
    //  }
    //if (state.getCurrentDirection() == stateConstants.DIRECTION.DOWN) {
    elevatorConsole.down.remove(floor);
    //}

    elevatorConsole.destinationFloors.remove(floor);
});

// We check if there are any new destinationFloors periodically.
var intervalCounter = 0;
setInterval(() => {
    if (floorQueue.length > 0 && isMoving === false) {
        debug("Interval #" + intervalCounter + "\tQueue: " + floorQueue);
        var nextFloor = floorQueue[0];
        
        if(elevator.goToFloor !== undefined) {
            elevator.goToFloor(nextFloor);

            floorQueue.shift();

            intervalCounter++;
            isMoving = true;
        }

    }
}, 1000);

function reset() {
    floorQueue = [];
    // elevator.stop()
}
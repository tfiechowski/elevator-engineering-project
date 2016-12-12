var debug = require('debug')('algorithm');

var stateMonitor = require('../state/monitor');
var state = require('../state/monitor').Observable;
var stateEvents = require('../state/monitor').EVENTS;

var interactionMonitor = require('../interaction/interaction');
var interaction = require('../interaction/interaction').Observable;
var interactionEvents = require('../interaction/interaction').EVENTS

var proxy = require('../events/proxy');

var elevator = require('../elevator/api');

debug("Initializing elevator control algorithm");

var floorQueue = [];

Array.merge = function (array1, array2) {
    for (var a2 of array2) {
        if (array1.indexOf(a2) < 0) {
            array1.push(a2);
        }
    }

    return array1;
}

var callQueue = { up: [], down: [] };
var destinationFloors = [];
var isMoving = false;

function clearQueues() {
    var currentFloor = stateMonitor.getCurrentFloor();
}

state.on(proxy.EVENTS.STATE.ELEVATOR_STOPPED, (floor) => {
    isMoving = false;

    let upIndex = callQueue.up.indexOf(floor);
    if (upIndex >= 0) {
        callQueue.up.splice(upIndex, 1);
    }

    let downIndex = callQueue.down.indexOf(floor);
    if (upIndex >= 0) {
        callQueue.down.splice(downIndex, 1);
    }

    dfIndex = destinationFloors.indexOf(floor);
    if (dfIndex >= 0) {
        destinationFloors.splice(dfIndex, 1);
    }

    moveElevator();
});

proxy.observable.on(proxy.EVENTS.INTERACTION.REQUEST_MOVE, (request) => {
    debug("Move request to: " + request.destinationFloors);

    destinationFloors = Array.merge(destinationFloors, request.destinationFloors).sort();
    debug("Destination floors: " + destinationFloors);
    moveElevator();
});

proxy.observable.on(proxy.EVENTS.INTERACTION.CALL, (data) => {
    debug('Recieved CALL event: ');
    debug(JSON.stringify(data));

    if (data.up == 1) {
        debug("Adding " + data.floor + " to up queue");
        callQueue.up = Array.merge(callQueue.up, [data.floor]);
    }

    if (data.down == 1) {
        debug("Adding " + data.floor + " to down queue");
        callQueue.down = Array.merge(callQueue.down, [data.floor]);
    }

    moveElevator();
});

function moveElevator() {
    if(isMoving) {
        return;
    }

    debug(JSON.stringify(callQueue));
    debug(JSON.stringify(destinationFloors));

    callQueue.up = callQueue.up.sort();
    callQueue.down = callQueue.down.sort().reverse();

    // szukamy pieter u gory
    
    var currentFloor = stateMonitor.getCurrentFloor();
    var upperFloors = Array.merge(callQueue.up, destinationFloors).filter((el) => {
        return el > currentFloor;
    });
    

    if (callQueue.up.length > 0) {
        // //move to first upper

        // var nearestUpper = callQueue.up.find((el) => {
        //     return el > currentFloor;
        // });

        // if (nearestUpper !== undefined) {
        //     elevator.goToFloor(nearestUpper);
        // }
        debug("Moving to first floor from up queue " + callQueue.up);
        elevator.goToFloor(callQueue.up[0]);
        callQueue.up.shift();
    } else if (callQueue.down.length > 0) {
        debug("Moving to first floor from down queue " + callQueue.down);
        elevator.goToFloor(callQueue.down[0]);
        callQueue.down.shift();
    } else if (destinationFloors.length > 0) {
        debug("Moving to first floor from destination floors " + destinationFloors);
        elevator.goToFloor(destinationFloors[0]);
        destinationFloors.shift();
    } else {
        debug("No floor to move elevator");
    }
}

debug("Done!");
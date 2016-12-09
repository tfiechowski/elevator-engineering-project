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

function addFloorsToQueue(floors) {
    for (var floor of floors) {
        if (floorQueue.indexOf(floor) === -1) {
            floorQueue.push(floor);
        }
    }

    debug("Floor queue:" + floorQueue);
    if (floorQueue.length > 0) {
        debug("Current floor: " + stateMonitor.getCurrentFloor());
        if (floorQueue[0] == stateMonitor.getCurrentFloor()) {
            floorQueue.shift();
        }
    }
    debug("Floor queue x2:" + floorQueue);
}

debug("Subscribing: " + proxy.EVENTS.INTERACTION.CALL);
proxy.observable.on(proxy.EVENTS.INTERACTION.CALL, (data) => {
    debug('Recieved CALL event: ');
    debug(JSON.stringify(data));

    addFloorsToQueue(data.destinationFloors);
    debug("Floor queue:" + floorQueue);

    if (floorQueue.length == 1) {
        elevator.goToFloor(floorQueue[0]);
    }
});

proxy.observable.on(proxy.EVENTS.STATE.FLOOR_CHANGED, (data) => {
    debug('Elevator changed floor: ' + JSON.stringify(data));

    if (floorQueue.length > 0) {
        if (data == floorQueue[0]) {
            debug("Reached first floor from queue: " + floorQueue)
            interactionMonitor.resetButtonStatesForFloor(floorQueue[0]);
            floorQueue.shift();
            debug("Floor queue after shift " + floorQueue)

            if (floorQueue.length > 0) {
                debug("Now going to floor: " + floorQueue[0]);
                elevator.goToFloor(floorQueue[0]);
            }

        }
    }

});

proxy.observable.on(proxy.EVENTS.STATE.NEAR_FLOOR, (isNear) => {
    debug("Elevator is near : " + isNear);
    if (floorQueue.length > 0) {
        if (isNear == 1 && stateMonitor.getCurrentFloor() == floorQueue[0]) {
            elevator.setSlowMovement();
        } else {
            // elevator.setFastMovement();
        }
    }
});

debug("Done!");
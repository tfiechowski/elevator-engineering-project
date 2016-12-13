var debug = require('debug')('algorithm2');
var state = require('../state/monitor');
var stateConstants = require('../state/constants');
var interaction = require('../interaction/interaction');
var elevator = require('../elevator/api');

debug("Initializing algorithm2");

var elevatorConsole = interaction.elevatorConsole;

function resetFloor(floor) {

}

interaction.Observable.on(interaction.EVENTS.CALL, (callRequest) => {
    debug("Recieved CALL event");
    var floor = callRequest.floor;

    if (callRequest.up == true) {
        elevatorConsole.up.push(floor);
    }

    if (callRequest.down == true) {
        elevatorConsole.down.push(floor);
    }
});

interaction.Observable.on(interaction.EVENTS.REQUEST_MOVE, (moveRequest) => {
    debug("Recieved move request!");
    Array.merge(elevatorConsole.destinationFloors, moveRequest.destinationFloors);
});

state.Observable.on(state.EVENTS.ELEVATOR_STOPPED, (floor) => {
    debug("Elevator stopped at floor " + floor + ". Choosing next floor to go to.");

    if (state.getCurrentDirection() == stateConstants.DIRECTION.UP) {
        elevatorConsole.up.remove(floor);
    }
    if (state.getCurrentDirection() == stateConstants.DIRECTION.DOWN) {
        elevatorConsole.down.remove(floor);
    }

    elevatorConsole.destinationFloors.remove(floor);
});

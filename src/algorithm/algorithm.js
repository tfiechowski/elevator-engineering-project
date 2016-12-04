var debug = require('debug')('algorithm');

var state = require('../state/monitor').Observable;
var stateEvents = require('../state/monitor').Events;

var interaction = require('../interaction/interaction').Observable;
var interactionEvents = require('../interaction/interaction').EVENTS

var elevator = require('../elevator/api');

debug("Initializing elevator control algorithm");

interaction.on(interactionEvents.CALL, (data) => {
    debug('Recieved CALL event: ');
    debug(JSON.stringify(data));

    elevator.goToFloor(data.floor);
});

state.on(stateEvents.CHANGED, (data) => {
    debug('Elevator changed floor: ' + JSON.stringify(data));
});

debug("Done!");
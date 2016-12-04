var debug = require('debug')('algorithm');

var state = require('../state/monitor').Observable;
var stateEvents = require('../state/monitor').Events;

var interaction = require('../interaction/interaction').Observable;
var interactionEvents = require('../interaction/interaction').EVENTS

debug("Initializing elevator control algorithm");

interaction.on(interactionEvents.CALL, (data) => {
    debug('Recieved CALL event: ' + JSON.stringify(data));
});

state.on(stateEvents.CHANGED, (data) => {
    debug('Elevator changed floor: ' + JSON.stringify(data));
})

debug("Done!");
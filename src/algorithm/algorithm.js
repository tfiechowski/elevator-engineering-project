var debug = require('debug')('algorithm');

var state = require('../state/monitor').Observable;
var stateEvents = require('../state/monitor').EVENTS;

var interaction = require('../interaction/interaction').Observable;
var interactionEvents = require('../interaction/interaction').EVENTS

var proxy = require('../events/proxy');

var elevator = require('../elevator/api');

debug("Initializing elevator control algorithm");

debug("Subscribing: " + proxy.EVENTS.INTERACTION.CALL);
proxy.observable.on(proxy.EVENTS.INTERACTION.CALL, (data) => {
    debug('Recieved CALL event: ');
    debug(JSON.stringify(data));

    elevator.goToFloor(data.floor);
});

proxy.observable.on(proxy.EVENTS.STATE.CHANGED, (data) => {
    debug('Elevator changed floor: ' + JSON.stringify(data));
});

debug("Done!");
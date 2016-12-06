var debug = require('debug')('events:proxy');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var monitor = require('../state/monitor');
var interaction = require('../interaction/interaction');

function EventProxyObservable() {
    EventEmitter.call(this);
}

util.inherits(EventProxyObservable, EventEmitter);

var eventProxyObservable = new EventProxyObservable();

/**
 * This function proxies given events from given observable to EventProxyObservable
 * 
 * @param {Object} observable observable from which we want to proxy events
 * @param {Object} events object with events defined, that will be proxied
 */
function proxyEvents(observable, events) {
    for (var _key in events) {
        ((key) => {
            observable.on(events[key], (data) => {
                debug("Proxying " + events[key]);
                eventProxyObservable.emit(events[key], data);
            });
        })(_key);
    }
}

debug("Initializing event proxying...");
proxyEvents(monitor.Observable, monitor.EVENTS);
proxyEvents(interaction.Observable, interaction.EVENTS);

module.exports = {
    observable: eventProxyObservable,
    EVENTS: {
        INTERACTION: interaction.EVENTS,
        STATE: monitor.EVENTS
    }
}



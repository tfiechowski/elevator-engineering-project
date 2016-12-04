var debug = require('debug')('interaction/interaction');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var EVENTS = { 
    CALL: "INTERACTION.CALL"
}

function UserInteractionObservable() {
    EventEmitter.call(this);
}

util.inherits(UserInteractionObservable, EventEmitter);
 
UserInteractionObservable.prototype.callElevator = function (data) {
    debug("Emitting " + EVENTS.CALL + " event");
    return this.emit(EVENTS.CALL, data);
}

var userInteractionObservable = new UserInteractionObservable();



module.exports = {
    Observable: userInteractionObservable,
    EVENTS: EVENTS
}
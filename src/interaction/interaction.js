var debug = require('debug')('interaction');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stateMonitor = require('../state/monitor');


var EVENTS = {
    CALL: "INTERACTION.CALL",
    CONSOLE_CHANGE: "INTERACTION.CONSOLE_CHANGE",
    REQUEST_MOVE: "INTERACTION.REQUEST_MOVE"
}

// Observable

function UserInteractionObservable() {
    EventEmitter.call(this);
}

util.inherits(UserInteractionObservable, EventEmitter);

var userInteractionObservable = new UserInteractionObservable();

/**
 * This function emits the CONSOLE_CHANGE event. It should be triggered after processing
 * CALL request - when console buttons change.
 */
function emitConsoleChange(elevatorConsole) {
    var consoleState = buildFullConsole(elevatorConsole);

    debug("Emitting " + EVENTS.CONSOLE_CHANGE + " event. Buttons state: " + JSON.stringify(consoleState));
    userInteractionObservable.emit(EVENTS.CONSOLE_CHANGE, consoleState);
}

function processRequestMoveRequest(req) {

}

UserInteractionObservable.prototype.callElevator = function (data) {
    debug("Emitting " + EVENTS.CALL + " event");
    return this.emit(EVENTS.CALL, data);
}

UserInteractionObservable.prototype.requestMove = function (data) {
    debug("Emitting " + EVENTS.REQUEST_MOVE + " event");
    return this.emit(EVENTS.REQUEST_MOVE, data);
}

function buildFullConsole(ec) {
    var up = [0, 0, 0, 0];
    for (var i of ec.up) {
        up[i] = 1;
    }

    var down = [0, 0, 0, 0];
    for (var i of ec.down) {
        down[i] = 1;
    }

    var _console = [0, 0, 0, 0];
    for (var i of ec.destinationFloors) {
        _console[i] = 1;
    }

    return {
        up: up,
        down: down,
        console: _console
    }
}

class ElevatorConsole {
    constructor() {
        this.up = [];
        this.down = [];
        this.destinationFloors = [];

        var self = this;

        this.up.push = function (data) {
            var ret = Array.prototype.push.call(this, data);
            emitConsoleChange(self);
            return ret;
        }

        this.up.remove = function (element) {
            var index = self.up.indexOf(element);

            if (index >= 0) {
                self.up.splice(index, -1);
                emitConsoleChange(self);
            }
        }

        this.down.push = function (data) {
            var ret = Array.prototype.push.call(this, data);
            emitConsoleChange(self);
            return ret;
        }

        this.down.remove = function (element) {
            var index = self.down.indexOf(element);

            if (index >= 0) {
                self.down.splice(index, -1);
                emitConsoleChange(self);
            }
        }

        this.destinationFloors.push = function (data) {
            var ret = Array.prototype.push.call(this, data);
            emitConsoleChange(self);
            return ret;
        }

        this.destinationFloors.remove = function (element) {
            var index = self.destinationFloors.indexOf(element);

            if (index >= 0) {
                self.destinationFloors.splice(index, -1);
                emitConsoleChange(self);
            }
        }
    }
}

var elevatorConsole = new ElevatorConsole();
Object.seal(elevatorConsole);

module.exports = {
    Observable: userInteractionObservable,
    emitConsoleChange: emitConsoleChange,
    elevatorConsole: elevatorConsole,
    EVENTS: EVENTS
}
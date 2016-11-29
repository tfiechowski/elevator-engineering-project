// This layer provides an abstraction to the GPIO ports.

var debug = require('debug')('board/gpio');
var rpio;

try {
    rpio = require('rpio');
} catch (E) {
    rpio = {};
}

function GPIO() {

}

GPIO.prototype.open = function(pin, mode) {
    debug("Opening GPIO " + pin + " to: " + mode);
    rpio.open(pin, mode);
}

GPIO.prototype.write = function (pin, val) {
    debug("Writing \"" + val + "\" to GPIO: " + pin);
    rpio.write(pin, val);
}

GPIO.prototype.read = function (pin) {
    debug("Reading GPIO: " + pin);
    return rpio.read(pin);
}

GPIO.prototype.monitor = function (pin, callback) {
    debug("Monitoring GPIO: " + pin);
    rpio.poll(pin, callback);
}

GPIO.prototype.close = function (pin) {
    rpio.close(pin);
}

module.exports = {
    GPIO: GPIO,
    Values: {
        'High': GPIO.HIGH,
        'Low': GPIO.LOW
    },
    Modes: {
        'INPUT': GPIO.INPUT,
        'OUTPUT': GPIO.OUTPUT
    }
}
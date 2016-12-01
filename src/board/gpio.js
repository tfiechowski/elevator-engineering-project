// This layer provides an abstraction to the GPIO ports.

var debug = require('debug')('board/gpio');
var rpio;

try {
    rpio = require('rpio');
} catch (E) {
    var caution = () => {
        debug("Not running on RaspberryPi- GPIO operations have no effect!");
    }

    rpio = {
        open: caution,
        write: caution,
        read: caution,
        close: caution,
        poll: caution,
        monitor: caution,
        INPUT: "INPUT",
        OUTPUT: "OUTPUT",
        HIGH: 1,
        LOW: 0
    };
}

function GPIO() {

}

GPIO.open = function(pin, mode, defaultValue) {
    debug("Opening GPIO " + pin + " to: " + mode);
    rpio.open(pin, mode);
}

GPIO.write = function (pin, val) {
    debug("Writing \"" + val + "\" to GPIO: " + pin);
    rpio.write(pin, val);
}

GPIO.read = function (pin) {
    debug("Reading GPIO: " + pin);
    return rpio.read(pin);
}

GPIO.monitor = function (pin, callback) {
    debug("Monitoring GPIO: " + pin);
    rpio.poll(pin, callback);
}

GPIO.close = function (pin) {
    rpio.close(pin);
}

GPIO.INPUT = rpio.INPUT;
GPIO.OUTPUT = rpio.OUTPUT;

module.exports = {
    GPIO: GPIO,
    Values: {
        'High': rpio.HIGH,
        'Low': rpio.LOW
    },
    Modes: {
        'INPUT': rpio.INPUT,
        'OUTPUT': rpio.OUTPUT
    }
}
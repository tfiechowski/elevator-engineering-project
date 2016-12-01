var debug = require('debug')('board/api');
var gpio = require('../board/gpio').GPIO;
var gpioValues = require('../board/gpio').Values;
var pinout = require('../../config/config.json').pinout;

function setOutput(output, value) {
    var _val = gpioValues.High;
    if (value === 0) {
        _val = gpioValues.Low;
    }

    debug("SetOutput: " + output + " (pin: " + pinout[output] + ") with value: " + value);
    switch (output) {
        case 'start': gpio.write(pinout['start'], _val); break;
        case 'direction': gpio.write(pinout['direction'], _val); break;
        case 'speed': gpio.write(pinout['speed'], _val); break;
    }
}

function goToFloor(destinationFloor) {
    throw new Error("Not yet implemented!");   
}

module.exports = {
    setOutput: setOutput,
    goToFloor: goToFloor
}
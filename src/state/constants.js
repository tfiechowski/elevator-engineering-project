var debug = require('debug')('state:constants:init');
var controlConstants = require('../../config/config.json').controlConstants;
var gpio = require('../board/gpio');

function copyKeys(src, dst) {
    for(var key in src) {
        if(typeof src[key] === "object") {
            dst[key.toUpperCase()] = {};
            copyKeys(src[key], dst[key.toUpperCase()]);
        } else if(typeof src[key] === "number") {
            dst[key.toUpperCase()] = gpio.convertToPinValue(src[key]);
        } else {
            throw new Error("In config file, control constants values should only be numbers!");
        }
    }
}

var constants = {}
debug("Reading control constants from config.json :");
copyKeys(controlConstants, constants);
debug(JSON.stringify(constants));
debug("Done!");

module.exports = constants;


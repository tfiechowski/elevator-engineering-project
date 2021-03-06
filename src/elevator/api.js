var debug = require('debug')('elevator:api');
var gpio = require('../board/gpio');
var pinout = require('../../config/config.json').pinout;
var stateUtils = require('../state/utils');
var stateMonitor = require('../state/monitor');
var stateConstants = require('../state/constants');

// Variables
var stopState = null;

// Monitoring

// Stopping the elevator on the given stop state (matching floors).
stateMonitor.Observable.on(stateMonitor.EVENTS.CHANGED, (newState) => {
    if (stopState === null) {
        return;
    }

    if (stateUtils.compareStatesFloors(stopState, newState)) {
        stop();
        resetStopState();
    }
});

/**
 * This function sets the state on which elevator should be stopped once reached.
 * 
 * @param {Object} state destination, stop state
 * @return {Boolean} true if state was set, false otherwise
 */
function setStopFloor(stopFloor) {
    stopFloor = stopFloor | 0;
    if (typeof stopFloor !== "number") {
        debug("setStopFloor: Stop floor is not a number!");
        return false;
    }

    if (stopFloor < 0) {
        stopFloor = 0;
    } else if (stopFloor > 3) {
        stopFloor = 3;
    }

    var destinationFloorState = stateUtils.translateFloorToState(stopFloor);
    debug("Stop state floors: [" + destinationFloorState + "]");

    stopState = { floors: destinationFloorState };
    return true;
}

/**
 * This function resets the stop state.
 */
function resetStopState() {
    debug("Resetting stop state");
    stopState = null;
}

/** 
 * This function sets output to a given value. 
 * 
 * @param {String} output identifier of output. Possible identifiers are: 'start', 'direction', 'speed'
 * @param {Number} value value to set
 */
function setOutput(output, value) {
    debug("SetOutput: " + output + " (pin: " + pinout[output] + ") with value: " + value);

    // TODO: reverse dependency
    // algorithm.reset();

    var _val = gpio.convertToPinValue(value);
    switch (output) {
        case 'start':
        case 'direction':
        case 'speed':
            gpio.write(pinout[output], _val); break;

        default:
            debug('setOutput: no output pin of type: ' + output);
    }
}

/**
 * This function sets start pin to given value. It shorthand for setOutput('start', value)
 * 
 * @param {Number} value value to be set on the start pin
 */
function setStart(value) {
    setOutput('start', value);
}

/**
 * This function sets direction pin to given value. It shorthand for setOutput('direction', value)
 * 
 * @param {Number} value value to be set on the direction pin
 */
function setDirection(value) {
    setOutput('direction', value);
}

/**
 * This function sets speed pin to given value. It's' shorthand for setOutput('speed', value)
 * 
 * @param {Number} value value to be set on the speed pin
 */
function setSpeed(value) {
    setOutput('speed', value);
}

/** 
 * This function sends the elevator to the given floor.
 * 
 * @param {Number} destinationFloor floor that elevator will go to.
 */
function goToFloor(destinationFloor) {
    debug("Going to floor: " + destinationFloor);

    // TODO: reverse dependency
    // algorithm.reset();

    stop();

    setStopFloor(destinationFloor);

    var destinationDirection =
        stateUtils.getDirectionToFloor(stateMonitor.getCurrentPosition(), destinationFloor);

    debug("Direction:" + destinationDirection);
    setDirection(destinationDirection);

    // Timeout is needed for keys inside the elevator to change, and for voltages to stabilise.
    var timeout = 500;
    setTimeout(() => {
        debug("Starting elevator after " + timeout + " after setting direction pin");
        start();
    }, timeout);
}

/**
 * This function stops the elevator. It's shorthand for setStart(START.STOP);
 */
function stop() {
    setOutput('start', stateConstants.START.STOP);
}

/**
 * This function starts the elevator. It's shorthand for setStart(START.START);
 */
function start() {
    setOutput('start', stateConstants.START.START);
}

/**
 * This function sets the direction of the elevator to 'UP'. 
 * It's shorthand for setDirection(DIRECTION.UP);
 */
function setDirectionUp() {
    setDirection(stateConstants.DIRECTION.UP);
}

/**
 * This function sets the direction of the elevator to 'DOWN'. 
 * It's shorthand for setDirection(DIRECTION.DOWN);
 */
function setDirectionDown() {
    setDirection(stateConstants.DIRECTION.DOWN);
}

/** 
 * This function tells the elevator to move FAST.
 * It's shorthand for setSpeed(SPEED.FAST);
 */
function setFastMovement() {
    setSpeed(stateConstants.SPEED.FAST);
}

/** 
 * This function tells the elevator to move SLOWLY.
 * It's shorthand for setSpeed(SPEED.SLOW);
 */
function setSlowMovement() {
    setSpeed(stateConstants.SPEED.SLOW);
}

function getCurrentDirection() {

}

function isMoving() {
    return stateMonitor.getCurrentState().start == stateConstants.START.START;
}


module.exports = {
    setOutput: setOutput,
    goToFloor: goToFloor,
    stop: stop,
    setFastMovement: setFastMovement,
    setSlowMovement: setSlowMovement
}
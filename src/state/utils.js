var controlConstants = require('constants');

/**
 * Transoptor sensor readings for floors:
 * 
 *      T1  T2  T3  T4
 *      1   1   1   1
 *      1   0   1   1
 *      0   1   1   1
 *      0   0   1   1
 * 
 */

/**
 * This function translates a destination floor number to corresponding transoptor values 
 * that are identifying that floor.
 * 
 * @param {Number} floor number of the floor 
 * @returns {Array} array of four values, identifying given floor
 */
function translateFloorToState(floor) {
    var binValue = ("0000" + ((floor >>> 0).toString(2) + "11")).slice(-4);
    return binValue.split("").map((value) => {
        return value | 0;
    });
}

function translateStateToFloor(state) {
    return parseInt(state.floors.join("").slice(0, 2), 2);
}

function getDirectionToFloorFromCurrentPosition(currentState, destinationFloor) {
    var currentFloor = translateStateToFloor(currentState);

    if (currentFloor < destinationFloor) {
        return controlConstants.DIRECTION.DOWN;
    } else {
        return controlConstants.DIRECTION.UP;
    }
}


/**
 * This function validates if the given object has proper schema of state object.
 * Proper state object should be in the form of :
 * { 
 *  floors: Array of length 4,
 *  start: 1/0,
 *  direction: 1/0,
 *  speed: 1/0
 * }
 * 
 * @param {Object} state object to check its schema
 * @returns {Boolean} true if object has state schema, false otherwise
 */
function validateStateObject(state) {
    if(state === null || state === undefined) {
        return false;
    }

    if (state['floors'] !== undefined) {
        if (!Array.isArray(state.floors) || state.floors.length !== 4) {
            return false;
        }
    } else {
        return false;
    }

    var checkValue = (obj, key) => {
        if (obj[key] !== undefined) {
            if (obj[key] === 1 || obj[key] === 0) {
                return true;
            }
        }
        return false;
    }

    if (!checkValue(state, 'start')) return false;
    if (!checkValue(state, 'direction')) return false;
    if (!checkValue(state, 'speed')) return false;

    if (Object.keys(state).length !== 4) return false;

    return true;
}

function compareStates(state1, state2) {
    if (!validateStateObject(state2) || !validateStateObject(state2)) {
        debug("compareStates: at least one of given states has invalid schema!")
        return false;
    }

    if (!Array.isEqual(state1.floors, state2.floors)) return false;

    if (state1.start !== state2.start) return false;
    if (state1.direction !== state2.direction) return false;
    if (state1.speed !== state2.speed) return false;

    return true;
}

function compareStatesFloors(state1, state2) {
    if (!validateStateObject(state2) || !validateStateObject(state2)) {
        debug("compareStatesFloors: at least one of given states has invalid schema!")
        return false;
    }

    return Array.isEqual(state1.floors, state2.floors);
}



module.exports = {
    validateStateObject: validateStateObject,
    compareStates: compareStates,
    compareStatesFloors: compareStatesFloors,
    translateFloorToState: translateFloorToState,
    translateStateToFloor: translateStateToFloor,
    getDirectionToFloorFromCurrentPosition: getDirectionToFloorFromCurrentPosition
}
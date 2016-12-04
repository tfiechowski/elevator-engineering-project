var debug = require('debug')('api/interaction');
var express = require('express');
var router = express.Router();
var interaction = require('../../src/interaction/interaction');

/**
 * This function validates the body of CALL request. 
 * Its proper schema is:
 *
 * {
 *    type: "CALL",
 *    floor: <0,3>,
 *    up: boolean,
 *    down: boolean,
 *    destinationFloors: [<0,4>]
 * }
 */
function validateCallBody(body) {
    var isUndefined = (obj, key) => {
        return obj[key] === undefined;
    }

    if(isUndefined(body, 'floor') ||
        isUndefined(body, 'up') ||
        isUndefined(body, 'down') ||
        isUndefined(body, 'destinationFloors') ||
        isUndefined(body, 'type')) {
        return false;
    }

    // if(body['floor'] < 0) {
    //     body['floor'] = 0;
    // } else if(floor > 3) {
    //     body['floor'] = 3;
    // }

    // body['up'] |= body['up']
    // body['down'] |= body['down']

    // if(!Array.isArray(body['destinationFloors'])) {
    //     return false;
    // }

    // if(body['type'] !== "CALL") {
    //     return false;
    // }

    return true;
}

/**
 * This route is for CALL request from User Interaction.
 */
router.post('/call', function (req, res, next) {
    if (!validateCallBody(req.body)) {
        debug('Body is invalid!');
        res.sendStatus(400);
    } 

    debug("Calling the elevator from floor " + req.body['floor'] +
        ". Up: " + req.body['up'] + 
        ". Down: " + req.body['down'] + 
        ". Destination floors: " + req.body['destinationFloors']);

    if (interaction.Observable.callElevator(req.body)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

module.exports = router;

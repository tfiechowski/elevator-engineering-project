var debug = require('debug')('api:interaction');
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

    if (isUndefined(body, 'floor') ||
        isUndefined(body, 'up') ||
        isUndefined(body, 'down') ||
        isUndefined(body, 'type')) {
        return false;
    }

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
        ". Down: " + req.body['down']);

    if (interaction.Observable.callElevator(req.body)) {
        res.sendStatus(200);
    } else {
        debug("Internal server error");
        res.sendStatus(500);
    }
});

/**
 * This route is for CALL request from User Interaction.
 */
router.post('/moverequest', function (req, res, next) {

    // Empty arrays are 'erased' when POSTing, we recreate it here.
    if (req.body['destinationFloors'] === undefined) {
        req.body['destinationFloors'] = [];
    }

    debug("Ordering the elevator to go from " + req.body['floor'] +
        "to destination floors: " + req.body['destinationFloors']);

    if (interaction.Observable.requestMove(req.body)) {
        res.sendStatus(200);
    } else {
        debug("Internal server error");
        res.sendStatus(500);
    }
});

module.exports = router;

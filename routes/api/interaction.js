/*
CALL:
{
    type: "CALL",
    floor: <0,3>,
    up: boolean,
    down: boolean,
    destinationFloors: [<0,4>]
}

DELAY:
{
    type: "DELAY",
    duration: Number [ms]
}

*/
var debug = require('debug')('api/interaction');
var express = require('express');
var router = express.Router();
var interaction = require('../../src/interaction/interaction');

function validateCallBody(body) {
    var isUndefined = (obj, key) => {
        return obj[key] === undefined;
    }

    return !(isUndefined(body, 'floor') ||
        isUndefined(body, 'up') ||
        isUndefined(body, 'down') ||
        isUndefined(body, 'destinationFloors') ||
        isUndefined(body, 'type'));
}

router.post('/call', function (req, res, next) {
    if (!validateCallBody(req.body)) {
        debug('Body is invalid!');
        res.sendStatus(400);
    } 

    var floor = req.body['floor'];
    var up = req.body['up'];
    var down = req.body['down'];
    var destinationFloors = req.body['destinationFloors'];
        
    debug("Calling the elevator from floor " + floor + ". Up: " + up + " Down: " + down + "\tDestination floors: " + destinationFloors);

    if (interaction.Observable.callElevator(req.body)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

module.exports = router;

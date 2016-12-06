var debug = require('debug')('api:elevator');
var express = require('express');
var router = express.Router();
var elevator = require('../../src/elevator/api');

/**
 * This route tells the elevator to go to given floors.
 */
router.post('/goToFloor/:floor', (req, res) => {
    var floor = req.params.floor;

    debug("Accepted request to go to floor: " + floor);

    elevator.goToFloor(floor);

    res.sendStatus(200);
});

/**
 * This route sets given output to a given value.
 */
router.post('/setOutput', (req, res) => {
    debug("route: /api/elevator/setOutput");
    var type = req.body.type;
    var value = req.body.value | 0;

    debug("Setting pin: '" + type + "' to: " + value);

    elevator.setOutput(type, value);

    res.sendStatus(200);
});

module.exports = router;
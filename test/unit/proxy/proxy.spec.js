var helpers = require('../../../globalUtils');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var interaction = require('../../../src/interaction/interaction');
var proxy = require('../../../src/events/proxy');

describe('events', () => {
    describe('proxy', () => {
        it('EventProxy should proxy INTERACTION.CALL event from interactionObservable', (done) => {
            proxy.observable.once(proxy.EVENTS.INTERACTION.CALL, () => {
                done();
            });

            interaction.Observable.callElevator({
                floor:1, 
                up:true, 
                down: true, 
                destinationFloors: [0,1,2,3], 
                type: "CALL"
            });
        });
    });
});


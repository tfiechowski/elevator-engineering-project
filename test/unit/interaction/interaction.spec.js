var helpers = require('../../../globalUtils');
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var stateUtils = require('../../../src/state/utils');
var interaction = require('../../../src/interaction/interaction');

describe('interaction', () => {
    describe('call', () => {
        it('initial buttonsState value should be arrays filled with zeros', (done) => {
            var initialState = interaction.getButtonsState();

            expect(Array.isEqual(initialState.up, [0,0,0,0])).to.equal(true);
            expect(Array.isEqual(initialState.down, [0,0,0,0])).to.equal(true);
            expect(Array.isEqual(initialState.console, [0,0,0,0])).to.equal(true);

            done();
        });

        it('calling elevator should result in buttons state change', (done) => {
            interaction.Observable.callElevator({
                floor:1, 
                up:true, 
                down: true, 
                destinationFloors: [0,1,2,3], 
                type: "CALL"
            });

            var newButtonsState = interaction.getButtonsState();

            expect(Array.isEqual(newButtonsState.up, [0,1,0,0])).to.equal(true);
            expect(Array.isEqual(newButtonsState.down, [0,1,0,0])).to.equal(true);
            expect(Array.isEqual(newButtonsState.console, [1,1,1,1])).to.equal(true);

            done();
        });

        it('callElevator() should emit INTERACTION.CALL event', (done) => {
            interaction.Observable.on(interaction.EVENTS.CALL, () => {
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


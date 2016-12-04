var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var stateUtils = require('../../../src/state/utils');
var controlConstants = require('../../../src/state/constants');

describe('elevator', () => {
    describe('floors', () => {
        it('translateFloorToState', (done) => {

            var arrayEquality = (array1, array2) => {
                if(array1.length != array2.length) 
                    return false;

                for(var i in array1) {
                    if(array1[i] !== array2[i])
                        return false;
                }

                return true;
            }

            expect(arrayEquality(stateUtils.translateFloorToState(0), [0, 0, 1, 1])).to.equal(true);
            expect(arrayEquality(stateUtils.translateFloorToState(1), [0, 1, 1, 1])).to.equal(true);
            expect(arrayEquality(stateUtils.translateFloorToState(2), [1, 0, 1, 1])).to.equal(true);
            expect(arrayEquality(stateUtils.translateFloorToState(3), [1, 1, 1, 1])).to.equal(true);

            done();
        });

        it('translateStateToFloor', (done) => {
            expect(stateUtils.translateStateToFloor({floors:[0,0,1,1]})).to.equal(0);
            expect(stateUtils.translateStateToFloor({floors:[0,1,1,1]})).to.equal(1);
            expect(stateUtils.translateStateToFloor({floors:[1,0,1,1]})).to.equal(2);
            expect(stateUtils.translateStateToFloor({floors:[1,1,1,1]})).to.equal(3);
            
            done();
        });

        it('translateStateToFloor', (done) => {
            expect(stateUtils.translateStateToFloor({floors:[0,0,1,1]})).to.equal(0);
            expect(stateUtils.translateStateToFloor({floors:[0,1,1,1]})).to.equal(1);
            expect(stateUtils.translateStateToFloor({floors:[1,0,1,1]})).to.equal(2);
            expect(stateUtils.translateStateToFloor({floors:[1,1,1,1]})).to.equal(3);
            
            done();
        });

        it('getDirectionToFloor', (done) => {
            expect(stateUtils.getDirectionToFloor({floors:[0,0,1,1]}, 3)).to.equal(controlConstants.DIRECTION.UP);
            expect(stateUtils.getDirectionToFloor({floors:[0,1,1,1]}, 3)).to.equal(controlConstants.DIRECTION.UP);
            expect(stateUtils.getDirectionToFloor({floors:[1,0,1,1]}, 3)).to.equal(controlConstants.DIRECTION.UP);
            
            expect(stateUtils.getDirectionToFloor({floors:[1,1,1,1]}, 0)).to.equal(controlConstants.DIRECTION.DOWN);
            expect(stateUtils.getDirectionToFloor({floors:[1,0,1,1]}, 0)).to.equal(controlConstants.DIRECTION.DOWN);
            expect(stateUtils.getDirectionToFloor({floors:[0,1,1,1]}, 0)).to.equal(controlConstants.DIRECTION.DOWN);


            done();
        })
    });
});


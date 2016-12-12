var debug = require('debug')('websockets');
var stateMonitor = require('../../src/state/monitor');
var userInteraction = require('../../src/interaction/interaction');

debug("Initializing WebSocket endpoint: /ws/elevator");

function isWebsocketConnected(ws) {
    return ws.readyState == 1;
}

function createStateListener(ws) {
    return (newState) => {
        debug("Sending new state");

        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: stateMonitor.EVENTS.CHANGED,
                data: newState
            }));
        }
    }
}

function createFloorChangeListener(ws) {
    return (newFloor) => {
        debug("Sending new floor");

        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: stateMonitor.EVENTS.FLOOR_CHANGED,
                data: newFloor
            }));
        }
    }
}

function createConsoleChangeListener(ws) {
    return (newConsoleState) => {
        debug("Sending new console state: " + JSON.stringify(newConsoleState));

        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: userInteraction.EVENTS.CHANGED,
                data: newConsoleState
            }));
        }
    }
}

function endpointHandler(ws, req) {
    debug("WebSocket connection established on endpoint '/ws/elevator'");
    debug("Sending initial state");

    var stateListener = createStateListener(ws);
    var floorChangeListener = (newConsoleState) => {
        debug("Sending new floor: " + JSON.stringify(newConsoleState));

        if (isWebsocketConnected(ws)) {
            var body = JSON.stringify({
                type: stateMonitor.EVENTS.FLOOR_CHANGED,
                data: newConsoleState
            });

            debug("BODY:");
            debug(body);

            ws.send(body);
        }
    };

    ws.on('message', (data) => {
        var message = JSON.parse(data);

        switch (data.type) {
            case 'FORCE_CONSOLE_REFRESH': userInteraction.emitConsoleChange(); break;
        }
    })

    var consoleChangeListener = (newConsoleState) => {
        debug("Sending new console state: " + JSON.stringify(newConsoleState));

        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: userInteraction.EVENTS.CONSOLE_CHANGE,
                data: newConsoleState
            }));
        }
    };

    var elevatorStoppedListener = (floor) => {
        debug("Elevator stopped at floor: " + floor);
        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: stateMonitor.EVENTS.ELEVATOR_STOPPED,
                data: floor
            }));
        }
    }

    var requestMoveListener = (data) => {
        debug("Elevator requested to move to floors: " + data.destinationFloors + " from floor: " + data.floor);
        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: userInteraction.EVENTS.REQUEST_MOVE,
                data: data
            }));
        }
    }

    ws.on('close', () => {
        debug("Websocket connection closed.");

        stateMonitor.Observable.removeListener(stateMonitor.EVENTS.CHANGED,
            stateListener);

        stateMonitor.Observable.removeListener(stateMonitor.EVENTS.FLOOR_CHANGED,
            floorChangeListener);

        stateMonitor.Observable.removeListener(stateMonitor.EVENTS.ELEVATOR_STOPPED,
            elevatorStoppedListener);

        userInteraction.Observable.removeListener(userInteraction.EVENTS.CONSOLE_CHANGE,
            consoleChangeListener);

        userInteraction.Observable.removeListener(userInteraction.EVENTS.REQUEST_MOVE,
            requestMoveListener);
    });

    // Setting up listening to events:
    stateMonitor.Observable.on(stateMonitor.EVENTS.CHANGED, stateListener);
    stateMonitor.Observable.on(stateMonitor.EVENTS.FLOOR_CHANGED, floorChangeListener);
    stateMonitor.Observable.on(stateMonitor.EVENTS.ELEVATOR_STOPPED, elevatorStoppedListener);
    userInteraction.Observable.on(userInteraction.EVENTS.CONSOLE_CHANGE, consoleChangeListener);
    userInteraction.Observable.on(userInteraction.EVENTS.REQUEST_MOVE, requestMoveListener);

    // At connection, we force monitor to refresh state. It will trigger STATE.CHANGED event
    // and will send a message to connected client with current state.
    stateMonitor.forceStateRefresh();
    userInteraction.emitConsoleChange();

    //userInteraction.Observable.emit(userInteraction.EVENTS.CONSOLE_CHANGE, userInteraction.getButtonsState());
}

module.exports = (router) => {
    router.ws('/elevator', endpointHandler);
    return router;
};
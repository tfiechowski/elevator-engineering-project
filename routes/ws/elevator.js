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

function createConsoleChangeListener(ws) {
    return (newConsoleState) => {
        debug("Sending new console state");

        if (isWebsocketConnected(ws)) {
            ws.send(JSON.stringify({
                type: userInteraction.EVENTS.CONSOLE_CHANGE,
                data: newConsoleState
            }));
        }
    }
}

function endpointHandler(ws, req) {
    debug("WebSocket connection established on endpoint '/ws/elevator'");
    debug("Sending initial state");

    var stateListener = createStateListener(ws);
    var consoleChangeListener = createConsoleChangeListener(ws);

    ws.on('close', () => {
        debug("Websocket connection closed.");

        stateMonitor.Observable.removeListener(stateMonitor.EVENTS.CHANGED,
            stateListener);

        userInteraction.Observable.removeListener(userInteraction.EVENTS.CONSOLE_CHANGE,
            createConsoleChangeListener);
    });

    // Setting up listening to events:
    stateMonitor.Observable.on(stateMonitor.EVENTS.CHANGED, stateListener);
    userInteraction.Observable.on(userInteraction.EVENTS.CONSOLE_CHANGE, consoleChangeListener);

    // At connection, we force monitor to refresh state. It will trigger STATE.CHANGED event
    // and will send a message to connected client with current state.
    stateMonitor.forceStateRefresh();
}

module.exports = (router) => {
    router.ws('/elevator', endpointHandler);
    return router;
};
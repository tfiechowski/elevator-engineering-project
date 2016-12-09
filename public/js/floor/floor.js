var currentFloor = location.pathname.split('/').pop() | 0;

var buttonUp, buttonDown;

var consoleState = {
    floor: currentFloor,
    up: false,
    down: false,
    destinationFloors: []
}

var updateButton = (buttonType, value) => {
    var button;

    switch (buttonType) {
        case 'down':
            if (!buttonDown) {
                break;
            }

            button = buttonDown;
            consoleState.down = value == 1 ? true : false;
            break;
        case 'up':
            if (!buttonUp) {
                break;
            }

            button = buttonUp;
            consoleState.up = value == 1 ? true : false;
            break;
    }

    if (value == 1) {
        $(button).removeClass("btn-primary");
        $(button).addClass("btn-success");
    } else {
        $(button).removeClass("btn-success");
        $(button).addClass("btn-primary");
    }
}

var updateFloorButtons = (floors) => {
    consoleState.destinationFloors = [];

    for (var i in floors) {
        if (floors[i] == 1) {
            $("#console" + i).removeClass("btn-primary");
            $("#console" + i).addClass("btn-success");
            consoleState.destinationFloors.push(i);
        } else {
            $("#console" + i).removeClass("btn-success");
            $("#console" + i).addClass("btn-primary");
        }

    }
}

var sendInteractionEvent = () => {
    console.log("Sending INTERACTION EVENT");

    var requestData = Object.assign({}, consoleState, { type: "CALL" });

    console.log(requestData);

    $.post('/api/interaction/call', requestData);
}


$(document).ready(function () {
    console.log("ready!");

    buttonUp = $("#buttonUp");
    buttonDown = $("#buttonDown");

    if (buttonUp) {
        buttonUp.click(() => {
            consoleState.up = 1;
            sendInteractionEvent();
        })
    }

    if (buttonDown) {
        buttonDown.click(() => {
            consoleState.down = 1;
            sendInteractionEvent();
        })
    }

    for (var i = 0; i < 4; i++) {
        ((floor) => {
            $("#console" + floor).click(() => {
                if (consoleState.destinationFloors.indexOf(floor) == -1) {
                    consoleState.destinationFloors.push(floor);
                    sendInteractionEvent();
                }
            });
        })(i);
    }

    ws.onmessage = (evt) => {
        var message = JSON.parse(evt.data);

        switch (message.type) {
            case 'INTERACTION.CONSOLE_CHANGE':
                var newConsoleState = message.data;

                console.log("Console changed: " + JSON.stringify(newConsoleState));

                consoleState.up = newConsoleState.up[currentFloor];
                consoleState.down = newConsoleState.down[currentFloor];
                // consoleState.destinationFloors = newConsoleState.console;

                updateButton('up', consoleState.up);
                updateButton('down', consoleState.down);
                updateFloorButtons(newConsoleState.console);
        }
    };
});
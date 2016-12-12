var id = 0;

function CommandCall(type, data) {
    this.type = type;
    this.data = data;
    this.id = id++;
}

Array.merge = function (array1, array2) {
    for (var a2 of array2) {
        if (array1.indexOf(a2) < 0) {
            array1.push(a2);
        }
    }

    return array1;
}

var destinationFloorsQueue = [[], [], [], []];

var commands = [];
var currentCommand = 0;

function sendCallRequest(request) {
    console.log("Sending call request:" + JSON.stringify(request));
    $.post('/api/interaction/call', request);
}

function sendMoveRequest(floor) {
    $.post('/api/interaction/moverequest', {
        type: 'INTERACTION.MOVE_REQUEST',
        destinationFloors: destinationFloorsQueue[floor],
        floor: floor
    });

    destinationFloorsQueue[floor] = [];
}

ws.onmessage = function (evt) {
    var message = JSON.parse(evt.data);

    console.log("New message of type  " + message.type + " is recieved.");

    switch (message.type) {
        case 'STATE.ELEVATOR_STOPPED':
            var floor = message.data;

            if (destinationFloorsQueue[floor].length > 0) {
                sendMoveRequest(floor);
            }
            break;
        case 'INTERACTION.CONSOLE_CHANGE':
            console.log(message.data); break;
    }
};

function updateRequestList() {
    $("#requestList").html(
        commands.map((el) => {
            return JSON.stringify(el);
        }).join("\n")
    );
}

$(document).ready(function () {
    $("#buttonAddCall").click(() => {
        var destinationFloors = [];

        for (var i = 0; i < 4; i++) {
            if ($("#interactionCallFloor" + i).is(":checked")) {
                destinationFloors.push(i);
            }
        }

        var floor = $("#interactionCallFloor").val();

        Array.merge(destinationFloorsQueue[floor], destinationFloors);

        var callRequest = {
            type: "CALL",
            floor: floor,
            up: $("#interactionCallUp").is(":checked") == true ? 1 : 0,
            down: $("#interactionCallDown").is(":checked") == true ? 1 : 0,
            destinationFloors: destinationFloors
        }

        commands.push(new CommandCall('call', callRequest));
        updateRequestList();
    });

    $("#buttonStart").click(() => {
        var timeouts = [];

        var currentDelay = 0;

        for (var command of commands) {
            switch (command.type) {
                case 'call':
                    ((_command, _delay) => {
                        setTimeout(() => {
                            sendCallRequest(_command.data);
                            Array.merge(destinationFloorsQueue[_command.data.floor], _command.data.destinationFloors);
                        }, _delay);
                    })(command, currentDelay);
                    break;
                case 'delay':
                    currentDelay += command.data | 0;
                    break;
            }
        }
    });

    $("#buttonAddDelay").click(() => {
        commands.push(new CommandCall('delay', $("#delayValue").val()));
        updateRequestList();
    });
});
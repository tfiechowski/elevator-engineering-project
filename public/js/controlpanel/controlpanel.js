var pinValues = {
    start: 0,
    direction: 0,
    speed: 0
};

var moveRequest = {
    type: 'INTERACTION.MOVE_REQUEST',
    floor: -1,
    destinationFloors: []
}

function translatePinValue(type, value) {
    switch (type) {
        case 'start':
            return value == 0 ? "START" : "STOP"
        case 'direction':
            return value == 0 ? "GÓRA" : "DÓŁ";
        case 'speed':
            return value == 0 ? "SZYBKO" : "WOLNO";
    }
}

function updateTable(state) {
    console.log("Updating table");
    $('#startValue').html(translatePinValue('start', state.start));
    $('#directionValue').html(translatePinValue('direction', state.direction));
    $('#speedValue').html(translatePinValue('speed', state.speed));
    $('#limitValue').html(state.limit);

    for (var i = 0; i < 4; i++) {
        $('#floor' + i + 'Value').html(state.floors[i]);
    }
}

function updateLastFloor(lastFloor) {
    console.log("New last floor: " + lastFloor);

    $("#lastFloor").html(lastFloor);
}

function updateConsole(consoleState) {
    for (var i in consoleState.up) {
        $("#consoleUp" + i).html(consoleState.up[i]);
        $("#consoleDown" + i).html(consoleState.down[i]);
    }

    $("#consoleDestinationFloors").html(JSON.stringify(consoleState.console));
}

var tableBody = $("#tableBody");

function updatePosition(position) {
    var positionName = "";

    var nameMap = {
        17: "Above 3",
        16: "3 Near up",
        15: "3 Third floor",
        14: "3 Near down",
        13: "Between 3-2",
        12: "2 Near up",
        11: "2 Second floor",
        10: "2 Near down",
        9: "Between 2-1",
        8: "1 Near up",
        7: "1 First floor",
        6: "1 Near down",
        5: "Between 1-0",
        4: "0 Near up",
        3: "0 Zero floor",
        2: "0 Near down",
        2: "Under zero"
    }

    $("#positionValue").html(nameMap[position]);
}

ws.onmessage = function (evt) {
    var message = JSON.parse(evt.data);

    if (message.type === undefined) {
        return;
    }

    console.log("New message of type  " + message.type + " is recieved.");

    switch (message.type) {
        case 'STATE.CHANGED':
            updateTable(message.data); break;
        case 'STATE.FLOOR_CHANGED':
            //updateConsole(message.data); 
            break;
        case 'STATE.ELEVATOR_STOPPED':
            if (message.data == moveRequest.floor) {
                sendMoveRequest();
            }
            break;
        case 'STATE.POSITION_CHANGED':

            break;
        case 'INTERACTION.CONSOLE_CHANGE':
            updateConsole(message.data); break;
    }
};

function toggleOutput(type) {
    pinValues[type] = (pinValues[type] + 1) % 2;

    $.post('/api/elevator/setOutput', {
        type: type,
        value: pinValues[type]
    });
}

function goToFloor(floor) {
    $.post('/api/elevator/goToFloor/' + floor);
}

function sendMoveRequest() {
    $.post('/api/interaction/moverequest', moveRequest);
}

$(document).ready(function () {
    $("#startToggle").click(() => {
        console.log("Sending MSG START");
        toggleOutput('start');
    });

    $("#directionToggle").click(() => {
        console.log("Sending MSG DIRECTION");
        toggleOutput('direction');
    });

    $("#speedToggle").click(() => {
        console.log("Sending MSG SPEED");
        toggleOutput('speed');
    });

    $("#goToFloorButton").click(() => {
        var floor = $("#goToFloorInput").val();
        console.log("Going to floor: " + floor);
        goToFloor(floor);
    });

    $("#interactionCallButton").click(() => {
        var destinationFloors = [];

        for (var i = 0; i < 4; i++) {
            if ($("#interactionCallFloor" + i).is(":checked")) {
                destinationFloors.push(i);
            }
        }

        moveRequest.floor = $("#interactionCallFloor").val();
        moveRequest.destinationFloors = destinationFloors;

        var callRequest = {
            type: "CALL",
            floor: $("#interactionCallFloor").val(),
            up: $("#interactionCallUp").is(":checked") == true ? 1 : 0,
            down: $("#interactionCallDown").is(":checked") == true ? 1 : 0,
            destinationFloors: destinationFloors
        }

        console.log("Interaction.Call request:");
        console.log(callRequest);

        $.post("/api/interaction/call", callRequest).done((response) => {
            console.log("/api/interaction/call response:");
            console.log(response);
        })
    });

    $(document).keypress(function (e) {
        switch (e.charCode) {
            case 113: toggleOutput('start'); break;
            case 119: toggleOutput('direction'); break;
            case 101: toggleOutput('speed'); break;
        }
    });
});
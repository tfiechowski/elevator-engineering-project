ws = new WebSocket('ws://' + location.host + '/ws/elevator');
//ws = new WebSocket('ws://' + location.host + '/ws/interaction');

ws.onopen = function () {
    console.log("Web Socket is connected");
};

ws.onclose = function (reason) {
    // websocket is     closed.
    console.log("Connection is closed...");
    console.log(reason);
};

var pinValues = {
    start: 0,
    direction: 0,
    speed: 0
};

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

}

var tableBody = $("#tableBody");

ws.onmessage = function (evt) {
    var message = JSON.parse(evt.data);

    console.log("New message of type  " + message.type + " is recieved.");

    switch (message.type) {
        case 'STATE.CHANGED': updateTable(message.data); break;
        case 'STATE.FLOOR_CHANGED': updateConsole(message.data); break;
        case 'INTERACTION.CONSOLE_CHANGE': console.log("Console changed" + JSON.stringify(message.data));
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

ws = new WebSocket('ws://' + location.host + '/sock/elevator');

var pinValues = {
    start: 0,
    direction: 0,
    speed: 0
};

function translatePinValue(type, value) {
    switch(type) {
        case 'start': 
            return value == 0 ? "START" : "STOP"
        case 'direction':
            return value == 0 ? "UP" : "DOWN";
        case 'speed':
            return value == 0 ? "FAST" : "SLOW";
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


ws.onopen = function () {
    // Web Socket is connected, send data using send()
    //ws.send(JSON.stringify("Message to send"));
    console.log("Message is sent...");
};

var tableBody = $("#tableBody");

ws.onmessage = function (evt) {
    var received_msg = JSON.parse(evt.data);

    console.log("New state is recieved : ");
    console.log(received_msg);

    updateTable(received_msg);

    //changeElevatorState(received_msg);
};

ws.onclose = function (reason) {
    // websocket is     closed.
    console.log("Connection is closed...");
    console.log(reason);
};

function buildMsg(pinKey) {
    pinValues[pinKey] = (pinValues[pinKey] + 1) % 2;

    return JSON.stringify({
        type: 'setOutput',
        data: {
            pin: pinKey,
            value: pinValues[pinKey]
        }
    });
}

function buildGoToFloorMsg(floor) {
    return JSON.stringify({
        type: 'GO_TO_FLOOR',
        data: {
            value: floor
        }
    });
}

$(document).ready(function () {
    $("#startToggle").click(() => {
        console.log("Sending MSG START");
        ws.send(buildMsg('start'));
    });

    $("#directionToggle").click(() => {
        console.log("Sending MSG DIRECTION");
        ws.send(buildMsg('direction'));
    });

    $("#speedToggle").click(() => {
        console.log("Sending MSG SPEED");
        ws.send(buildMsg('speed'));
    });

    $("#goToFloorButton").click(() => {
        var floor = $("#goToFloorInput").val();
        console.log("Going to floor: " + floor);
        ws.send(buildGoToFloorMsg(floor));
    });

    $("#interactionCallButton").click(() => {
        var destinationFloors = [];

        for(var i = 0 ; i < 4; i++) {
            if($("#interactionCallFloor" + i).is(":checked")) {
                destinationFloors.push(i);
            }
        }

        var callRequest = {
            type: "CALL",
            floor: $("#interactionCallFloor").val(),
            up: $("#interactionCallUp").is(":checked"),
            down: $("#interactionCallDown").is(":checked"),
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
            case 113: ws.send(buildMsg('start')); break;
            case 119: ws.send(buildMsg('direction')); break;
            case 101: ws.send(buildMsg('speed')); break;
        }
    });
});

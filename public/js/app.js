ws = new WebSocket('ws://' + location.host + '/sock/elevator');

function updateTable(state) {
    console.log("Updating table");
    $('#startValue').html(state.start);
    $('#directionValue').html(state.direction);
    $('#speedValue').html(state.speed);

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

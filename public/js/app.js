ws = new WebSocket('ws://localhost:8081/sock/elevator');

ws.onopen = function () {
    // Web Socket is connected, send data using send()
    ws.send("Message to send");
    console.log("Message is sent...");
};

ws.onmessage = function (evt) {
    var received_msg = JSON.parse(evt.data);

    console.log("New state is recieved : ");
    console.log(received_msg);

    //changeElevatorState(received_msg);
};

ws.onclose = function (reason) {
    // websocket is     closed.
    console.log("Connection is closed...");
    console.log(reason);
};

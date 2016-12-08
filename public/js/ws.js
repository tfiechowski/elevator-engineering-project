ws = new WebSocket('ws://' + location.host + '/ws/elevator');
//ws = new WebSocket('ws://' + location.host + '/ws/interaction');

ws.onopen = function () {
    console.log("Web Socket is connected");
};

ws.onclose = function (reason) {
    console.log("Connection is closed...");
    console.log(reason);
};

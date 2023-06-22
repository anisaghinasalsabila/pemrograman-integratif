var socket = io();

socket.emit("joining msg", name);


$("form").submit(function (e) {
	
	e.preventDefault();

	socket.emit("chat message", name + ":  " + $("#m").val());
	$("#messages").append($('<li id="list">').text("You:  " + $("#m").val()));
	$("#m").val("");
	return false;
});

socket.on("chat message", function (msg) {
	$("#messages").append($("<li>").text(msg));
});

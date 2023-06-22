var express = require("express");
var http = require("http");

var app = express();
var server = http.createServer(app);

var io = require("socket.io")(server);
var path = require("path");

app.use(express.static(path.join(__dirname, "./public")));

// Define route
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/public/index.html");
});

var name;

io.on("connection", (socket) => {
	console.log("new user connected");

	socket.on("joining msg", (username) => {
		name = username;
		io.emit("chat message", `---${name} joined the chat---`);
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
		io.emit("chat message", `---${name} left the chat---`);
	});
	
	socket.on("chat message", (msg) => {
		if (msg.trim() !== '') { // check if the message is not empty
			var timeStamp = new Date().toLocaleTimeString();
			var msgWithTimeStamp = `${timeStamp} | ${msg}`; // prepend the timestamp to the message
			socket.broadcast.emit("chat message", msgWithTimeStamp); //sending message to all except the sender
		}
	});
});

server.listen(3000, () => {
	console.log("Server listening on :3000");
});

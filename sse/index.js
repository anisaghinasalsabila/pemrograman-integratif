const express = require("express");
const app = express();

const port = 3030;

// Berita acak
const news = [
    "Berita 1: Something happened",
    "Berita 2: Something else happened",
    "Berita 3: More things are happening",
    // Tambahkan berita sesuai keinginan Anda di sini
];

// Define route
app.get("/", (req, res) => {
	console.log("Client connected");

	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Access-Control-Allow-Origin", "*");

	const intervalId = setInterval(() => {
        const message = `${new Date().toLocaleString()} - ${news[Math.floor(Math.random() * news.length)]}`;
		res.write(`data: ${message}\n\n`);
	}, 10000);

	res.on("close", () => {
		console.log("Client closed connection");
		clearInterval(intervalId);
		res.end();
	});
});

app.listen(port, () => {
	console.log(`Server is running`);
});

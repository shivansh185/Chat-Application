const http = require("http");
const express = require("express");
const path = require("node:path");
const { Server } = require("socket.io");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const upload = multer({ dest: "./uploads/" }); // Set the upload directory

app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("New client connected");

    // Handle 'user message' event from the client
    socket.on("user message", (message) => {
        console.log("Received message:", message); // Log the message in the Node.js terminal
        // Broadcast the message to all connected clients
        io.emit("chat message", message); // Broadcast to all connected clients
    });

    // Handle 'file upload' event from the client
    socket.on("file upload", (data) => {
        const fileBuffer = data.file;
        const fileType = data.type;
        const fileName = data.name;
        const username = data.name;
    
        // Store the file in the uploads directory
        const filePath = `./uploads/${fileName}`;
        fs.writeFileSync(filePath, fileBuffer);
    
        // Broadcast the file to all connected clients
        const fileBufferBase64 = fileBuffer.toString("base64");
        io.emit("file broadcast", { username, fileName, fileType, fileBuffer: fileBufferBase64 });
    });
});

server.listen(9000, () => {
    console.log("Server started at port 9000");
});
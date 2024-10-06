const socket = io();
const Submitbtn = document.getElementById("Submitbutton");
const textmsg = document.getElementById("textmessage");
const allmessages = document.getElementById("messages");
const enterChatBtn = document.getElementById("enter-chat");
const usernameInput = document.getElementById("username");
const fileInput = document.getElementById("fileinput");
let username = "";

// Enable or disable the Enter Chat button based on username input
usernameInput.addEventListener("input", () => {
    enterChatBtn.disabled = usernameInput.value.trim() === "";
});

// Handle entering the chat
enterChatBtn.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username) {
        document.querySelector(".name-container").style.display = "none"; // Hide name input
        document.querySelector(".chat-window").style.display = "block"; // Show chat window
        document.querySelector(".input-container").style.display = "block"; // Show input box
    }
});

// Enable or disable the Send button based on message or file input
textmsg.addEventListener("input", () => {
    Submitbtn.disabled = textmsg.value.trim() === "" && fileInput.files.length === 0;
});
fileInput.addEventListener("change", () => {
    Submitbtn.disabled = textmsg.value.trim() === "" && fileInput.files.length === 0;
});

// Listen for the 'chat message' event from the server and append messages
socket.on("chat message", (data) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${data.name}:</strong> ${data.message}`; // Display name and message
    p.classList.add(data.name === username ? 'sent' : 'received'); // Add sent/received class
    allmessages.appendChild(p);
    allmessages.scrollTop = allmessages.scrollHeight; // Auto-scroll
});

// Listen for the 'file broadcast' event from the server and display the uploaded files
socket.on("file broadcast", (data) => {
const fileDisplay = document.getElementById("file-display");
const fileName = data.fileName;
const fileType = data.fileType;
const username = data.username;
const fileBuffer = data.fileBuffer;

// Create a new element to display the file
const fileElement = document.createElement("div");
fileElement.innerHTML = `<strong>${username}:</strong> ${fileName} (${fileType})`;

// Check if the file is an image
if (fileType.startsWith("image/")) {
const imageElement = document.createElement("img");
imageElement.src = `data:${fileType};base64,${fileBuffer}`;
fileElement.appendChild(imageElement);
} else {
// Add a link to download the file (optional)
const fileLink = document.createElement("a");
fileLink.href = `/uploads/${fileName}`;
fileLink.download = fileName;
fileLink.innerHTML = "Download";
fileElement.appendChild(fileLink);
}

fileDisplay.appendChild(fileElement);
});

// Send the message and/or file to the server when the button is clicked
Submitbtn.addEventListener("click", () => {
    const message = textmsg.value.trim();
    if (message) {
        socket.emit("user message", { name: username, message: message });
        textmsg.value = ""; // Clear the input field after sending
        Submitbtn.disabled = true; // Disable send button after sending
    }

    // Handle file uploads
    const files = fileInput.files;
    if (files.length > 0) {
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const fileBuffer = reader.result;
                const fileType = file.type;
                const fileName = file.name;
                socket.emit("file upload", { name: username, file: fileBuffer, type: fileType, name: fileName });
            };
            reader.readAsArrayBuffer(file);
        });
        fileInput.value = ""; // Clear file input after sending
        Submitbtn.disabled = true; // Disable send button after sending
    }
});
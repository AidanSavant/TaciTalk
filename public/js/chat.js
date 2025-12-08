const socket = io("http://localhost:5050", {
  auth: {
    token: localStorage.getItem("token")
  }
});

socket.on("connect", () => {
  console.log("WebSocket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("WebSocket disconnected");
});


const params = new URLSearchParams(window.location.search);
const conversationID = params.get("conversationID");

if (!conversationID) {
  console.warn("No conversation ID found in URL");
}

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  if(conversationID) {
    socket.emit("join_conversation", { conversationID });
    console.log(`Joined room: conversation_${conversationID}`);
  }
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

const inputField = document.getElementById("messageInput");
const sendButton = document.getElementById("sendMessageBtn");
const chatArea = document.querySelector(".chat-area");

sendButton.addEventListener("click", sendMessage);

inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});


function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;

  socket.emit("send_message", {
    conversationID,
    messageType: "TEXT",
    messageContent: text
  });

  inputField.value = "";
}

socket.on("new_message", (msg) => {
  console.log("📩 Message Received:", msg);
  addMessageToUI(msg);
});


function addMessageToUI(message) {
  const div = document.createElement("div");

  const isMine = Number(message.userID) === Number(localStorage.getItem("userID"));

  div.className = isMine ? "msg right" : "msg";
  div.textContent = message.messageContent;

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}


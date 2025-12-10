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
  console.log("Message Received:", msg);
  addMessageToUI(msg);
});


function formatMessageTime(message) {
  // ISO is apparently a safer, easier way to format dates
  if (message.isoTimestamp) {
    const d = new Date(message.isoTimestamp);
    if (!isNaN(d)) {
      return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    }
  }

  // Fallback  old format (UTC)
  if (message.timestamp) {
    const guess = new Date(message.timestamp.replace(" ", "T") + "Z");
    if (!isNaN(guess)) {
      return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(guess);
    }

    return message.timestamp;
  }

  return "";
}

function addMessageToUI(message) {
  const bubble = document.createElement("div");

  
  const currentUserId = Number(localStorage.getItem("currentUserID"));
  const isMine = Number(message.userID) === currentUserId;

  bubble.className = isMine ? "msg right" : "msg";

  const meta = document.createElement("div");
  meta.className = "msg-meta";

  const nameSpan = document.createElement("span");
  nameSpan.className = "msg-username";
  nameSpan.textContent = isMine ? "You" : (message.username || "Unknown");

  const timeSpan = document.createElement("span");
  timeSpan.className = "msg-time";
  timeSpan.textContent = formatMessageTime(message);

  meta.appendChild(nameSpan);
  meta.appendChild(timeSpan);

  
  const text = document.createElement("div");
  text.className = "msg-text";
  text.textContent = message.messageContent;

  bubble.appendChild(meta);
  bubble.appendChild(text);

  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}


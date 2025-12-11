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
let conversationID = params.get("conversationID");

window.setActiveConversation = (convoId) => {
  conversationID = String(convoId);

  socket.emit("join_conversation", { conversationID });
  console.log(`Switched & joined room: conversation_${conversationID}`);
};

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

class ioBridge { //static handler for accessing io from dashScript
  static msgUnsave(msgID){
    socket.emit("unsave_message",msgID)
  }
  static msgSave(msgID){
    socket.emit("save_message", msgID)
  }
}
socket.on("change_id", (payload) => {
  msgClick.updateDivId(payload)
});

function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;

  socket.emit("send_message", {
    conversationID,
    messageType: "Text",
    messageContent: text
  });

  inputField.value = "";
}

socket.on("new_message", (msg) => {
  console.log("Message Received:", msg);
  addMessageToUI(msg);
});


function formatMessageTime(message) {
  // Prefer isoTimestamp if present
  if (message.isoTimestamp) {
    const d = new Date(message.isoTimestamp);
    if (!isNaN(d)) {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    }
  }

  if (message.timestamp) {

    const d1 = new Date(message.timestamp);
    if (!isNaN(d1)) {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d1);
    }


    const d2 = new Date(message.timestamp.replace(" ", "T") + "Z");
    if (!isNaN(d2)) {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d2);
    }

    // Final fallback
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
  console.log(message.username)
  nameSpan.textContent = isMine ? "You" : (message.username || "Unknown");

  const timeSpan = document.createElement("span");
  timeSpan.className = "msg-time";
  timeSpan.textContent = formatMessageTime(message);

  meta.appendChild(nameSpan);
  meta.appendChild(timeSpan);


  const text = document.createElement("div");
  text.className = "msg-text";
  text.textContent = message.messageContent;
  text.id = message.messageID

  bubble.appendChild(meta);
  bubble.appendChild(text);

  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
  msgClick.updateME(message.messageID);
}


const searchInput = document.querySelector(".search-box input");


function normalize(str) {
  return (str || "").toLowerCase().trim();
}

function getMessageSearchText(msgEl) {
  const text = msgEl.querySelector(".msg-text")?.textContent || msgEl.textContent || "";
  const user = msgEl.querySelector(".msg-username")?.textContent || "";
  return `${text} ${user}`;
}

function searchMessages(query) {
  if (!chatArea) return;

  const q = normalize(query);
  const messages = chatArea.querySelectorAll(".msg");

  let firstMatch = null;

  messages.forEach((msg) => {
    msg.classList.remove("search-match", "search-hide");

    if (!q) return;

    const hay = normalize(getMessageSearchText(msg));

    if (hay.includes(q)) {
      msg.classList.add("search-match");
      if (!firstMatch) firstMatch = msg;
    } else {
      msg.classList.add("search-hide");
    }
  });

  if (firstMatch) {
    firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchMessages(e.target.value);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      searchMessages("");
    }
  });
}

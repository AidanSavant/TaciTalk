const sidebar = document.getElementById("messageholder");

async function populatingMessages() {
  sidebar.innerHTML = "";

  const response = await fetch("/api/conversations/1");
  const messages = await response.json();

  if (messages.length === 0 || messages === null) {
    sidebar.innerHTML = "<p>No messages</p>";
  } else {
    messages.forEach((message) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.textContent = message;
      sidebar.appendChild(messageElement);
    });
  }
}

populatingMessages();

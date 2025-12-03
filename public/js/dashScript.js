const sidebar = document.getElementById("messageholder");

async function populatingMessages() {
  sidebar.innerHTML = "";

  const userID = localStorage.getItem("currentUserID");
  console.log(userID);

  if (!userID) {
    console.warn("No User ID found. Redirecting to login...");
    return;
  }

  const response = await fetch(`/api/conversations/${userID}`);
  const rawData = await response.json();
  const message = Array.isArray(rawData) ? rawData : [rawData];

  message.forEach((message) => {
    const convoTitleElement = document.createElement("div");
    convoTitleElement.classList.add("message-title");
    convoTitleElement.textContent = message.ConvoTitle;
    sidebar.appendChild(convoTitleElement);
  });
}

populatingMessages();

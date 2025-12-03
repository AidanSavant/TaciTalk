const sidebar = document.getElementById("messageholder");
const friendsSidebar = document.getElementById("friends-list");
const userID = localStorage.getItem("currentUserID");

async function populatingMessages() {
  sidebar.innerHTML = "";
  

  if (!userID) {
    console.warn("No User ID found. Redirecting to login...");
    return;
  }

  const response = await fetch(`/api/conversations/${userID}`);
  const rawData = await response.json();
  const message = Array.isArray(rawData) ? rawData : [rawData];
  
  if (message.length === 0) { 
    sidebar.innerHTML = "<p>No messages found</p>";
    return;
  }

  message.forEach((message) => {
    const convoTitleElement = document.createElement("div");
    convoTitleElement.classList.add("message-title");
    convoTitleElement.textContent = message.ConvoTitle;
    sidebar.appendChild(convoTitleElement);
  });
}


async function populateFriends() {
  friendsSidebar.innerHTML = "";

  const userID = localStorage.getItem("currentUserID");

  if (!userID) {
    console.warn("No User ID found. Redirecting to login...");
    return;
  }

  const response = await fetch(`/api/friends/${userID}`);
  const rawData = await response.json();
  
  const friends = Array.isArray(rawData) ? rawData : [rawData];
  
  if(friends.length === 0) {
    const noFriendsElement = document.createElement("div");
    noFriendsElement.classList.add("no-friends");
    noFriendsElement.textContent = "No friends found";
    friendsSidebar.appendChild(noFriendsElement);
    return;
  }

  friends.forEach((friend) => {
    const friendElement = document.createElement("div");
    friendElement.classList.add("friend");
    friendElement.textContent = friend.username;
    sidebar.appendChild(friendElement);
  });
}

populateFriends();

populatingMessages();

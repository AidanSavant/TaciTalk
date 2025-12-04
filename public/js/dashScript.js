const sidebar = document.getElementById("messageholder");
const friendsSidebar = document.getElementById("friends-list");
const userID = localStorage.getItem("currentUserID");
const newConversationButton = document.getElementById("newConversation")
const userListContainer = document.getElementById("userListContainer");
const createNewConvoBtn = document.getElementById("createBtn");




async function renderUsers() { 
  const response = await fetch(`/api/users`);
  const rawData = await response.json();
  const users = Array.isArray(rawData) ? rawData : [rawData];
  
  users.forEach((user) => {
    const userElement = document.createElement("label");
    userElement.className = "user-item";
    
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox';
    checkbox.value = user.userID;
    checkbox.name = "selectedUsers";
    userElement.appendChild(checkbox);
    userElement.append(` ${user.Username}`);
    if (userListContainer) {
        userListContainer.appendChild(userElement);
    }
    
    
  });
}

renderUsers();

newConversationButton.addEventListener("click", () => {
  newConversationDialog.showModal();
})

createNewConvoBtn.addEventListener("click", async  (e) => { 
  e.preventDefault(); 

  const titleInput = document.getElementById("groupName");
  const titleValue = titleInput.value.trim() || "New Chat"; 

  const typeRadio = document.querySelector('input[name="convoType"]:checked');
  const typeValue = typeRadio ? typeRadio.value : "GROUP";

  const checkedBoxes = document.querySelectorAll('#userListContainer input[type="checkbox"]:checked');
  const selectedUserIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);

  if (selectedUserIds.length === 0) {
    alert("Please select at least one friend.");
    return;
  }

  if (typeValue === "SINGLE" && selectedUserIds.length > 1) {
    alert("You can only select ONE friend for a Single conversation.");
    return;
  }
  
  await createNewConversation(titleValue, typeValue, selectedUserIds,userID);

  document.getElementById("newConversationDialog").close();
  titleInput.value = ""; 
  checkedBoxes.forEach(box => box.checked = false);
})



async function createNewConversation(conversationTitle, conversationType, userList, currentUserID) { 
  
  const payload = {
    title: conversationTitle, 
    type: conversationType, 
    userIds: userList,  
    createdBy: currentUserID   
  };
  
  console.log(JSON.stringify(payload));
  
  const response = await fetch(`/api/newConversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const rawData = await response.json();
  console.log("Server response:", rawData);
}

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

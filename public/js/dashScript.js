const conversationlist = document.getElementById("messageholder");
const friendsSidebar = document.getElementById("friends-list");
const userID = localStorage.getItem("currentUserID");
const newConversationButton = document.getElementById("newConversation")
const userListContainer = document.getElementById("userListContainer");
const createNewConvoBtn = document.getElementById("createBtn");
const closeBtn = document.getElementById("closeBtn");
const profileDisplayBtn = document.getElementById("profile-btn"); 
const profileSubmit = document.getElementById("submitEdit");
const profileCancel = document.getElementById("cancelBtn");
const themePicker = document.getElementById("themeColorPicker");
const savedColor = localStorage.getItem("themeColor");
const newBio = document.getElementById("NewBio");
const currentuserdisplay = document.getElementById("currentuserdisplay");

async function showCurrentUsername() {
  if (!userID) return;
  const response = await fetch(`/api/users/${userID}`);
  if (!response.ok) return;
  const username = await response.json();
  currentuserdisplay.textContent = username
}

showCurrentUsername();

if (savedColor) {
    applyThemeColor(savedColor);
    themePicker.value = savedColor; 
}

async function renderUsers() { 
  const response = await fetch("/api/users");
  const rawData = await response.json();
  const users = Array.isArray(rawData) ? rawData : [rawData];
  
  console.log(users);
  
  users.forEach((user) => {
    const userElement = document.createElement("label");
    userElement.className = "user-item";
    

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox';
    checkbox.value = user.UserID;

    checkbox.name = "selectedUsers";
    userElement.appendChild(checkbox);
    userElement.append(`${user.Username}`);
    if (userListContainer) {
        userListContainer.appendChild(userElement);
    }
    
    
  });
}

renderUsers();

newConversationButton.addEventListener("click", () => {
  newConversationDialog.showModal();
})

closeBtn.addEventListener("click", () => {
  newConversationDialog.close();
})

profileDisplayBtn.addEventListener("click", () => {
  profilebtnDialog.showModal();
})

profileCancel.addEventListener("click", () => { 
  profilebtnDialog.close();
})

profileSubmit.addEventListener("click", async() => {
    const selectedColor = themePicker.value;
    const newBioValue = newBio.value;
    localStorage.setItem("themeColor", selectedColor);
    
    if (newBioValue) { 
      updateBio(newBioValue, userID);
    }
    
    applyThemeColor(selectedColor);
    profilebtnDialog.close();
});


function applyThemeColor(color) {
    document.documentElement.style.setProperty("--accent-color", color);
}


createNewConvoBtn.addEventListener("click", async  (e) => { 
  e.preventDefault(); 

  const titleInput = document.getElementById("groupName");
  const titleValue = titleInput.value.trim() || "New Chat"; 


  const checkedBoxes = document.querySelectorAll("#userListContainer input[type='checkbox']:checked");
  const selectedUserIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);

  let typeValue;
  
  if (selectedUserIds.length === 0) {
    alert("Please select at least one friend.");
    return;
  }
  
  if (selectedUserIds.length === 1) {
    typeValue = "SINGLE";
  } else if (selectedUserIds.length > 1) {
    typeValue = "GROUP";
  }

  
  await createNewConversation(titleValue, typeValue, selectedUserIds,userID);
  
  await loadConversationList();
  document.getElementById("newConversationDialog").close();
  titleInput.value = ""; 
  checkedBoxes.forEach(box => box.checked = false);
  
})

async function updateBio(bio, currentUserID) {
  const payload = {
    bio: bio,
    id: currentUserID
  }
  
  try { 
    const response = await fetch(`/api/updateBio/${userID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to update bio:", error);
      alert("Error updating bio.");
      return null;
    }
    const updatedUser = await response.json();
    console.log("Updated user:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Error updating bio:", error);
    alert("Error updating bio.");
    return null;
  }
  
}

async function populateConversationUsers() {
  friendsSidebar.innerHTML = "";

  const currentUserID = localStorage.getItem("currentUserID");
  if (!currentUserID) return;

  const params = new URLSearchParams(window.location.search);
  const conversationID = params.get("conversationID");

  if (!conversationID) {
    return;
  }

  try {
    const response = await fetch(`/api/conversations/${conversationID}/users`);
    const rawData = await response.json();
    const members = Array.isArray(rawData) ? rawData : [rawData];

    const otherMembers = members.filter(u =>
      String(u.UserID ?? u.userId ?? u.id) !== String(currentUserID)
    );

    if (otherMembers.length === 0) {
      const el = document.createElement("div");
      el.classList.add("no-friends");
      el.textContent = "No other members";
      friendsSidebar.appendChild(el);
      return;
    }

    otherMembers.forEach(user => {
      const el = document.createElement("div");
      el.classList.add("friend");
      el.textContent = user.Username ?? user.username ?? "Unknown User";
      friendsSidebar.appendChild(el);
    });

  } catch (err) {
    console.error("Error loading conversation members:", err);
  }
}




async function createNewConversation(conversationTitle, conversationType, userList, currentUserID) {
  const payload = {
    title: conversationTitle,
    type: conversationType,
    userIds: userList,
    createdBy: currentUserID
  };

  try {
    const response = await fetch(`/api/newConversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create conversation:", error);
      alert("Error creating conversation.");
      return null;
    }

    const rawData = await response.json();
    console.log("Conversation created:", rawData);


    await loadConversationList();
    
    if (new URLSearchParams(window.location.search).get("conversationID")) {
      populateConversationUsers();
    }

  
    if (rawData.conversationId) {
      window.location.href = `dashboard.html?conversationID=${rawData.conversationId}`;
    }

    return rawData;
  } catch (err) {
    console.error("Request error:", err);
    alert("Network error creating conversation.");
    return null;
  }
}



async function loadConversationList() {
  const response = await fetch(`/api/conversations/${userID}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  
  const data = await response.json();
  console.log("Conversation list:", data);

  conversationlist.innerHTML = "";

  data.forEach(convo => {
    conversationlist.appendChild(renderConversationItem(convo));
  });
  
  highlightFromQuery();
}

loadConversationList();


function renderConversationItem(convo) {
  const div = document.createElement("div");
    div.classList.add("conversation-item");
    div.dataset.convoId = convo.ConversationID;
  
    div.innerHTML = `
      <div class="conversation-title">${convo.ConvoTitle}</div>
    `;
  
    return div;
}


async function populateConversationUsers() {
  friendsSidebar.innerHTML = "";

  const currentUserID = localStorage.getItem("currentUserID");
  if (!currentUserID) return;

  const params = new URLSearchParams(window.location.search);
  const conversationID = params.get("conversationID");

  
  if (!conversationID) {
    return;
  }

  try {
    const response = await fetch(`/api/conversations/${conversationID}/users`);
    const rawData = await response.json();
    const members = Array.isArray(rawData) ? rawData : [rawData];

    const otherMembers = members.filter(u =>
      String(u.UserID ?? u.userId ?? u.id) !== String(currentUserID)
    );

    if (otherMembers.length === 0) {
      const el = document.createElement("div");
      el.classList.add("no-friends");
      el.textContent = "No other members";
      friendsSidebar.appendChild(el);
      return;
    }

    otherMembers.forEach(user => {
      const el = document.createElement("div");
      el.classList.add("friend");
      el.textContent = user.Username ?? user.username ?? "Unknown User";
      friendsSidebar.appendChild(el);
    });

  } catch (err) {
    console.error("Error loading conversation members:", err);
  }
}


populateConversationUsers();

conversationlist.addEventListener("click", (e) => {
  const selectedConversation = e.target.closest(".conversation-item");
  if (!selectedConversation) return;

  conversationlist
    .querySelectorAll(".conversation-item.active")
    .forEach(item => item.classList.remove("active"));

  selectedConversation.classList.add("active");
  const convoId = selectedConversation.dataset.convoId;
  window.location.href = `dashboard.html?conversationID=${convoId}`;
});


function highlightFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const activeId = params.get("conversationID");
  if (!activeId) return;

  conversationlist.querySelectorAll(".conversation-item").forEach(item => {
    item.classList.toggle("active", item.dataset.convoId === activeId);
  });
}


const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();

  localStorage.removeItem("token");
  localStorage.removeItem("currentUserID");
  document.cookie = "token=; path=/; max-age=0";

  try {
    if(window.socket && typeof window.socket.disconnect === "function") {
      window.socket.disconnect();
    }
  }

  catch(err) {
    console.warn("Error disconnecting socket during logout", err);
  }
  window.location.href = "/";
});



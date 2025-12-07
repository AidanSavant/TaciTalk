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
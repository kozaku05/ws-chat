document.getElementById("sendForm").style.display = "none";
const websocket = new WebSocket("ws://kozaku05.f5.si:3001");
let userName;
function joinRoom() {
  const roomId = document.getElementById("roomId").value;
  userName = document.getElementById("userName").value;
  if (!roomId || !userName) {
    alert("Room ID and User Name are required.");
    return;
  }
  websocket.send(
    JSON.stringify({ type: "join", roomId: roomId, userName: userName })
  );
  document.getElementById("joinRoom").style.display = "none";
  document.getElementById("sendForm").style.display = "block";
}
function sendMessage() {
  const message = document.getElementById("message").value;
  if (!message) {
    alert("Message is required.");
    return;
  }
  websocket.send(JSON.stringify({ type: "message", message: message }));
  document.getElementById("message").value = "";
}
function createLog(userName, content) {
  const log = document.getElementById("log");
  const box = document.createElement("p");
  const name = document.createElement("span");
  const message = document.createElement("span");
  name.textContent = userName + ": ";
  message.textContent = content;
  box.appendChild(name);
  box.appendChild(message);
  log.appendChild(box);
}
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "join":
      createLog("参加通知", `${data.userName} joined the room.`);
      break;
    case "log":
      data.log.forEach((element) => {
        createLog(element.userName, element.message);
      });
      break;
    case "message":
      createLog(data.userName, data.message);
      break;
    default:
      console.error("Unknown message type:", data.type);
  }
};

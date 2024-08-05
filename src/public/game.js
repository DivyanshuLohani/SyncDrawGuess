const joinGameButton = document.getElementById("joingame");
let socket = null;
let roomId = null;

joinGameButton.addEventListener("click", () => {
  const name = document.getElementById("name");
  const color = document.getElementById("color");
  const roomIdQuery = document.getElementById("roomId").value;

  socket = io();

  let params = [{ name: name.value, color: color.value }, roomIdQuery];
  socket.emit("joinRoom", ...params);

  socket.on("drawData", draw);

  socket.on("joinedRoom", (data) => {
    roomId = data.roomId;
    document.getElementById("roomid").textContent = data.roomId;
    data.players.forEach(addPlayer);
    initializeGame(data);
  });

  socket.on("playerJoined", addPlayer);
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function initializeGame(data) {
  document.getElementById("titleScreen").classList.add("hidden");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  data.gameState.drawingData.forEach(draw);
}

let isDrawing = false;
let lineWidth = 5;
let startX = 0;
let startY = 0;
let timeout = null;

function draw(data) {
  console.log(data);
  if (timeout) clearTimeout(timeout);

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = data[0];

  const x = data[1];
  const y = data[2];
  ctx.lineTo(x, y);
  ctx.stroke();

  timeout = setTimeout(() => {
    ctx.beginPath();
  }, 100);
}

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  ctx.stroke();
  ctx.beginPath();
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  draw(["#123fff", x, y]);

  socket.emit("draw", { roomId, data: ["#333344", x, y] });
});

canvas.addEventListener("mouseleave", () => {
  if (isDrawing) isDrawing = false;
  ctx.stroke();
  ctx.beginPath();
});
canvas.addEventListener("mouseenter", (e) => {
  if (e.buttons) isDrawing = true;
});

canvas.addEventListener("scroll", (e) => {
  e.preventDefault();
  lineWidth += 1;
});

function addPlayer(playerData) {
  const element = document.createElement("span");
  element.textContent = playerData.name;
  element.style.color = playerData.color;
  const left = document.getElementById("playerNames");
  left.appendChild(element);
}

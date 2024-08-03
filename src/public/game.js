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

  socket.on("drawData", (data) => {
    console.log(data);
    ctx.fillStyle = data[0];
    ctx.lineTo(data[1], data[2]);
    ctx.stroke();
  });

  socket.on("joinedRoom", (data) => {
    roomId = data.roomId;
    document.getElementById("roomid").textContent = data.roomId;
    initializeGame();
  });
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function initializeGame() {
  document.getElementById("titleScreen").classList.add("hidden");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let isDrawing = false;
let lineWidth = 5;
let startX = 0;
let startY = 0;

function draw(event) {
  if (!isDrawing) return;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();

  socket.emit("draw", { roomId, data: ["#333344", x, y] });
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

canvas.addEventListener("mousemove", draw);

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

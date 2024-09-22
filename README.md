# Sync Draw Guess

A real-time, multiplayer drawing and guessing game built using Node.js, Socket.IO, React, and TypeScript. Players join rooms, take turns drawing prompts, and compete to guess the drawings in a fun and interactive environment. With real-time canvas synchronization, timeouts for word selection, and smooth drawing experiences, this project captures the excitement of collaborative gameplay.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-000000?style=flat&logo=socket.io&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Backend

The backend is developed using Node.js and Socket.IO. It handles real-time communication between clients and the server.

### Server Events

- **Client Events:**
  - `connect` - Client connects to the server.
  - `disconnecting` - Client disconnects from the server.
  - `joinRoom` - Client joins a room.
  - `leaveRoom` - Client leaves a room.
  - `startGame` - Client starts the game.
  - `draw` - Client sends drawing data.
  - `guess` - Client sends a guess.
  - `changeSettings` - Client changes game settings.
  - `wordSelect` - Client selects a word.

- **Server Events:**
  - `joinedRoom` - Server confirms client has joined the room.
  - `playerJoined` - Server notifies when a player joins.
  - `playerLeft` - Server notifies when a player leaves.
  - `gameStarted` - Server notifies when the game starts.
  - `gameEnded` - Server notifies when the game ends.
  - `drawData` - Server sends drawing data to clients.
  - `guessed` - Server notifies when a word is guessed.
  - `turnEnded` - Server notifies when a turn ends.
  - `chooseWord` - Server requests the drawer to choose a word.
  - `wordChosen` - Server sends the chosen word to clients.
  - `settingsChanged` - Server notifies when settings are changed.
  - `guessFail` - Server notifies when a guess fails.

### Room System

Players join a room using a unique room ID. If the drawer takes too long to choose a word, one is automatically assigned. Each turn has a time limit for guessing.

## Frontend

The frontend is developed using React with TypeScript and Vite for a fast development experience.

## Installation

  ### Clone the repository
   ```bash
   git clone https://github.com/DivyanshuLohani/SyncDrawGuess.git
   cd SyncDrawGuess
   ```

   ### Start a redis server
   ```bash
   docker run -d -p 6379:6379 redis
   ```

   ### Start the server
   ```bash
   cd server 
   npm install && npm run dev
   ```

   ### Start the client
   ```bash
   cd client
   npm install && npm run dev
   ```

   ### Playing
    http://localhost:5173
    
   
## Preview
[!Watch the video](https://github.com/user-attachments/assets/3c92e898-b9be-43ed-99f4-e02371018176)

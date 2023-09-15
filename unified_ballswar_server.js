
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let players = {};
let player1Health = 100;
let player2Health = 100;

io.on('connection', (socket) => {
  console.log('New user connected', socket.id);

  // Add the player to the list of connected players
  players[socket.id] = socket;

  // Initialize player health
  socket.emit('initialState', { playerHealth: 100 });

  // Synchronize player positions
  socket.on('move', (data) => {
    socket.broadcast.emit('move', { x: data.x, y: data.y, id: socket.id });
  });

  // Handle attacks and collisions
  socket.on('healthUpdate', (data) => {
    player1Health = data.player1Health;
    player2Health = data.player2Health;
    io.emit('healthUpdate', { player1Health, player2Health });
  });

  // Check for win/loss conditions
  socket.on('gameOver', (data) => {
    io.emit('gameOver', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    delete players[socket.id];
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

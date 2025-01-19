const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

const JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRmYTUyYTVhLWI3NmUtNDU3YS1hODVjLWJjNTkyODY5MGMxMiIsInVzZXJuYW1lIjoibGFzd2kyIiwiaWF0IjoxNzM3MjQzNTY1LCJleHAiOjE3MzczMjk5NjV9.C06FvjRC9OvYqlOlLj_OgeJhAABeD7pzutgEwi8XRJo';

let currentMove = 0;
// O Loses
// const playerMoves = [
//   { position: 4, symbol: "O" },
//   { position: 5, symbol: "O" },
//   { position: 3, symbol: "O" },
//   { position: 7, symbol: "O" }
// ];

// O Wins
// const playerMoves = [
//   { position: 3, symbol: "O" },
//   { position: 4, symbol: "O" },
//   { position: 2, symbol: "O" },
//   { position: 5, symbol: "O" },
// ];

// Draw
const playerMoves = [
  { position: 1, symbol: 'O' },
  { position: 4, symbol: 'O' },
  { position: 6, symbol: 'O' },
  { position: 8, symbol: 'O' }
];

const socket = io(SERVER_URL, {
  auth: {
    token: JWT_TOKEN
  }
});

socket.on('connect', () => {
  console.log(`Connected to server with ID: ${socket.id}`);

  socket.on('gameInvited', data => {
    currentMove = 0;
    console.log('player Notified:', data);
    socket.emit('joinGame', { roomId: data.roomId });
  });

  socket.on('error', err => {
    console.error('Error received:', err);
  });

  socket.on('turnToMove', data => {
    console.log("Player's to move:", data);
    const { roomId } = data;
    console.log({ currentMove });
    const playerMove = playerMoves[currentMove];
    currentMove++;
    if (playerMove) socket.emit('makeMove', { roomId, move: playerMove });
  });
  socket.on('gameFinished', data => {
    console.log('Game finished:', {
      result: data.result,
      board: data.board
    });
    currentMove = 0;
    socket.emit('closeRoom', { roomId: data.roomId });
  });
});

socket.on('disconnect', reason => {
  console.log(`Disconnected from server: ${reason}`);
});

socket.on('connect_error', error => {
  console.error('Connection error:', error.message);
});

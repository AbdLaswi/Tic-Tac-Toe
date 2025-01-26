const { io } = require('socket.io-client');

// Replace with your server URL
const SERVER_URL = 'http://localhost:3000';
// Replace with a valid JWT token
const JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdiZjVmMGZkLTk3YjEtNGRhMi1hZTdkLWU2ZWNmNDI3YzJlMSIsInVzZXJuYW1lIjoibGFzd2kiLCJpYXQiOjE3MzcyNDIxNDgsImV4cCI6MTczNzMyODU0OH0.nHckRVnUTVDVRBoxeqtexCiUHh0fwW1yuE3zLEAFFHA';

const notifiedPlayer = 'dfa52a5a-b76e-457a-a85c-bc5928690c12';
let currentMove = 0;
// X Wins
// const playerMoves = [
//   { position: 0, symbol: "X" },
//   { position: 1, symbol: "X" },
//   { position: 2, symbol: "X" },
//   { position: 6, symbol: "X" },
//   { position: 8, symbol: "X" }
// ];

// X Loses

// const playerMoves = [
//   { position: 0, symbol: "X" },
//   { position: 1, symbol: "X" },
//   { position: 6, symbol: "X" },
//   { position: 8, symbol: "X" },
//   { position: 7, symbol: "X" }
// ]

// Draw
const playerMoves = [
  { position: 0, symbol: 'X' },
  { position: 2, symbol: 'X' },
  { position: 5, symbol: 'X' },
  { position: 3, symbol: 'X' },
  { position: 7, symbol: 'X' }
];

const socket = io(SERVER_URL, {
  auth: {
    token: JWT_TOKEN
  }
});

socket.on('connect', () => {
  console.log(`Connected to server with ID: ${socket.id}`);

  socket.emit('createGame');

  socket.on('gameStarted', data => {
    const { roomId } = data;
    console.log({ currentMove });
    const playerMove = playerMoves[currentMove];
    currentMove++;
    socket.emit('makeMove', { roomId, move: playerMove });
  });

  socket.on('roomCreated', data => {
    const roomId = data.roomId;
    socket.emit('notifyPlayer', {
      roomId,
      playerId: notifiedPlayer
    });
    console.log(`Room created successfully: ${data.roomId}`);
  });

  socket.on('playerJoined', data => {
    console.log('player JOINED:', data);
    socket.emit('startGame', { roomId: data.roomId });
  });

  socket.on('error', err => {
    console.error('Error received:', err);
  });

  socket.on('gameFinished', data => {
    console.log('Game finished:', {
      result: data.result,
      board: data.board
    });
    currentMove = 0;
    socket.emit('closeRoom', { roomId: data.roomId });
  });

  socket.on('turnToMove', data => {
    console.log("Player's to move:", data);
    const { roomId } = data;
    console.log({ currentMove });
    const playerMove = playerMoves[currentMove];
    currentMove++;
    if (playerMove) socket.emit('makeMove', { roomId, move: playerMove });
  });
});

socket.on('disconnect', reason => {
  console.log(`Disconnected from server: ${reason}`);
});

socket.on('connect_error', error => {
  console.error('Connection error:', error.message);
});

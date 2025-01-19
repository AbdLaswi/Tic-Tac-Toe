async function getNextPlayerTurn(game, move, io, pubClient) {
  const { firstPlayer, secPlayer } = game;
  const playerId = move.symbol === 'X' ? secPlayer : firstPlayer;
  const socketId = await pubClient.get(`User_${playerId}`);

  const player = io.sockets.sockets.get(socketId);

  return player;
}

module.exports = getNextPlayerTurn;

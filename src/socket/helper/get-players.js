async function getPlayers(game, io, pubClient) {
  const { firstPlayer, secPlayer } = game;
  const firstSocketId = await pubClient.get(`User_${firstPlayer}`);
  const secSocketId = await pubClient.get(`User_${secPlayer}`);

  const firstSocketPlayer = io.sockets.sockets.get(firstSocketId);
  const secSocketPlayer = io.sockets.sockets.get(secSocketId);

  return [firstSocketPlayer, secSocketPlayer];
}

module.exports = getPlayers;

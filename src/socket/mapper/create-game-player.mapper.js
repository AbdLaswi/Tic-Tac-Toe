module.exports = game => {
  return {
    firstPlayerId: game.firstPlayer,
    secPlayerId: game.secPlayer,
    gameId: game.id
  };
};

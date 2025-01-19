module.exports = (user, game) => {
  return {
    firstPlayer: user.id,
    secPlayer: game.secPlayer,
    moveHistory: [],
    board: new Array(9),
    currentPlayerMove: 'X',
    startedAt: game.startedAt
  };
};

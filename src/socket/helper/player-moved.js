module.exports = (cachedGame, move) => {
  cachedGame.moveHistory.push(move);
  cachedGame.board[move.position] = move.symbol;
  cachedGame.currentPlayerMove = cachedGame.currentPlayerMove === 'X' ? 'O' : 'X';
};

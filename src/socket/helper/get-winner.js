const winningSpots = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function getWinner(cachedGame) {
  let winner;
  const { board, moveHistory } = cachedGame;
  if (moveHistory.length < 5) return winner;
  for (let i = 0; i < winningSpots.length; i++) {
    const [x, y, z] = winningSpots[i];
    if (board[x] && board[x] === board[y] && board[x] === board[z]) {
      winner = board[x];
      break;
    }
  }
  return winner;
}

module.exports = getWinner;

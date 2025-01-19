const getNextPlayerTurn = require('./get-next-player-turn');
const playerMoved = require('./player-moved');
const getPlayers = require('./get-players');
const getWinner = require('./get-winner');

module.exports = { playerMoved, getWinner, getNextPlayerTurn, getPlayers };

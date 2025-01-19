const { GamePlayer } = require('../../model');
async function createGamePlayer(players) {
  return GamePlayer.create(players);
}

module.exports = {
  createGamePlayer
};

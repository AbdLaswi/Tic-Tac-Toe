const { createGamerMapper, gameDetailsMapper, createGamePlayerMapper } = require('../mapper');
const { getWinner, playerMoved, getNextPlayerTurn, getPlayers } = require('../helper');
const { gameService, gamePlayerService } = require('../../service');
const { gameStatuses } = require('../../config/constants');
const { redis } = require('../../config');
const { error, logger } = require('../../utils');

async function gameValidation(roomId, pubClient, status) {
  const options = status ? { status } : {};
  const game = await gameService.getGame(roomId, options);
  if (!game) throw error.notFoundError('Game not found');

  const cachedGame = await pubClient.get(`Room_${game.id}`);
  if (!cachedGame) throw error.notFoundError('Game not found');

  return { game, cachedGame: JSON.parse(cachedGame) };
}

function onJoinGame(socket, io, pubClient) {
  socket.on('joinGame', async data => {
    try {
      const { roomId } = data;
      const { user } = socket;
      if (!roomId) throw error.badRequestError('Room ID is required');

      const { cachedGame } = await gameValidation(roomId, pubClient, gameStatuses.NEW);

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room && room.size >= 2) throw error.badRequestError('Room is full');

      socket.join(roomId);
      await pubClient.set(`Room_${roomId}`, JSON.stringify({ ...cachedGame, secPlayer: user.id }), {
        EX: redis.gameTTL
      });

      io.to(roomId).emit('playerJoined', { roomId, playerId: socket.id });
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onCreatingGame(socket, pubClient) {
  socket.on('createGame', async () => {
    try {
      const { user } = socket;
      if (!user) throw error.badRequestError('user is not connected properly');

      const gameDto = createGamerMapper(user);
      const game = await gameService.createGame(gameDto);

      socket.join(game.id);
      const gameDetails = gameDetailsMapper(user, game);
      await pubClient.set(`Room_${game.id}`, JSON.stringify(gameDetails), {
        EX: redis.gameTTL
      });

      socket.emit('roomCreated', { roomId: game.id });
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onStartingGame(socket, io, pubClient) {
  socket.on('startGame', async data => {
    try {
      const { roomId } = data;
      const { user } = socket;

      if (!roomId) throw error.badRequestError('Room ID is required');

      const { game, cachedGame } = await gameValidation(roomId, pubClient, gameStatuses.NEW);

      if (game.creatorId !== user.id)
        throw error.badRequestError('You are not authorized to start the game');

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room && room.size < 2)
        throw error.badRequestError('you need a second player to start the game');

      const updatedField = {
        startedAt: new Date().toJSON(),
        status: gameStatuses.INPROGRESS
      };

      await gameService.updateGame(game.id, updatedField);

      const gamePlayerDto = createGamePlayerMapper({ ...cachedGame, id: game.id });
      await gamePlayerService.createGamePlayer(gamePlayerDto);

      const updatedGame = gameDetailsMapper(user, { ...cachedGame, ...updatedField });
      await pubClient.set(`Room_${game.id}`, JSON.stringify(updatedGame), {
        EX: redis.gameTTL
      });

      socket.emit('gameStarted', { roomId: game.id });
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onNotifyPlayer(socket, io, pubClient) {
  socket.on('notifyPlayer', async data => {
    try {
      const { roomId, playerId } = data;

      if (!roomId) throw error.badRequestError('Room ID is required');
      if (!playerId) throw error.badRequestError('player is not specified, must choose a player');

      const { game } = await gameValidation(roomId, pubClient, gameStatuses.NEW);

      const socketId = await pubClient.get(`User_${playerId}`);
      if (!socketId) throw error.notFoundError('Player is not online');

      const player = io.sockets.sockets.get(socketId);
      if (!player) throw error.notFoundError('Player is not online');

      player.emit('gameInvited', { message: `You have been notified in room ${roomId}`, roomId });

      socket.emit('playerNotified', { roomId: game.id, playerId });
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onMakingMove(socket, io, pubClient) {
  socket.on('makeMove', async data => {
    try {
      const { roomId, move } = data;

      if (!roomId) throw error.badRequestError('Room ID is required');
      if (!move) throw error.badRequestError('please make a move');

      const { game, cachedGame } = await gameValidation(roomId, pubClient, gameStatuses.INPROGRESS);

      if (move.symbol !== cachedGame.currentPlayerMove)
        throw error.badRequestError('it is not your turn to move');

      const winner = getWinner(cachedGame);
      playerMoved(cachedGame, move);
      if (winner || cachedGame.moveHistory.length === 9) {
        const wonPlayer = winner === 'X' ? cachedGame.firstPlayer : cachedGame.secPlayer;
        const result = winner ? `winner: ${wonPlayer}` : 'it is a Draw';
        const updatedField = {
          status: gameStatuses.FINISHED,
          result: {
            moves: cachedGame.moveHistory,
            result
          },
          endedAt: new Date().toJSON()
        };
        await gameService.updateGame(game.id, updatedField);

        const [firstPlayer, secPlayer] = await getPlayers(cachedGame, io, pubClient);

        firstPlayer.emit('gameFinished', { roomId: game.id, result, board: cachedGame.board });
        secPlayer.emit('gameFinished', { roomId: game.id, result, board: cachedGame.board });
        socket.emit('gameFinished', { roomId: game.id, result, board: cachedGame.board });
      } else {
        await pubClient.set(`Room_${game.id}`, JSON.stringify(cachedGame), {
          EX: redis.gameTTL
        });

        const nextPlayer = await getNextPlayerTurn(cachedGame, move, io, pubClient);

        nextPlayer.emit('turnToMove', { roomId: game.id });
        socket.emit('moveMade', { roomId: game.id });
      }
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onClosingRoom(socket, io, pubClient) {
  socket.on('closingRoom', async data => {
    try {
      const { roomId } = data;

      if (!roomId) throw error.badRequestError('Room ID is required');

      const { game } = await gameValidation(roomId, pubClient, gameStatuses.FINISHED);

      if (!game) throw error.notFoundError('Game not found or the game is not completed');

      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) throw error.notFoundError('Room not found or the room is already closed');

      io.socketsLeave(roomId);
      pubClient.del(`Room_${game.id}`);

      socket.emit('roomClosed', { roomId });
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onLeavingRoom(socket, pubClient) {
  socket.on('leavingRoom', async data => {
    try {
      const { roomId } = data;
      const { user } = socket;

      if (!roomId) throw error.badRequestError('Room ID is required');

      const { game, cachedGame } = await gameValidation(roomId, pubClient);

      if (!game) throw error.notFoundError('Game not found or the game is not completed');

      if (game.status === gameStatuses.INPROGRESS) {
        const leftPlayer =
          user.id === cachedGame.firstPlayer ? cachedGame.firstPlayer : cachedGame.secPlayer;
        const wonPlayer =
          user.id !== cachedGame.firstPlayer ? cachedGame.firstPlayer : cachedGame.secPlayer;
        const result = `Player Left: ${leftPlayer}, the winner is ${wonPlayer}`;
        const updatedField = {
          status: gameStatuses.FINISHED,
          result: {
            moves: cachedGame.moveHistory,
            result
          },
          endedAt: new Date().toJSON()
        };
        await gameService.updateGame(game.id, updatedField);

        socket.emit('gameFinished', { roomId: game.id, result, board: game.board });
      } else {
        socket.id.leave(roomId);
        socket.emit('playerLeft', { roomId, playerId: user.id });
      }
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

function onLosingConnection(socket, pubClient) {
  socket.on('disconnect', async reason => {
    try {
      const { user } = socket;

      const options = {
        where: {
          status: gameStatuses.INPROGRESS
        }
      };

      const games = await gameService.listUserGames(options, user.id);

      for await (const game of games) {
        const roomId = game.id;
        const cachedGame = await pubClient.get(`Room_${roomId}`);
        if (game.status === gameStatuses.INPROGRESS) {
          const leftPlayer =
            user.id === cachedGame.firstPlayer ? cachedGame.firstPlayer : cachedGame.secPlayer;
          const wonPlayer =
            user.id !== cachedGame.firstPlayer ? cachedGame.firstPlayer : cachedGame.secPlayer;
          const result = `Player Left: ${leftPlayer}, the winner is ${wonPlayer}`;
          const updatedField = {
            status: gameStatuses.FINISHED,
            result: {
              moves: cachedGame.moveHistory,
              result
            },
            endedAt: new Date().toJSON()
          };
          await gameService.updateGame(game.id, updatedField);

          socket.emit('gameFinished', { roomId, result, board: game.board });
        } else {
          socket.id.leave(roomId);
          socket.emit('playerLeft', { roomId, playerId: user.id });
        }
      }
      logger.info(`player disconnected for this reason: ${reason}`);
    } catch (err) {
      const errMessage = err.message || 'An unexpected error occurred';
      socket.emit('error', { message: errMessage });
    }
  });
}

module.exports = (socket, io, pubClient) => {
  onNotifyPlayer(socket, io, pubClient);
  onStartingGame(socket, io, pubClient);
  onLosingConnection(socket, pubClient);
  onClosingRoom(socket, io, pubClient);
  onLeavingRoom(socket, io, pubClient);
  onMakingMove(socket, io, pubClient);
  onJoinGame(socket, io, pubClient);
  onCreatingGame(socket, pubClient);
};

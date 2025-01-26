const { createServer } = require('node:http');
const { Server } = require('socket.io');
const ioc = require('socket.io-client');
const { gameActions } = require('../../../../src/socket/actions');
const { gameStatuses } = require('../../../../src/config/constants');
const { gameService, gamePlayerService } = require('../../../../src/service');
const {
  getWinner,
  playerMoved,
  getPlayers,
  getNextPlayerTurn
} = require('../../../../src/socket/helper');
const {
  createGamerMapper,
  gameDetailsMapper,
  createGamePlayerMapper
} = require('../../../../src/socket/mapper');

const {
  redis: { gameTTL }
} = require('../../../../src/config');
const redis = require('../../../../src/lib/redis');

jest.mock('../../../../src/socket/mapper', () => ({
  createGamerMapper: jest.fn(),
  gameDetailsMapper: jest.fn(),
  createGamePlayerMapper: jest.fn()
}));

jest.mock('../../../../src/socket/helper', () => ({
  getWinner: jest.fn(),
  playerMoved: jest.fn(),
  getPlayers: jest.fn(),
  getNextPlayerTurn: jest.fn()
}));

jest.mock('../../../../src/service/game-player');
jest.mock('../../../../src/service/game');
jest.mock('../../../../src/lib/redis');

describe('Socket Actions: Game Actions Unit Tests', () => {
  let io, serverSocket, clientSocket, pubClientMock;
  const mockUser = {
    id: 'cd0feb00-328e-4ec5-b145-8fc6b7639a1e',
    username: 'Player1'
  };
  const mockMappedGame = { creatorId: 'cd0feb00-328e-4ec5-b145-8fc6b7639a1e' };
  const mockRoomId = '35106c91-732f-48c1-a8d3-dc1e565d0b2a';
  const mockPlayerId = 'cd0feb00-328e-4ec5-b145-8fc6b7639a1e';
  const mockSecPlayerId = '8ecaf84c-5e7b-42a9-9481-c3d8198e6af6';
  const mockSocketId = 'mockSocketId';
  const mockGame = { id: mockRoomId, status: gameStatuses.NEW, creatorId: mockPlayerId };
  const mockMove = { position: 0, symbol: 'X', player: mockPlayerId };
  const mockCachedGame = {
    firstPlayer: mockPlayerId,
    secPlayer: null,
    moveHistory: [],
    board: new Array(9).fill(null),
    currentPlayerMove: 'X'
  };
  const mockStartedCachedGame = {
    ...mockCachedGame,
    startedAt: new Date().toJSON(),
    status: gameStatuses.INPROGRESS
  };

  const mockMidGame = { ...mockGame, status: gameStatuses.INPROGRESS };

  const mockDuringGameCachedGame = {
    ...mockStartedCachedGame,
    secPlayer: mockSecPlayerId
  };

  beforeAll(done => {
    pubClientMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    };
    redis.pubClient = pubClientMock;

    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on('connection', socket => {
        serverSocket = socket;
        gameActions(socket, io, pubClientMock);
      });
      clientSocket.on('connect', done);
    });
  });

  beforeEach(() => {
    clientSocket.removeAllListeners();
    pubClientMock.get.mockReset();
    pubClientMock.set.mockReset();
    pubClientMock.del.mockReset();
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
    io.sockets.adapter.rooms.clear();
  });

  test('createGame - should create a game and emit roomCreated', async () => {
    createGamerMapper.mockReturnValue(mockMappedGame);
    gameService.createGame.mockResolvedValue(mockGame);
    gameDetailsMapper.mockReturnValue({
      firstPlayer: 'cd0feb00-328e-4ec5-b145-8fc6b7639a1e',
      secPlayer: null,
      moveHistory: [],
      board: new Array(9),
      currentPlayerMove: 'X'
    });
    pubClientMock.set.mockResolvedValue(true);

    serverSocket.user = mockUser;

    clientSocket.emit('createGame');
    const result = await new Promise(resolve => {
      clientSocket.on('roomCreated', resolve);
    });
    expect(result).toEqual({ roomId: mockGame.id });
    expect(createGamerMapper).toHaveBeenCalledWith(mockUser);
    expect(gameService.createGame).toHaveBeenCalledWith(mockMappedGame);
    expect(gameDetailsMapper).toHaveBeenCalledWith(mockUser, mockGame);
    expect(pubClientMock.set).toHaveBeenCalledWith(
      `Room_${mockGame.id}`,
      JSON.stringify({
        firstPlayer: 'cd0feb00-328e-4ec5-b145-8fc6b7639a1e',
        secPlayer: null,
        moveHistory: [],
        board: new Array(9),
        currentPlayerMove: 'X'
      }),
      { EX: gameTTL }
    );
  });

  test('notifyPlayer - should notify the player and emit playerNotified', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    pubClientMock.get.mockResolvedValue(mockPlayerId);
    gameService.getGame.mockResolvedValue(mockGame);

    const mockPlayerSocket = {
      emit: jest.fn()
    };
    io.sockets.sockets.set(mockPlayerId, mockPlayerSocket);

    clientSocket.emit('notifyPlayer', { roomId: mockRoomId, playerId: mockPlayerId });

    const result = await new Promise(resolve => {
      clientSocket.on('playerNotified', resolve);
    });

    expect(result).toEqual({ roomId: mockGame.id, playerId: mockPlayerId });
    expect(pubClientMock.get).toHaveBeenCalledWith(`User_${mockPlayerId}`);
    expect(mockPlayerSocket.emit).toHaveBeenCalledWith('gameInvited', {
      message: `You have been notified in room ${mockRoomId}`,
      roomId: mockRoomId
    });
  });

  test('notifyPlayer - should emit error if roomId is missing', done => {
    clientSocket.emit('notifyPlayer', { playerId: mockSecPlayerId });

    clientSocket.on('error', data => {
      try {
        expect(data).toEqual({ message: 'Room ID is required' });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('notifyPlayer - should emit error if playerId is missing', done => {
    clientSocket.emit('notifyPlayer', { roomId: mockRoomId });

    clientSocket.on('error', data => {
      try {
        expect(data).toEqual({ message: 'player is not specified, must choose a player' });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('notifyPlayer - should emit error if player is not online', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    pubClientMock.get.mockResolvedValue(null);
    gameService.getGame.mockResolvedValue(mockGame);

    clientSocket.emit('notifyPlayer', { roomId: mockRoomId, playerId: mockPlayerId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'Player is not online' });
    expect(pubClientMock.get).toHaveBeenCalledWith(`User_${mockPlayerId}`);
  });

  test('joinGame - should join a room and emit playerJoined', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    gameService.getGame.mockResolvedValue(mockGame);
    pubClientMock.set.mockResolvedValue(true);

    serverSocket.user = { id: mockSecPlayerId };

    clientSocket.emit('joinGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('playerJoined', resolve);
    });

    expect(result).toEqual({ roomId: mockRoomId, playerId: clientSocket.id });
    expect(pubClientMock.get).toHaveBeenCalledWith(`Room_${mockRoomId}`);
    expect(gameService.getGame).toHaveBeenCalledWith(mockRoomId, { status: gameStatuses.NEW });
    expect(pubClientMock.set).toHaveBeenCalledWith(
      `Room_${mockRoomId}`,
      JSON.stringify({ ...mockCachedGame, secPlayer: mockSecPlayerId }),
      { EX: gameTTL }
    );
  });

  test('joinGame - should emit error if roomId is missing', done => {
    clientSocket.emit('joinGame', {});

    clientSocket.on('error', data => {
      try {
        expect(data).toEqual({ message: 'Room ID is required' });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('joinGame - should emit error if room is full', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    gameService.getGame.mockResolvedValue(mockGame);
    pubClientMock.set.mockResolvedValue(true);

    io.sockets.adapter.rooms.set(mockRoomId, new Set(['dummySocket1', 'dummySocket2']));

    serverSocket.user = { id: mockSecPlayerId };

    clientSocket.emit('joinGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'Room is full' });
    expect(pubClientMock.get).toHaveBeenCalledWith(`Room_${mockRoomId}`);
    expect(gameService.getGame).toHaveBeenCalledWith(mockRoomId, { status: gameStatuses.NEW });
  });

  test('joinGame - should emit error if the game does not exist in the database', async () => {
    gameService.getGame.mockResolvedValue(null);

    clientSocket.emit('joinGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'Game not found' });
    expect(gameService.getGame).toHaveBeenCalledWith(mockRoomId, { status: gameStatuses.NEW });
  });

  test('joinGame - should emit error if the game does not exist in Redis', async () => {
    pubClientMock.get.mockResolvedValueOnce(null);
    gameService.getGame.mockResolvedValue(mockGame);

    clientSocket.emit('joinGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'Game not found' });
    expect(pubClientMock.get).toHaveBeenCalledWith(`Room_${mockRoomId}`);
    expect(gameService.getGame).toHaveBeenCalledWith(mockRoomId, { status: gameStatuses.NEW });
  });

  test('startGame - should emit error if roomId is missing', done => {
    clientSocket.emit('startGame', {});

    clientSocket.on('error', data => {
      try {
        expect(data).toEqual({ message: 'Room ID is required' });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('startGame - should emit error if user is not the creator', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    gameService.getGame.mockResolvedValue(mockGame);

    serverSocket.user = { id: mockSecPlayerId };

    clientSocket.emit('startGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'You are not authorized to start the game' });
  });

  test('startGame - should emit error if room does not have two players', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    gameService.getGame.mockResolvedValue(mockGame);

    serverSocket.user = mockUser;
    io.sockets.adapter.rooms.set(mockRoomId, new Set([mockPlayerId]));

    clientSocket.emit('startGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'you need a second player to start the game' });
  });

  test('startGame - should emit error if gameValidation fails', async () => {
    pubClientMock.get.mockResolvedValueOnce(null);

    clientSocket.emit('startGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'Game not found' });
    expect(pubClientMock.get).toHaveBeenCalledWith(`Room_${mockRoomId}`);
  });

  test('startGame - should start a game and emit gameStarted', async () => {
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockCachedGame));
    pubClientMock.get.mockResolvedValueOnce(mockSecPlayerId);

    gameService.getGame.mockResolvedValue(mockGame);
    gameService.updateGame.mockResolvedValue(true);

    createGamePlayerMapper.mockReturnValue({
      firstPlayerId: mockPlayerId,
      secPlayerId: mockSecPlayerId,
      gameId: mockRoomId
    });
    gamePlayerService.createGamePlayer.mockResolvedValue(true);
    gameDetailsMapper.mockReturnValue(mockStartedCachedGame);

    serverSocket.user = mockUser;

    io.sockets.adapter.rooms.set(mockRoomId, new Set([mockPlayerId, mockSecPlayerId]));

    clientSocket.emit('startGame', { roomId: mockRoomId });

    const result = await new Promise(resolve => {
      clientSocket.on('gameStarted', resolve);
    });

    expect(result).toEqual({ roomId: mockRoomId });
    expect(pubClientMock.get).toHaveBeenCalledWith(`Room_${mockRoomId}`);
    expect(gameService.updateGame).toHaveBeenCalledWith(mockRoomId, {
      startedAt: expect.any(String),
      status: gameStatuses.INPROGRESS
    });
    expect(gamePlayerService.createGamePlayer).toHaveBeenCalledWith({
      firstPlayerId: mockPlayerId,
      secPlayerId: mockSecPlayerId,
      gameId: mockRoomId
    });
    expect(pubClientMock.set).toHaveBeenCalledWith(
      `Room_${mockRoomId}`,
      JSON.stringify(mockStartedCachedGame),
      { EX: gameTTL }
    );
  });

  test('makeMove - should process a valid move and notify the next player', async () => {
    gameService.getGame.mockResolvedValue(mockMidGame);
    pubClientMock.get
      .mockResolvedValueOnce(JSON.stringify(mockDuringGameCachedGame))
      .mockResolvedValueOnce(mockSocketId);

    getWinner.mockReturnValue(null);
    pubClientMock.set.mockResolvedValue(true);

    const mockNextPlayerSocket = { emit: jest.fn() };
    getNextPlayerTurn.mockResolvedValue(mockNextPlayerSocket);

    clientSocket.emit('makeMove', { roomId: mockRoomId, move: mockMove });

    const result = await new Promise(resolve => {
      clientSocket.on('moveMade', resolve);
    });

    expect(result).toEqual({ roomId: mockRoomId });
    expect(gameService.getGame).toHaveBeenCalledWith(mockRoomId, {
      status: gameStatuses.INPROGRESS
    });
    expect(pubClientMock.get).toHaveBeenCalledWith(`Room_${mockRoomId}`);
    expect(playerMoved).toHaveBeenCalledWith(mockDuringGameCachedGame, mockMove);
    expect(pubClientMock.set).toHaveBeenCalledWith(
      `Room_${mockRoomId}`,
      JSON.stringify(mockDuringGameCachedGame),
      { EX: gameTTL }
    );
    expect(getNextPlayerTurn).toHaveBeenCalledWith(
      mockDuringGameCachedGame,
      mockMove,
      io,
      pubClientMock
    );
    expect(mockNextPlayerSocket.emit).toHaveBeenCalledWith('turnToMove', { roomId: mockRoomId });
  });

  test('makeMove - should emit error if roomId is missing', done => {
    clientSocket.emit('makeMove', { move: mockMove });

    clientSocket.on('error', data => {
      try {
        expect(data).toEqual({ message: 'Room ID is required' });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test('makeMove - should emit error if move is missing', done => {
    clientSocket.emit('makeMove', { roomId: mockRoomId });

    clientSocket.on('error', data => {
      try {
        expect(data).toEqual({ message: 'please make a move' });
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test("makeMove - should emit error if it is not the player's turn", async () => {
    gameService.getGame.mockResolvedValue(mockMidGame);
    pubClientMock.get.mockResolvedValueOnce(
      JSON.stringify({ ...mockDuringGameCachedGame, currentPlayerMove: 'O' })
    );

    clientSocket.emit('makeMove', { roomId: mockRoomId, move: mockMove });

    const result = await new Promise(resolve => {
      clientSocket.on('error', resolve);
    });

    expect(result).toEqual({ message: 'it is not your turn to move' });
  });

  test('makeMove - should emit gameFinished when there is a winner', async () => {
    gameService.getGame.mockResolvedValue(mockMidGame);
    pubClientMock.get.mockResolvedValueOnce(JSON.stringify(mockDuringGameCachedGame));
    getWinner.mockReturnValue('X');
    gameService.updateGame.mockResolvedValue(true);
    getPlayers.mockResolvedValue([clientSocket, clientSocket]);

    clientSocket.emit('makeMove', { roomId: mockRoomId, move: mockMove });

    const result = await new Promise((resolve, reject) => {
      clientSocket.once('gameFinished', resolve);
      clientSocket.once('error', reject);
    });

    expect(result).toEqual({
      roomId: mockRoomId,
      result: 'winner: cd0feb00-328e-4ec5-b145-8fc6b7639a1e',
      board: mockDuringGameCachedGame.board
    });
  });

  test('makeMove - should emit gameFinished when it is a draw', async () => {
    gameService.getGame.mockResolvedValue(mockGame);
    pubClientMock.get.mockResolvedValueOnce(
      JSON.stringify({ ...mockDuringGameCachedGame, moveHistory: Array(9).fill(mockMove) })
    );
    getWinner.mockReturnValue(null);

    clientSocket.emit('makeMove', { roomId: mockRoomId, move: mockMove });

    const result = await new Promise(resolve => {
      clientSocket.on('gameFinished', resolve);
    });

    expect(result).toEqual({
      roomId: mockRoomId,
      result: 'it is a Draw',
      board: mockDuringGameCachedGame.board
    });
  });
});

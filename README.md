# Tic-Tac-Toe Application

## Pre-requisites
- Node.js: v22.13
- Redis
- Docker
- PostgreSQL

---

## Initializing and Running the App

### Install Dependencies
Run the following command to install all required dependencies:
```bash
npm install
```

## **Start the Application**:

**Locally**
Run the following command to start the app in development mode:

Run the following command to start the app in development mode:

```bash
npm run start:dev
```

**On Production**
Run the following command to start the app in production mode:

```bash
npm run start
```

**Debugging**
To debug the application, press `F5` in your debugger environment.


## **Testing the App**
This is a real-time application, so two clients must run simultaneously to interact with the server. A simulator folder is provided to mimic the user experience without a UI.

Simulator Instructions
Start the server.
Navigate to the simulator folder and adjust the simulation as needed. Three pre-configured arrays determine the game's result:
Default: Draw.
Uncomment relevant sections for X Wins or O Wins.
Run the following commands to start the simulators:

```bash
    npm run start:firstClient
```

```bash
    npm run start:secClient
```

**Note:**

The second client must start first as it initiates the game.
If the first client starts before the second, you may see a message: "player is not online yet". Once the second client connects, restart the server to reinitialize the simulation.

## **Unit Tests:**
To run unit tests, use the following command:

```bash
    npm run start:unit
```
Alternatively, select Debug Jest Tests from the debugger menu.


## **Features:**

The application supports the following events:

- Create game.
- Notify other players to join.
- Notify the admin when other players join.
- Wait in the lobby until the admin starts the game.
- Allow players to leave the lobby.
- Handle game logic (make moves).
- Close the room or lobby.
- Join the room or lobby.
- Store games in the database.
- Allow players to view other players' accounts.
- Allow players to view their game history and review each move.
- Create an account and log in.

**About the App:**

- The app uses JWT for authentication.
- The app uses Redis to store game information (short-term) with a cache duration of 10 minutes, which renews on every move.
- The app uses PostgreSQL to store game information (long-term) and user information.
- The logs folder contains two files simulating cloud logging services like CloudWatch or Loggly.
- The app uses both Socket.IO and Express.js to serve players based on business needs.

## **App structure:**
.
├── Dockerfile
├── README.md
├── deployment
│   ├── config.js
│   └── migrations
│       └── 20250118231052-init.js
├── logs
│   ├── combined.log
│   └── error.log
├── package-lock.json
├── package.json
├── simulator
│   ├── client.js
│   └── sec-client.js
└── src
    ├── api
    │   ├── authentication
    │   │   ├── controller.js
    │   │   ├── index.js
    │   │   └── validation.js
    │   ├── game
    │   │   ├── controller.js
    │   │   ├── index.js
    │   │   └── validation.js
    │   ├── health-check
    │   │   └── index.js
    │   ├── index.js
    │   ├── middleware
    │   │   ├── authenticator.js
    │   │   └── index.js
    │   └── user
    │       ├── controller.js
    │       ├── index.js
    │       └── validation.js
    ├── config
    │   ├── constants.js
    │   └── index.js
    ├── index.js
    ├── lib
    │   ├── index.js
    │   └── redis.js
    ├── model
    │   ├── game-player.model.js
    │   ├── game.model.js
    │   ├── index.js
    │   ├── sequelize.js
    │   └── user.model.js
    ├── service
    │   ├── auth
    │   │   └── index.js
    │   ├── game
    │   │   └── index.js
    │   ├── game-player
    │   │   └── index.js
    │   ├── index.js
    │   └── user
    │       └── index.js
    ├── socket
    │   ├── actions
    │   │   ├── game.action.js
    │   │   └── index.js
    │   ├── helper
    │   │   ├── get-next-player-turn.js
    │   │   ├── get-players.js
    │   │   ├── get-winner.js
    │   │   ├── index.js
    │   │   └── player-moved.js
    │   ├── index.js
    │   ├── mapper
    │   │   ├── create-game-player.mapper.js
    │   │   ├── create-game.mapper.js
    │   │   ├── game-details.mapper.js
    │   │   └── index.js
    │   └── middleware
    │       ├── authenticator.middleware.js
    │       ├── error-handler.middleware.js
    │       └── index.js
    └── utils
        ├── error.js
        ├── index.js
        ├── logger.js
        └── token.js

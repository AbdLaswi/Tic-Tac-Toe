# Tic-Tac-Toe

## **Pre-requirement**:
    - NodeJS 22.13
    - Redis
    - Docker
    - Postgresql

## **INITIALIZING AND RUNNING THE APPS**:

```bash 
    npm install
```

you can run the app by the Terminal or using debugger.

if you want to run the app using Terminal, use the following command:

**Locally:**

```bash 
    npm run start:dev
```

**On Production:**

```bash 
    npm run start
```
If you want to run the app using debugger, press F5.


## **Test The App:**

as this a realtime application, we need to clients to run at the same time and talks to the server, for that reason you will find a simulator folder that will simulate the user experience **without UI**, and inside each folder you will find 3 arrays 2 of them are commented out, and the default result of the game of the simulator now is **Draw**, you can change it up by uncommenting the winning for X or O and commenting the coordinates that gives a draw as result.

To start trying the app: 

run the server, then run the following commands to start the simulator:

```bash
    npm run start:firstClient
```

```bash
    npm run start:secClient
```

you need to run the second client first, as it is the one who will be invited to the game.
don't worry if you start the first client first, you will get "player is not online yet", but when the sec client is online you will have to restart the server as this simulator does not have UI to re-invoke the client when the player becomes online.


## **Features:**

The app supports the following events: 

- create game
- notify other players to join
- notify admin on other player's joining
- wait inside the room/lobby 'till the admin starts the game.
- allow the player to leave the lobby.
- game logic (make moves)
- close the room/lobby
- join the room/lobby
- store the games inside the database. 
- allow the player to see other player's accounts. 
- allow the player to see his games history, and check each move that has been made at the time.
- create an account, and login.

**About the App:**
- the app is using JWT for authentication.
- the app is using redis to store the game information(short-term), and the data is being cached for 10 mins(can be changed) renewed on every move.
- the app is using postgresql to store the game information(long-term), and user information.
- under logs folder, you will find two files to simulate the cloudwatch/Loggly works.
- the app is using both socket.io and ExpressJs to serve the player based on the business needs.


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

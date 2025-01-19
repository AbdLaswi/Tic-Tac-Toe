module.exports = function GamePlayer(sequelize, DataTypes) {
  const GamePlayer = sequelize.define(
    'gamePlayer',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      firstPlayerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'first_player_id'
      },
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'game_id'
      },
      secPlayerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'sec_player_id'
      }
    },
    {
      tableName: 'game_player',
      timestamps: false
    }
  );
  GamePlayer.associate = model => {
    GamePlayer.belongsTo(model.User, {
      foreignKey: 'firstPlayerId',
      targetKey: 'id'
    });
    GamePlayer.belongsTo(model.User, {
      foreignKey: 'secPlayerId',
      targetKey: 'id'
    });
    GamePlayer.belongsTo(model.Game, {
      foreignKey: 'gameId',
      targetKey: 'id'
    });
  };
  return GamePlayer;
};

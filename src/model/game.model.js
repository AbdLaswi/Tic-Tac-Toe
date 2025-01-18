module.exports = function Game(sequelize, DataTypes) {
  const Game = sequelize.define(
    'game',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'NEW',
        allowNull: false
      },
      creatorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'creator_id'
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'started_at'
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ended_at'
      },
      result: {
        type: DataTypes.JSON
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    },
    {
      tableName: 'game',
      paranoid: true
    }
  );
  Game.associate = model => {
    Game.belongsTo(model.User, {
      foreignKey: 'creatorId',
      targetKey: 'id'
    });
    Game.hasMany(model.GameHistory, {
      foreignKey: 'gameId',
      targetKey: 'id'
    });
    Game.hasMany(model.GamePlayer, {
      foreignKey: 'gameId',
      targetKey: 'id'
    });
  };
  return Game;
};

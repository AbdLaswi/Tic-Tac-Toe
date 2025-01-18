module.exports = function GameHistory(sequelize, DataTypes) {
  const GameHistory = sequelize.define(
    'gameHistory',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      result: {
        type: DataTypes.JSON,
        allowNull: false
      },
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'game_id'
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
      }
    },
    {
      tableName: 'game_history'
    }
  );
  GameHistory.associate = model => {
    GameHistory.belongsTo(model.Game, {
      foreignKey: 'gameId',
      targetKey: 'id'
    });
  };
  return GameHistory;
};

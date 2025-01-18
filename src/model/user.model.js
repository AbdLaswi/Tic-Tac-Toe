module.exports = function User(sequelize, DataTypes) {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
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
      tableName: 'user',
      paranoid: true
    }
  );
  User.associate = model => {
    User.hasMany(model.Game, {
      foreignKey: 'creatorId',
      targetKey: 'id'
    });
    User.hasMany(model.GamePlayer, {
      foreignKey: 'firstPlayerId',
      targetKey: 'id'
    });
    User.hasMany(model.GamePlayer, {
      foreignKey: 'secPlayerId',
      targetKey: 'id'
    });
  };
  return User;
};

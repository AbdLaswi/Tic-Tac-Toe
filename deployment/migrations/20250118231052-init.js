'use strict';

/** @type {import('sequelize-cli').Migration} */

async function createUserTable(queryInterface, Sequelize, transaction) {
  await queryInterface.createTable(
    'user',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'updated_at'
      }
    },
    { transaction }
  );
  await queryInterface.addIndex('user', ['id'], { transaction });
}

async function createGameTable(queryInterface, Sequelize, transaction) {
  await queryInterface.createTable(
    'game',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'NEW',
        allowNull: false
      },
      creatorId: {
        type: Sequelize.UUID,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'creator_id'
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'started_at'
      },
      endedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'ended_at'
      },
      result: {
        type: Sequelize.JSON,
        allowNull: true
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'updated_at'
      }
    },
    { transaction }
  );
  await queryInterface.addIndex('game', ['id'], { transaction });
}

async function createGamePlayerTable(queryInterface, Sequelize, transaction) {
  await queryInterface.createTable(
    'game_player',
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      firstPlayerId: {
        type: Sequelize.UUID,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'first_player_id'
      },
      secPlayerId: {
        type: Sequelize.UUID,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'sec_player_id'
      },
      gameId: {
        type: Sequelize.UUID,
        references: {
          model: 'game',
          key: 'id'
        },
        field: 'game_id',
        onDelete: 'CASCADE'
      }
    },
    { transaction }
  );
  await queryInterface.addIndex('game_player', ['id'], { transaction });
  await queryInterface.addIndex('game_player', ['gameId'], { transaction });
}
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await createUserTable(queryInterface, Sequelize, transaction);
      await createGameTable(queryInterface, Sequelize, transaction);
      await createGamePlayerTable(queryInterface, Sequelize, transaction);
      await transaction.commit();
    } catch (error) {
      console.log(JSON.stringify(error));
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('game_history', { transaction });
      await queryInterface.dropTable('game_player', { transaction });
      await queryInterface.dropTable('game', { transaction });
      await queryInterface.dropTable('user', { transaction });
      await transaction.commit();
    } catch (error) {
      console.log(JSON.stringify(error));
      await transaction.rollback();
      throw error;
    }
  }
};

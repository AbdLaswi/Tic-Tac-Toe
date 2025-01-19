const { User } = require('../../model');

async function getUser(id) {
  return User.findOne({
    where: {
      id
    },
    attributes: {
      exclude: ['password', 'deletedAt']
    },
    raw: true
  });
}

async function listUsers(options) {
  return User.findAndCountAll({
    ...options,
    attributes: {
      exclude: ['password', 'deletedAt', 'phone', 'updatedAt', 'deletedAt']
    }
  });
}

async function createUser(user) {
  return User.create(user);
}

module.exports = {
  createUser,
  listUsers,
  getUser
};

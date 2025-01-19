const { compare } = require('bcrypt');
const { User } = require('../../model');

async function login(email, password) {
  const user = await User.findOne({
    where: {
      email
    },
    row: true
  });
  const isPasswordCorrect = user && (await compare(password, user.password));
  return isPasswordCorrect ? user : false;
}

module.exports = {
  login
};

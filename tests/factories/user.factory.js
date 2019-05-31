const mongoose = require('mongoose')
const User = mongoose.model('User')

const createUser = async () => {
  return new User({
    googleId: ':)',
    displayName: 'test_user'
  }).save()
}

const deleteUser = async () => {
  return User.findOneAndRemove({ displayName : 'test_user' })
}

module.exports = {
  createUser,
  deleteUser
}
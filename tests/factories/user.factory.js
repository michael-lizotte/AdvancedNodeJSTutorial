const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = async () => {
  return new User({
    googleId: ':)',
    displayName: 'test_user'
  }).save()
}
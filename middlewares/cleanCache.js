const redis = require('../services/redis')

module.exports = async (req, res, next) => {
  await next() // Holy shit :\ ...

  redis.clearHash(req.user.id)
}
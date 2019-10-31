const redis = require('redis')
const util = require('util')

function Redis () {
  this.client = {}
}

Redis.prototype.connect = function ({ redisURI, redisPassword }) {
  this.client = redis.createClient({
    url: redisURI,
    password: redisPassword
  })
  const _set = this.client.set
  const _hset = this.client.hset

  this.client.set = function (key, value, callback) {
    return _set.apply(this, [key, value, 'EX', 60, callback])
  }

  this.client.hset = function (hashKey, key, value, callback) {
    return _hset.apply(this, [hashKey, key, value, 'EX', 60, callback])
  }

  this.client.get = util.promisify(this.client.get)
  this.client.hget = util.promisify(this.client.hget)
  this.client.set = util.promisify(this.client.set)
  this.client.hset = util.promisify(this.client.hset)
  this.client.del = util.promisify(this.client.del)
}

Redis.prototype.clearHash = function (hashKey) {
  return this.client.del(JSON.stringify(hashKey))
}

module.exports = new Redis()

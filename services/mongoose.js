const mongoose = require('mongoose')
const redis = require('./redis')

module.exports = function ({ mongoURI, redisURI, redisPassword }) {
  mongoose.Promise = global.Promise
  mongoose.connect(mongoURI, {
    useNewUrlParser: true
  })

  redis.connect({ redisURI, redisPassword })

  const client = redis.client
  const exec = mongoose.Query.prototype.exec

  mongoose.Query.prototype.cache = function (options = {}) {
    this._cache = true
    this.hashKey = JSON.stringify(options.key || '')

    return this
  }

  mongoose.Query.prototype.exec = async function () {
    if (!this._cache) {
      return exec.apply(this, arguments)
    }

    const key = JSON.stringify(Object.assign({}, {
      'collection': this.mongooseCollection.name
    }, this.getQuery()))

    const cache = await client.hget(this.hashKey, key)
    if (cache) {
      const doc = JSON.parse(cache)

      return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc)
    }

    const result = await exec.apply(this, arguments)
    await client.hset(this.hashKey, key, JSON.stringify(result))

    return result
  }
}

const pup = require('puppeteer')
const sessionBuilder = require('../factories/session.factory')
const userBuilder = require('../factories/user.factory')

class Page {
  static async build() {
    const browser = await pup.launch({
      headless: false
    })

    const page = await browser.newPage()
    const newPage = new Page(page, browser)

    return new Proxy(newPage, {
      get: function(target, property) {
        return newPage[property] || browser[property] || page[property]
      }
    })
  }

  async login() {
    const { session, sig } = sessionBuilder(await userBuilder.createUser())
    await this.page.setCookie({
      name: 'session',
      value: session
    })
    await this.page.setCookie({
      name: 'session.sig',
      value: sig
    })
    await this.page.goto('localhost:3000/blogs')
  }

  async logout() {
    await userBuilder.deleteUser()
  }

  async getContent(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }

  async close() {
    await this.logout()
    this.browser.close()
  }

  async get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(res => res.json())
    }, path)
  }

  async post(path, body) {
    return this.page.evaluate((_path, _body) => {
      return fetch(_path, {
        method: 'POST',
        credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(_body)
      }).then(res => res.json())
    }, path, body)
  }

  async execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data)
      })
    )
  }

  constructor(page, browser) {
    this.page = page
    this.browser = browser
  }
}

module.exports = Page
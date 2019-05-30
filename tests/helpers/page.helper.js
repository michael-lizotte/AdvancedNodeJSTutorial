const pup = require('puppeteer')
const sessionBuilder = require('../factories/session.factory')
const userBuilder = require('../factories/user.factory')

class Page {
  static async build() {
    const browser = await pup.launch({
      headless: false
    })

    const page = await browser.newPage()
    const newPage = new Page(page)

    return new Proxy(newPage, {
      get: function(target, property) {
        return newPage[property] || browser[property] || page[property]
      }
    })
  }

  async login() {
    const { session, sig } = sessionBuilder(await userBuilder())
    await this.page.setCookie({
      name: 'session',
      value: session
    })
    await this.page.setCookie({
      name: 'session.sig',
      value: sig
    })
    await this.page.goto('localhost:3000')
  }

  constructor(page) {
    this.page = page
  }
}

module.exports = Page
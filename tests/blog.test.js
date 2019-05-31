const Page = require('./helpers/page.helper')

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

describe('When a user is logged in', async () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a.btn-floating')
  })

  test('When clicking new blog, redirects to /blog/new', async () => {
    const label = await page.getContent('form label')
    expect(label).toEqual('Blog Title')
  })

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button')
    })

    test('The forms shows an error message', async () => {
      const titleError = await page.getContent('.title .red-text')
      const contentError = await page.getContent('.content .red-text')

      expect(titleError).toEqual('You must provide a value')
      expect(contentError).toEqual('You must provide a value')
    })
  })

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My title')
      await page.type('.content input', 'My content')

      await page.click('form button')
    })

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContent('form h5')
      expect(text).toEqual('Please confirm your entries')
    })

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green')
      await page.waitFor('.card') // Wait for the page to load

      const title = await page.getContent('.card-title')
      const content = await page.getContent('p')

      expect(title).toEqual('My title')
      expect(content).toEqual('My content')
    })
  })
})

describe('When a user is not logged in', async () => {
  test('He cannot create a new blog', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({title:'My title', content:'My content'})
      }).then(res => res.json())
    })
    
    expect(result).toEqual({ error : 'You must log in!' })
  })

  test('He cannot retreive a blog', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(res => res.json())
    })
    
    expect(result).toEqual({ error : 'You must log in!' })
  })
})


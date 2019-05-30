const Page = require('./helpers/page.helper')

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

test('Header has the correct text', async () => {  
  const text = await page.$eval('a.brand-logo', el => el.innerHTML)
  expect(text).toEqual('Blogster')
})

test('Clicking on login starts the OAuth flow', async () => {
  await page.click('.right a')
  const url = await page.url()
  
  expect(url).toMatch(/https:\/\/accounts\.google\.com/)
})

test('When signed in, shows logout button', async () => {
  await page.login()

  await page.waitFor('a[href="/auth/logout"]')
  const result = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

  expect(result).toEqual('Logout')
})
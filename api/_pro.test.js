import { describe, it, expect } from 'vitest'
import { parseProEmails, proUser } from './_pro.js'
import { describeImage } from './_describeImage.js'

function fakeRes() {
  const res = { statusCode: 0, body: null, headers: {} }
  res.status = code => { res.statusCode = code; return res }
  res.json = body => { res.body = body; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

describe('parseProEmails', () => {
  it('splits, trims and lower-cases', () => {
    expect([...parseProEmails(' A@x.com, b@Y.com ,,')]).toEqual(['a@x.com', 'b@y.com'])
  })
  it('is empty when unset', () => {
    expect(parseProEmails(undefined).size).toBe(0)
  })
})

describe('Pro gate', () => {
  it('has no Pro user without a Bearer token', async () => {
    expect(await proUser({ headers: {} })).toBeNull()
    expect(await proUser({ headers: { authorization: 'Basic abc' } })).toBeNull()
  })

  it('refuses Describe It to signed-out users before any paid call', async () => {
    const res = fakeRes()
    await describeImage({ method: 'POST', headers: {}, body: { imageUrl: 'https://upload.wikimedia.org/x.jpg' } }, res)
    expect(res.statusCode).toBe(403)
  })
})

import { describe, expect, it } from 'vitest'
import { dataURItoByteString, isDataURI } from './utils'

describe.each([
  { input: 'potato', expectedResult: false },
  { input: 'data:,Hello%2C%20world%21', expectedResult: true },
  { input: 'data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==', expectedResult: true },
])('isDataURI()', ({ input, expectedResult }) => {
  it(`returns ${expectedResult} given ${input}`, () => {
    const result = isDataURI(input)

    expect(result).toBe(expectedResult)
  })
})

describe('dataURItoByteString()', () => {
  it('throws given invalid data URI', () => {
    expect(() => dataURItoByteString('potato')).toThrow()
  })

  it('returns a byte string given plain text data URI', () => {
    const result = dataURItoByteString('data:,Hello%2C%20world%21')

    expect(result).toBe('Hello, world!')
  })

  it('returns a byte string given base64 data URI', () => {
    const result = dataURItoByteString('data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==')

    expect(result).toBe('Hello, world!')
  })

  it('returns a byte string given base64 PDF data URI', () => {
    const result = dataURItoByteString(
      'data:application/pdf;base64,JVBERi0xLg10cmFpbGVyPDwvUm9vdDw8L1BhZ2VzPDwvS2lkc1s8PC9NZWRpYUJveFswIDAgMyAzXT4+XT4+Pj4+Pg==',
    )

    expect(result).toBe('%PDF-1.\rtrailer<</Root<</Pages<</Kids[<</MediaBox[0 0 3 3]>>]>>>>>>')
  })

  it('returns a byte string given base64 PDF data URI with filename', () => {
    const result = dataURItoByteString(
      'data:application/pdf;filename=generated.pdf;base64,JVBERi0xLg10cmFpbGVyPDwvUm9vdDw8L1BhZ2VzPDwvS2lkc1s8PC9NZWRpYUJveFswIDAgMyAzXT4+XT4+Pj4+Pg==',
    )

    expect(result).toBe('%PDF-1.\rtrailer<</Root<</Pages<</Kids[<</MediaBox[0 0 3 3]>>]>>>>>>')
  })
})

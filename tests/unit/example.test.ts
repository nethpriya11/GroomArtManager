import { describe, it, expect } from 'vitest'

/**
 * Example unit test
 * This is a placeholder test to verify Vitest setup
 */
describe('Example Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(true).toBe(true)
  })

  it('should perform simple arithmetic', () => {
    const result = 2 + 2
    expect(result).toBe(4)
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })
})

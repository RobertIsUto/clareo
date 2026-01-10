import { describe, it, expect } from 'vitest'
import {
  excludeQuotedText,
  calculateMSTTR,
  getWordCount,
  formatNumber,
  formatRange,
  formatWithConfidence,
  getSignificanceLabel,
  getZScoreColorClass,
  truncateText,
  calculatePercentageChange,
  createSmartRegex
} from './textHelpers'

describe('excludeQuotedText', () => {
  it('removes double-quoted content', () => {
    const result = excludeQuotedText('He said "hello world" today')
    expect(result).toBe('He said   today')
  })

  it('normalizes curly double quotes before removal', () => {
    const result = excludeQuotedText('She said \u201Chi\u201D there')
    expect(result).toBe('She said   there')
  })

  it('normalizes curly single quotes', () => {
    const result = excludeQuotedText('It\u2019s a test')
    expect(result).toBe("It's a test")
  })

  it('handles empty input', () => {
    expect(excludeQuotedText('')).toBe('')
    expect(excludeQuotedText(null)).toBe('')
    expect(excludeQuotedText(undefined)).toBe('')
  })

  it('handles multiple quoted sections', () => {
    const result = excludeQuotedText('He said "hello" and "goodbye"')
    expect(result).toBe('He said   and  ')
  })

  it('preserves contractions (single quotes)', () => {
    const result = excludeQuotedText("He said don't worry")
    expect(result).toBe("He said don't worry")
  })

  it('removes single-quoted quotations', () => {
    const result = excludeQuotedText("He said 'hello world' today")
    expect(result).toBe('He said   today')
  })

  it('preserves possessives with single quotes', () => {
    const result = excludeQuotedText("John's book is here")
    expect(result).toBe("John's book is here")
  })

  it('handles text without quotes', () => {
    const result = excludeQuotedText('No quotes here')
    expect(result).toBe('No quotes here')
  })
})

describe('calculateMSTTR', () => {
  it('returns simple TTR for text shorter than segment size', () => {
    const shortText = 'the quick brown fox'
    const result = calculateMSTTR(shortText, 50)
    expect(result).toBe(1.0) // 4 unique / 4 total
  })

  it('returns lower TTR for repetitive text', () => {
    const repetitive = 'the the the the'
    const result = calculateMSTTR(repetitive, 50)
    expect(result).toBe(0.25) // 1 unique / 4 total
  })

  it('handles empty text', () => {
    expect(calculateMSTTR('')).toBe(0)
  })

  it('calculates mean TTR across segments for long text', () => {
    // Create text with 100+ words
    const words = Array(100).fill('word').map((w, i) => i % 10 === 0 ? 'unique' + i : w)
    const text = words.join(' ')
    const result = calculateMSTTR(text, 50)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(1)
  })
})

describe('getWordCount', () => {
  it('counts words correctly', () => {
    expect(getWordCount('one two three')).toBe(3)
  })

  it('handles contractions as single words', () => {
    expect(getWordCount("don't can't won't")).toBe(3)
  })

  it('handles empty string', () => {
    expect(getWordCount('')).toBe(0)
  })

  it('ignores punctuation', () => {
    expect(getWordCount('Hello, world!')).toBe(2)
  })

  it('handles multiple spaces', () => {
    expect(getWordCount('one   two   three')).toBe(3)
  })
})

describe('formatNumber', () => {
  it('formats number with default 1 decimal', () => {
    expect(formatNumber(3.14159)).toBe('3.1')
  })

  it('formats number with specified decimals', () => {
    expect(formatNumber(3.14159, 2)).toBe('3.14')
  })

  it('adds suffix when provided', () => {
    expect(formatNumber(50, 0, '%')).toBe('50%')
  })

  it('handles integers', () => {
    expect(formatNumber(5, 1)).toBe('5.0')
  })
})

describe('formatRange', () => {
  it('formats range correctly', () => {
    expect(formatRange(5.2, 8.7, 1)).toBe('5.2-8.7')
  })

  it('adds suffix when provided', () => {
    expect(formatRange(10, 20, 0, '%')).toBe('10-20%')
  })
})

describe('formatWithConfidence', () => {
  it('formats mean with stdDev', () => {
    expect(formatWithConfidence(50, 5, 0)).toBe('50 (\u00b15)')
  })

  it('adds suffix when provided', () => {
    expect(formatWithConfidence(50, 5, 0, '%')).toBe('50% (\u00b15%)')
  })
})

describe('getSignificanceLabel', () => {
  it('returns ALERT for z-score >= 2.0', () => {
    expect(getSignificanceLabel(2.0)).toBe('ALERT')
    expect(getSignificanceLabel(2.5)).toBe('ALERT')
    expect(getSignificanceLabel(-2.5)).toBe('ALERT')
  })

  it('returns WARNING for z-score >= 1.5', () => {
    expect(getSignificanceLabel(1.5)).toBe('WARNING')
    expect(getSignificanceLabel(1.9)).toBe('WARNING')
  })

  it('returns NOTICE for z-score >= 1.0', () => {
    expect(getSignificanceLabel(1.0)).toBe('NOTICE')
    expect(getSignificanceLabel(1.4)).toBe('NOTICE')
  })

  it('returns OK for z-score < 1.0', () => {
    expect(getSignificanceLabel(0.5)).toBe('OK')
    expect(getSignificanceLabel(0)).toBe('OK')
  })
})

describe('getZScoreColorClass', () => {
  it('returns deviation-high for z-score >= 2.0', () => {
    expect(getZScoreColorClass(2.0)).toBe('deviation-high')
    expect(getZScoreColorClass(-2.5)).toBe('deviation-high')
  })

  it('returns deviation-medium for z-score >= 1.0', () => {
    expect(getZScoreColorClass(1.0)).toBe('deviation-medium')
    expect(getZScoreColorClass(1.9)).toBe('deviation-medium')
  })

  it('returns deviation-normal for z-score < 1.0', () => {
    expect(getZScoreColorClass(0.5)).toBe('deviation-normal')
  })
})

describe('truncateText', () => {
  it('does not truncate short text', () => {
    expect(truncateText('short', 10)).toBe('short')
  })

  it('truncates long text with ellipsis', () => {
    expect(truncateText('this is a long text', 10)).toBe('this is a ...')
  })

  it('handles null/undefined', () => {
    expect(truncateText(null)).toBe('')
    expect(truncateText(undefined)).toBe('')
  })
})

describe('calculatePercentageChange', () => {
  it('calculates increase correctly', () => {
    expect(calculatePercentageChange(100, 150)).toBe(50)
  })

  it('calculates decrease correctly', () => {
    expect(calculatePercentageChange(100, 50)).toBe(-50)
  })

  it('handles zero old value', () => {
    expect(calculatePercentageChange(0, 50)).toBe(100)
    expect(calculatePercentageChange(0, 0)).toBe(0)
  })
})

describe('createSmartRegex', () => {
  it('creates regex for single word with variants', () => {
    const regex = createSmartRegex('test')
    expect('testing').toMatch(regex)
    expect('tested').toMatch(regex)
    expect('tests').toMatch(regex)
  })

  it('creates exact match regex for multi-word phrases', () => {
    const regex = createSmartRegex('in order to')
    expect('in order to').toMatch(regex)
    expect('in order').not.toMatch(regex)
  })

  it('is case insensitive', () => {
    const regex = createSmartRegex('Test')
    expect('test').toMatch(regex)
    expect('TEST').toMatch(regex)
  })
})

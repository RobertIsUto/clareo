import { describe, it, expect } from 'vitest'
import {
  calculateMean,
  calculateMedian,
  calculateStdDev,
  calculateZScore,
  calculatePercentile,
  detectOutliers,
  calculateConfidenceInterval,
  isStatisticallySignificant,
  normalizeScore,
  calculateWeightedAverage,
  calculateRange,
  calculateMetricStatistics
} from './statisticalAnalysis'

describe('calculateMean', () => {
  it('calculates mean of number array', () => {
    expect(calculateMean([1, 2, 3, 4, 5])).toBe(3)
  })

  it('handles decimal values', () => {
    expect(calculateMean([1.5, 2.5, 3.5])).toBeCloseTo(2.5)
  })

  it('handles empty array', () => {
    expect(calculateMean([])).toBe(0)
  })

  it('handles null/undefined', () => {
    expect(calculateMean(null)).toBe(0)
    expect(calculateMean(undefined)).toBe(0)
  })

  it('handles single value', () => {
    expect(calculateMean([5])).toBe(5)
  })

  it('handles string numbers', () => {
    expect(calculateMean(['1', '2', '3'])).toBe(2)
  })
})

describe('calculateMedian', () => {
  it('finds median of odd-length array', () => {
    expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3)
  })

  it('finds median of even-length array', () => {
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5)
  })

  it('handles unsorted array', () => {
    expect(calculateMedian([5, 1, 3, 2, 4])).toBe(3)
  })

  it('handles empty array', () => {
    expect(calculateMedian([])).toBe(0)
  })

  it('handles single value', () => {
    expect(calculateMedian([42])).toBe(42)
  })
})

describe('calculateStdDev', () => {
  it('calculates standard deviation', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9]
    const result = calculateStdDev(values)
    expect(result).toBeCloseTo(2, 0)
  })

  it('returns 0 for uniform values', () => {
    expect(calculateStdDev([5, 5, 5, 5])).toBe(0)
  })

  it('returns 0 for single value', () => {
    expect(calculateStdDev([5])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(calculateStdDev([])).toBe(0)
  })

  it('uses pre-calculated mean if provided', () => {
    const values = [1, 2, 3]
    const mean = 2
    const result = calculateStdDev(values, mean)
    expect(result).toBeCloseTo(0.816, 2)
  })
})

describe('calculateZScore', () => {
  it('calculates z-score correctly', () => {
    expect(calculateZScore(75, 50, 10)).toBe(2.5)
  })

  it('handles negative z-scores', () => {
    expect(calculateZScore(25, 50, 10)).toBe(-2.5)
  })

  it('returns 0 when stdDev is 0', () => {
    expect(calculateZScore(75, 50, 0)).toBe(0)
  })

  it('handles string values', () => {
    expect(calculateZScore('75', 50, 10)).toBe(2.5)
  })
})

describe('calculatePercentile', () => {
  it('calculates percentile correctly', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(calculatePercentile(5, values)).toBe(40)
  })

  it('returns 0 for minimum value', () => {
    expect(calculatePercentile(1, [1, 2, 3, 4, 5])).toBe(0)
  })

  it('returns high percentile for maximum value', () => {
    expect(calculatePercentile(5, [1, 2, 3, 4, 5])).toBe(80)
  })

  it('returns 50 for empty array', () => {
    expect(calculatePercentile(5, [])).toBe(50)
  })
})

describe('detectOutliers', () => {
  it('detects outliers using IQR method', () => {
    const samples = [
      { id: '1', value: 10 },
      { id: '2', value: 12 },
      { id: '3', value: 11 },
      { id: '4', value: 13 },
      { id: '5', value: 100 } // Outlier
    ]
    const outliers = detectOutliers(samples, 'iqr')
    expect(outliers).toContain('5')
  })

  it('detects outliers using z-score method', () => {
    const samples = [
      { id: '1', value: 10 },
      { id: '2', value: 11 },
      { id: '3', value: 12 },
      { id: '4', value: 11 },
      { id: '5', value: 50 } // Outlier
    ]
    const outliers = detectOutliers(samples, 'zscore')
    expect(outliers).toContain('5')
  })

  it('returns empty array for small sample size', () => {
    const samples = [
      { id: '1', value: 10 },
      { id: '2', value: 100 }
    ]
    expect(detectOutliers(samples)).toEqual([])
  })

  it('returns empty array for uniform values', () => {
    const samples = [
      { id: '1', value: 10 },
      { id: '2', value: 10 },
      { id: '3', value: 10 },
      { id: '4', value: 10 },
      { id: '5', value: 10 }
    ]
    expect(detectOutliers(samples)).toEqual([])
  })
})

describe('calculateConfidenceInterval', () => {
  it('calculates 95% confidence interval', () => {
    const result = calculateConfidenceInterval(100, 15, 30, 0.95)
    expect(result.lower).toBeLessThan(100)
    expect(result.upper).toBeGreaterThan(100)
    expect(result.margin).toBeGreaterThan(0)
  })

  it('returns mean for single sample', () => {
    const result = calculateConfidenceInterval(100, 15, 1)
    expect(result.lower).toBe(100)
    expect(result.upper).toBe(100)
    expect(result.margin).toBe(0)
  })

  it('narrows with larger sample size', () => {
    const small = calculateConfidenceInterval(100, 15, 10)
    const large = calculateConfidenceInterval(100, 15, 100)
    expect(large.margin).toBeLessThan(small.margin)
  })
})

describe('isStatisticallySignificant', () => {
  it('identifies high significance', () => {
    const result = isStatisticallySignificant(30, 10)
    expect(result.significant).toBe(true)
    expect(result.level).toBe('high')
  })

  it('identifies medium significance', () => {
    const result = isStatisticallySignificant(17, 10)
    expect(result.significant).toBe(true)
    expect(result.level).toBe('medium')
  })

  it('identifies low significance', () => {
    const result = isStatisticallySignificant(12, 10)
    expect(result.significant).toBe(false)
    expect(result.level).toBe('low')
  })

  it('identifies no significance', () => {
    const result = isStatisticallySignificant(5, 10)
    expect(result.significant).toBe(false)
    expect(result.level).toBe('none')
  })

  it('handles zero stdDev', () => {
    const result = isStatisticallySignificant(5, 0)
    expect(result.zScore).toBe(0)
    expect(result.significant).toBe(true)
  })
})

describe('normalizeScore', () => {
  it('normalizes to 0-100 scale', () => {
    expect(normalizeScore(50, 0, 100)).toBe(50)
    expect(normalizeScore(0, 0, 100)).toBe(0)
    expect(normalizeScore(100, 0, 100)).toBe(100)
  })

  it('handles custom ranges', () => {
    expect(normalizeScore(15, 10, 20)).toBe(50)
  })

  it('clamps values outside range', () => {
    expect(normalizeScore(-10, 0, 100)).toBe(0)
    expect(normalizeScore(150, 0, 100)).toBe(100)
  })

  it('returns 50 when min equals max', () => {
    expect(normalizeScore(50, 50, 50)).toBe(50)
  })
})

describe('calculateWeightedAverage', () => {
  it('calculates weighted average', () => {
    const values = [10, 20, 30]
    const weights = [1, 2, 1]
    expect(calculateWeightedAverage(values, weights)).toBe(20)
  })

  it('normalizes weights if they do not sum to 1', () => {
    const values = [10, 20]
    const weights = [2, 2]
    expect(calculateWeightedAverage(values, weights)).toBe(15)
  })

  it('returns 0 for empty arrays', () => {
    expect(calculateWeightedAverage([], [])).toBe(0)
  })

  it('returns 0 for mismatched lengths', () => {
    expect(calculateWeightedAverage([1, 2], [1])).toBe(0)
  })

  it('falls back to mean if weights sum to 0', () => {
    const values = [10, 20, 30]
    const weights = [0, 0, 0]
    expect(calculateWeightedAverage(values, weights)).toBe(20)
  })
})

describe('calculateRange', () => {
  it('finds min and max', () => {
    const result = calculateRange([5, 2, 8, 1, 9])
    expect(result.min).toBe(1)
    expect(result.max).toBe(9)
  })

  it('handles single value', () => {
    const result = calculateRange([5])
    expect(result.min).toBe(5)
    expect(result.max).toBe(5)
  })

  it('handles empty array', () => {
    const result = calculateRange([])
    expect(result.min).toBe(0)
    expect(result.max).toBe(0)
  })
})

describe('calculateMetricStatistics', () => {
  it('calculates comprehensive statistics', () => {
    const values = [1, 2, 3, 4, 5]
    const result = calculateMetricStatistics(values)

    expect(result.mean).toBe(3)
    expect(result.median).toBe(3)
    expect(result.min).toBe(1)
    expect(result.max).toBe(5)
    expect(result.stdDev).toBeCloseTo(1.414, 2)
    expect(result.values).toHaveLength(5)
  })

  it('handles empty array', () => {
    const result = calculateMetricStatistics([])
    expect(result.mean).toBe(0)
    expect(result.median).toBe(0)
    expect(result.stdDev).toBe(0)
    expect(result.values).toHaveLength(0)
  })

  it('converts string values to numbers', () => {
    const result = calculateMetricStatistics(['1', '2', '3'])
    expect(result.mean).toBe(2)
    expect(result.values).toEqual([1, 2, 3])
  })
})

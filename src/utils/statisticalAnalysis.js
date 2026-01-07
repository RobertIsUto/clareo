/**
 * Statistical Analysis Utilities
 * Core statistical functions for baseline profile building and comparison analysis
 */

/**
 * Calculate the arithmetic mean of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number} Mean value
 */
export function calculateMean(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + parseFloat(val), 0);
  return sum / values.length;
}

/**
 * Calculate the median of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number} Median value
 */
export function calculateMedian(values) {
  if (!values || values.length === 0) return 0;

  const sorted = [...values].map(v => parseFloat(v)).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate the standard deviation of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @param {number} mean - Pre-calculated mean (optional, will calculate if not provided)
 * @returns {number} Standard deviation
 */
export function calculateStdDev(values, mean = null) {
  if (!values || values.length === 0) return 0;
  if (values.length === 1) return 0;

  const avg = mean !== null ? mean : calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(parseFloat(val) - avg, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calculate the z-score for a value relative to a distribution
 * @param {number} value - The value to calculate z-score for
 * @param {number} mean - Distribution mean
 * @param {number} stdDev - Distribution standard deviation
 * @returns {number} Z-score
 */
export function calculateZScore(value, mean, stdDev) {
  if (stdDev === 0) return 0;
  return (parseFloat(value) - mean) / stdDev;
}

/**
 * Calculate the percentile rank of a value within an array
 * @param {number} value - The value to rank
 * @param {number[]} values - Array of values to compare against
 * @returns {number} Percentile (0-100)
 */
export function calculatePercentile(value, values) {
  if (!values || values.length === 0) return 50;

  const sorted = [...values].map(v => parseFloat(v)).sort((a, b) => a - b);
  const val = parseFloat(value);
  const countBelow = sorted.filter(v => v < val).length;

  return (countBelow / sorted.length) * 100;
}

/**
 * Detect outliers in a dataset using IQR or Z-score method
 * @param {Array<{id: string, value: number}>} samples - Array of samples with id and value
 * @param {string} method - 'iqr' or 'zscore' (default: 'iqr')
 * @returns {Array<string>} Array of outlier IDs
 */
export function detectOutliers(samples, method = 'iqr') {
  if (!samples || samples.length < 4) return [];

  const values = samples.map(s => parseFloat(s.value));
  const outlierIds = [];

  if (method === 'zscore') {
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values, mean);

    samples.forEach((sample, idx) => {
      const zScore = Math.abs(calculateZScore(values[idx], mean, stdDev));
      if (zScore > 2.5) {
        outlierIds.push(sample.id);
      }
    });
  } else {
    const sorted = [...values].sort((a, b) => a - b);
    const q1Idx = Math.floor(sorted.length * 0.25);
    const q3Idx = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Idx];
    const q3 = sorted[q3Idx];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    samples.forEach((sample, idx) => {
      if (values[idx] < lowerBound || values[idx] > upperBound) {
        outlierIds.push(sample.id);
      }
    });
  }

  return outlierIds;
}

/**
 * Calculate confidence interval for a mean
 * @param {number} mean - Sample mean
 * @param {number} stdDev - Sample standard deviation
 * @param {number} sampleSize - Number of samples
 * @param {number} confidence - Confidence level (default: 0.95)
 * @returns {{lower: number, upper: number, margin: number}} Confidence interval
 */
export function calculateConfidenceInterval(mean, stdDev, sampleSize, confidence = 0.95) {
  if (sampleSize < 2) {
    return { lower: mean, upper: mean, margin: 0 };
  }

  const zScores = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };

  const zScore = zScores[confidence] || 1.96;
  const standardError = stdDev / Math.sqrt(sampleSize);
  const margin = zScore * standardError;

  return {
    lower: mean - margin,
    upper: mean + margin,
    margin: margin
  };
}

/**
 * Determine if a difference is statistically significant
 * @param {number} diff - Difference value
 * @param {number} baselineStdDev - Baseline standard deviation
 * @param {number} threshold - Z-score threshold (default: 1.5)
 * @returns {{significant: boolean, level: string, zScore: number}} Significance info
 */
export function isStatisticallySignificant(diff, baselineStdDev, threshold = 1.5) {
  if (baselineStdDev === 0) {
    return {
      significant: Math.abs(diff) > 0,
      level: Math.abs(diff) > 0 ? 'high' : 'none',
      zScore: 0
    };
  }

  const zScore = Math.abs(diff / baselineStdDev);

  let level = 'none';
  let significant = false;

  if (zScore >= 2.0) {
    level = 'high';
    significant = true;
  } else if (zScore >= threshold) {
    level = 'medium';
    significant = true;
  } else if (zScore >= 1.0) {
    level = 'low';
    significant = false;
  }

  return { significant, level, zScore };
}

/**
 * Normalize a value to a 0-100 scale
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum value of range
 * @param {number} max - Maximum value of range
 * @returns {number} Normalized value (0-100)
 */
export function normalizeScore(value, min, max) {
  if (max === min) return 50;
  const normalized = ((parseFloat(value) - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Calculate weighted average
 * @param {number[]} values - Array of values
 * @param {number[]} weights - Array of weights (must sum to 1 or will be normalized)
 * @returns {number} Weighted average
 */
export function calculateWeightedAverage(values, weights) {
  if (!values || !weights || values.length !== weights.length) return 0;
  if (values.length === 0) return 0;

  const weightSum = weights.reduce((acc, w) => acc + w, 0);

  if (weightSum === 0) return calculateMean(values);

  const normalizedWeights = weights.map(w => w / weightSum);

  const weightedSum = values.reduce((acc, val, idx) => {
    return acc + (parseFloat(val) * normalizedWeights[idx]);
  }, 0);

  return weightedSum;
}

/**
 * Calculate min and max from array of values
 * @param {number[]} values - Array of numeric values
 * @returns {{min: number, max: number}} Min and max values
 */
export function calculateRange(values) {
  if (!values || values.length === 0) return { min: 0, max: 0 };

  const numericValues = values.map(v => parseFloat(v));
  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues)
  };
}

/**
 * Calculate comprehensive statistics for a metric
 * @param {number[]} values - Array of values for a specific metric
 * @returns {Object} Statistical summary
 */
export function calculateMetricStatistics(values) {
  if (!values || values.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      values: []
    };
  }

  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const stdDev = calculateStdDev(values, mean);
  const { min, max } = calculateRange(values);

  return {
    mean,
    median,
    stdDev,
    min,
    max,
    values: values.map(v => parseFloat(v))
  };
}

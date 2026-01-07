/**
 * Error Detection Module
 * Detects common writing errors and patterns for consistency analysis
 */

import {
  COMMON_ERROR_PATTERNS,
  STYLE_PATTERNS,
  PUNCTUATION_ERRORS,
  ERROR_SEVERITY_WEIGHTS
} from '../constants/errorPatterns.js';

/**
 * Detect error patterns in text
 * @param {string} text - Text to analyze
 * @returns {Object} Error detection results
 */
export function detectErrorPatterns(text) {
  if (!text || text.trim().length === 0) {
    return {
      errors: [],
      totalErrorScore: 0,
      cleanlinessScore: 100,
      errorsByType: {},
      errorRate: 0
    };
  }

  const wordCount = (text.match(/\b\w+\b/g) || []).length;
  const errors = [];
  const errorsByType = {};

  COMMON_ERROR_PATTERNS.forEach(errorPattern => {
    const matches = text.match(errorPattern.pattern);
    if (matches && matches.length > 0) {
      const examples = matches.slice(0, 3);

      errors.push({
        id: errorPattern.id,
        type: errorPattern.type,
        severity: errorPattern.severity,
        count: matches.length,
        description: errorPattern.description,
        examples
      });

      if (!errorsByType[errorPattern.type]) {
        errorsByType[errorPattern.type] = [];
      }
      errorsByType[errorPattern.type].push({
        id: errorPattern.id,
        count: matches.length,
        severity: errorPattern.severity
      });
    }
  });

  PUNCTUATION_ERRORS.forEach(errorPattern => {
    const matches = text.match(errorPattern.pattern);
    if (matches && matches.length > 0) {
      const examples = matches.slice(0, 3);

      errors.push({
        id: errorPattern.id,
        type: errorPattern.type,
        severity: errorPattern.severity,
        count: matches.length,
        description: errorPattern.description,
        examples
      });

      if (!errorsByType[errorPattern.type]) {
        errorsByType[errorPattern.type] = [];
      }
      errorsByType[errorPattern.type].push({
        id: errorPattern.id,
        count: matches.length,
        severity: errorPattern.severity
      });
    }
  });

  const totalErrorScore = errors.reduce((sum, error) => {
    const weight = ERROR_SEVERITY_WEIGHTS[error.severity] || 1.0;
    return sum + (error.count * weight);
  }, 0);

  const errorRate = wordCount > 0 ? (totalErrorScore / wordCount) * 100 : 0;

  const cleanlinessScore = Math.max(0, Math.min(100, 100 - (errorRate * 10)));

  return {
    errors: errors.sort((a, b) => {
      const weightA = ERROR_SEVERITY_WEIGHTS[a.severity] || 1.0;
      const weightB = ERROR_SEVERITY_WEIGHTS[b.severity] || 1.0;
      return (b.count * weightB) - (a.count * weightA);
    }),
    totalErrorScore,
    cleanlinessScore,
    errorsByType,
    errorRate
  };
}

/**
 * Analyze style patterns in text (not errors, but style characteristics)
 * @param {string} text - Text to analyze
 * @returns {Object} Style pattern analysis
 */
export function analyzeStylePatterns(text) {
  if (!text || text.trim().length === 0) {
    return {
      contractionCount: 0,
      firstPersonCount: 0,
      secondPersonCount: 0,
      colloquialCount: 0,
      formalityScore: 100
    };
  }

  const wordCount = (text.match(/\b\w+\b/g) || []).length;
  const patterns = {};

  Object.entries(STYLE_PATTERNS).forEach(([key, { pattern }]) => {
    const matches = text.match(pattern) || [];
    patterns[key] = matches.length;
  });

  const informalityScore = (
    patterns.contractions * 0.5 +
    patterns.colloquial * 2.0 +
    patterns.firstPerson * 0.3 +
    patterns.secondPerson * 0.4
  ) / wordCount * 100;

  const formalityScore = Math.max(0, Math.min(100, 100 - informalityScore));

  return {
    contractionCount: patterns.contractions || 0,
    firstPersonCount: patterns.firstPerson || 0,
    secondPersonCount: patterns.secondPerson || 0,
    colloquialCount: patterns.colloquial || 0,
    formalityScore
  };
}

/**
 * Build error profile from multiple baseline texts
 * @param {string[]} texts - Array of baseline texts
 * @returns {Object} Aggregated error profile
 */
export function buildErrorProfile(texts) {
  if (!texts || texts.length === 0) {
    return {
      commonPatterns: [],
      avgErrorRate: 0,
      avgCleanlinessScore: 100,
      consistentErrors: []
    };
  }

  const analyses = texts.map(text => detectErrorPatterns(text));

  const allErrors = {};
  let totalErrorRate = 0;
  let totalCleanlinessScore = 0;

  analyses.forEach(analysis => {
    totalErrorRate += analysis.errorRate;
    totalCleanlinessScore += analysis.cleanlinessScore;

    analysis.errors.forEach(error => {
      if (!allErrors[error.id]) {
        allErrors[error.id] = {
          id: error.id,
          type: error.type,
          severity: error.severity,
          description: error.description,
          occurrences: 0,
          samplesWithError: 0
        };
      }
      allErrors[error.id].occurrences += error.count;
      allErrors[error.id].samplesWithError++;
    });
  });

  const avgErrorRate = totalErrorRate / texts.length;
  const avgCleanlinessScore = totalCleanlinessScore / texts.length;

  const commonPatterns = Object.values(allErrors)
    .filter(error => error.samplesWithError >= Math.ceil(texts.length * 0.5))
    .sort((a, b) => b.samplesWithError - a.samplesWithError);

  const consistentErrors = Object.values(allErrors)
    .filter(error => error.samplesWithError >= Math.ceil(texts.length * 0.7))
    .map(error => error.id);

  return {
    commonPatterns,
    avgErrorRate,
    avgCleanlinessScore,
    consistentErrors
  };
}

/**
 * Compare error profiles between baseline and current text
 * @param {Object} baseline - Baseline error profile
 * @param {Object} current - Current text error analysis
 * @returns {Object} Comparison results
 */
export function compareErrorProfiles(baseline, current) {
  if (!baseline || !current) {
    return {
      errorReduction: 0,
      suspiciouslyClean: false,
      missingConsistentErrors: [],
      newErrors: [],
      cleanlinessChange: 0,
      confidenceNote: ''
    };
  }

  const errorReduction = baseline.avgErrorRate - current.errorRate;
  const errorReductionPercent = baseline.avgErrorRate > 0
    ? (errorReduction / baseline.avgErrorRate) * 100
    : 0;

  const currentErrorIds = new Set(current.errors.map(e => e.id));

  const missingConsistentErrors = baseline.consistentErrors.filter(
    errorId => !currentErrorIds.has(errorId)
  );

  const newErrors = current.errors
    .filter(error => {
      const isConsistent = baseline.consistentErrors.includes(error.id);
      const isCommon = baseline.commonPatterns.some(p => p.id === error.id);
      return !isConsistent && !isCommon;
    })
    .map(error => ({
      id: error.id,
      type: error.type,
      count: error.count,
      description: error.description
    }));

  const cleanlinessChange = current.cleanlinessScore - baseline.avgCleanlinessScore;

  const suspiciouslyClean = (
    current.cleanlinessScore > 90 &&
    baseline.avgCleanlinessScore < 75 &&
    missingConsistentErrors.length > 0
  );

  let confidenceNote = '';
  if (suspiciouslyClean) {
    confidenceNote = 'Text is unusually clean compared to baseline. ' +
      `${missingConsistentErrors.length} consistent error pattern(s) are missing.`;
  } else if (errorReductionPercent > 50 && baseline.avgErrorRate > 2) {
    confidenceNote = 'Significant error reduction detected. This could indicate improvement or assistance.';
  } else if (errorReductionPercent < -50) {
    confidenceNote = 'Error rate has increased significantly compared to baseline.';
  } else if (Math.abs(cleanlinessChange) < 5) {
    confidenceNote = 'Error patterns are consistent with baseline.';
  }

  return {
    errorReduction: errorReductionPercent,
    suspiciouslyClean,
    missingConsistentErrors,
    newErrors,
    cleanlinessChange,
    confidenceNote
  };
}

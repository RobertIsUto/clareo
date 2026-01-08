/**
 * Syntactic Analysis Module
 * Analyzes sentence structure patterns and writing style
 */

import {
  SENTENCE_OPENINGS,
  CLAUSE_MARKERS,
  PUNCTUATION_PATTERNS
} from '../constants/syntacticPatterns.js';

const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;

/**
 * Analyze sentence structure patterns in text
 * @param {string} text - Text to analyze
 * @returns {Object} Syntactic analysis results
 */
export function analyzeSentenceStructure(text) {
  if (!text || text.trim().length === 0) {
    return {
      openingPatterns: {},
      avgClausesPerSentence: 0,
      complexityScore: 0,
      structuralVariety: 0,
      punctuationDensity: {}
    };
  }

  const sentences = text.match(sentenceRegex) || [];

  if (sentences.length === 0) {
    return {
      openingPatterns: {},
      avgClausesPerSentence: 0,
      complexityScore: 0,
      structuralVariety: 0,
      punctuationDensity: {}
    };
  }

  const openingCounts = {};
  let totalClauses = 0;
  let complexitySum = 0;

  Object.keys(SENTENCE_OPENINGS).forEach(type => {
    openingCounts[type] = 0;
  });
  openingCounts.other = 0;

  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) return;

    let matched = false;
    for (const [type, { pattern }] of Object.entries(SENTENCE_OPENINGS)) {
      if (pattern.test(trimmed)) {
        openingCounts[type]++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      openingCounts.other++;
    }

    const clauseCount = countClauses(trimmed);
    totalClauses += clauseCount;

    const sentenceComplexity = calculateSentenceComplexity(trimmed, clauseCount);
    complexitySum += sentenceComplexity;
  });

  const avgClausesPerSentence = sentences.length > 0 ? totalClauses / sentences.length : 0;

  const complexityScore = sentences.length > 0 ? complexitySum / sentences.length : 0;

  const openingPatterns = {};
  const totalSentences = sentences.length;
  Object.entries(openingCounts).forEach(([type, count]) => {
    openingPatterns[type] = totalSentences > 0 ? (count / totalSentences) * 100 : 0;
  });

  const patternValues = Object.values(openingPatterns).filter(v => v > 0);
  const structuralVariety = calculateVariety(patternValues);

  const punctuationDensity = analyzePunctuationDensity(text);

  return {
    openingPatterns,
    avgClausesPerSentence,
    complexityScore,
    structuralVariety,
    punctuationDensity
  };
}

/**
 * Count clauses in a sentence
 * @param {string} sentence - Sentence to analyze
 * @returns {number} Number of clauses
 */
function countClauses(sentence) {
  let clauseCount = 1;

  CLAUSE_MARKERS.coordinating.words.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) {
      clauseCount += matches.length;
    }
  });

  CLAUSE_MARKERS.subordinating.words.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) {
      clauseCount += matches.length;
    }
  });

  const semicolons = (sentence.match(/;/g) || []).length;
  clauseCount += semicolons;

  return clauseCount;
}

/**
 * Calculate complexity score for a single sentence
 * @param {string} sentence - Sentence to analyze
 * @param {number} clauseCount - Number of clauses
 * @returns {number} Complexity score (0-10)
 */
function calculateSentenceComplexity(sentence, clauseCount) {
  let score = 0;

  score += Math.min(clauseCount * 2, 6);

  const hasSubordinating = CLAUSE_MARKERS.subordinating.words.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(sentence);
  });

  if (hasSubordinating) {
    score += 2;
  }

  const punctuationComplexity = (sentence.match(/[;:—]/g) || []).length;
  score += Math.min(punctuationComplexity, 2);

  return Math.min(score, 10);
}

/**
 * Calculate variety score from distribution
 * @param {number[]} values - Array of percentage values
 * @returns {number} Variety score (0-100)
 */
function calculateVariety(values) {
  if (values.length === 0) return 0;

  const entropy = values.reduce((sum, val) => {
    const prob = val / 100;
    return sum - (prob > 0 ? prob * Math.log2(prob) : 0);
  }, 0);

  const maxEntropy = Math.log2(8);

  return (entropy / maxEntropy) * 100;
}

/**
 * Analyze punctuation density
 * @param {string} text - Text to analyze
 * @returns {Object} Punctuation density metrics
 */
function analyzePunctuationDensity(text) {
  const wordCount = (text.match(/\b\w+\b/g) || []).length;
  const density = {};

  Object.entries(PUNCTUATION_PATTERNS).forEach(([type, { pattern, weight }]) => {
    const matches = text.match(pattern) || [];
    const count = matches.length;
    const perThousandWords = wordCount > 0 ? (count / wordCount) * 1000 : 0;

    density[type] = {
      count,
      perThousandWords,
      weight
    };
  });

  return density;
}

/**
 * Build syntactic profile from multiple texts
 * @param {string[]} texts - Array of texts to analyze
 * @returns {Object} Aggregated syntactic profile
 */
export function buildSyntacticProfile(texts) {
  if (!texts || texts.length === 0) {
    return {
      openingPatterns: {},
      avgClausesPerSentence: { mean: 0, stdDev: 0 },
      complexityScore: { mean: 0, stdDev: 0 },
      structuralVariety: { mean: 0, stdDev: 0 }
    };
  }

  const analyses = texts.map(text => analyzeSentenceStructure(text));

  const aggregatedOpenings = {};
  Object.keys(SENTENCE_OPENINGS).forEach(type => {
    aggregatedOpenings[type] = [];
  });
  aggregatedOpenings.other = [];

  const clauseCounts = [];
  const complexityScores = [];
  const varietyScores = [];

  analyses.forEach(analysis => {
    Object.entries(analysis.openingPatterns).forEach(([type, percentage]) => {
      if (!aggregatedOpenings[type]) {
        aggregatedOpenings[type] = [];
      }
      aggregatedOpenings[type].push(percentage);
    });

    clauseCounts.push(analysis.avgClausesPerSentence);
    complexityScores.push(analysis.complexityScore);
    varietyScores.push(analysis.structuralVariety);
  });

  const openingPatterns = {};
  Object.entries(aggregatedOpenings).forEach(([type, values]) => {
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      openingPatterns[type] = { mean, stdDev, values };
    } else {
      openingPatterns[type] = { mean: 0, stdDev: 0, values: [] };
    }
  });

  const avgClausesMean = clauseCounts.reduce((a, b) => a + b, 0) / clauseCounts.length;
  const avgClausesVariance = clauseCounts.reduce((sum, val) =>
    sum + Math.pow(val - avgClausesMean, 2), 0) / clauseCounts.length;
  const avgClausesStdDev = Math.sqrt(avgClausesVariance);

  const complexityMean = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length;
  const complexityVariance = complexityScores.reduce((sum, val) =>
    sum + Math.pow(val - complexityMean, 2), 0) / complexityScores.length;
  const complexityStdDev = Math.sqrt(complexityVariance);

  const varietyMean = varietyScores.reduce((a, b) => a + b, 0) / varietyScores.length;
  const varietyVariance = varietyScores.reduce((sum, val) =>
    sum + Math.pow(val - varietyMean, 2), 0) / varietyScores.length;
  const varietyStdDev = Math.sqrt(varietyVariance);

  return {
    openingPatterns,
    avgClausesPerSentence: { mean: avgClausesMean, stdDev: avgClausesStdDev },
    complexityScore: { mean: complexityMean, stdDev: complexityStdDev },
    structuralVariety: { mean: varietyMean, stdDev: varietyStdDev }
  };
}

/**
 * Compare syntactic profiles
 * @param {Object} baseline - Baseline syntactic profile
 * @param {Object} current - Current text syntactic analysis
 * @returns {Object} Comparison results
 */
export function compareSyntacticProfiles(baseline, current) {
  if (!baseline || !current) {
    return {
      openingDeviations: {},
      clauseDeviation: 0,
      complexityDeviation: 0,
      varietyDeviation: 0,
      overallDeviation: 0
    };
  }

  const openingDeviations = {};
  const openingZScores = [];

  Object.keys(baseline.openingPatterns).forEach(type => {
    const baselinePattern = baseline.openingPatterns[type];
    const currentValue = current.openingPatterns[type] || 0;

    // Calculate Z-score for this opening pattern
    const zScore = baselinePattern.stdDev > 0
      ? Math.abs(currentValue - baselinePattern.mean) / baselinePattern.stdDev
      : 0;

    openingDeviations[type] = {
      baseline: baselinePattern.mean,
      current: currentValue,
      zScore
    };

    openingZScores.push(zScore);
  });

  // Average of absolute Z-scores for opening patterns (all on same scale now)
  const avgOpeningDeviation = openingZScores.length > 0
    ? openingZScores.reduce((sum, z) => sum + z, 0) / openingZScores.length
    : 0;

  const clauseDeviation = baseline.avgClausesPerSentence.stdDev > 0
    ? Math.abs(current.avgClausesPerSentence - baseline.avgClausesPerSentence.mean) /
      baseline.avgClausesPerSentence.stdDev
    : 0;

  const complexityDeviation = baseline.complexityScore.stdDev > 0
    ? Math.abs(current.complexityScore - baseline.complexityScore.mean) /
      baseline.complexityScore.stdDev
    : 0;

  const varietyDeviation = baseline.structuralVariety.stdDev > 0
    ? Math.abs(current.structuralVariety - baseline.structuralVariety.mean) /
      baseline.structuralVariety.stdDev
    : 0;

  const overallDeviation = (avgOpeningDeviation + clauseDeviation + complexityDeviation + varietyDeviation) / 4;

  return {
    openingDeviations,
    clauseDeviation,
    complexityDeviation,
    varietyDeviation,
    overallDeviation
  };
}

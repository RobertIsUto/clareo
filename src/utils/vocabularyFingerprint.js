/**
 * Vocabulary Fingerprinting Module
 * Analyzes and compares vocabulary patterns for writing style identification
 */

import { HIGH_FREQUENCY_WORDS } from '../constants/phrases.js';

const wordRegex = /[a-z]+(?:[''][a-z]+)?/gi;

/**
 * Extract comprehensive vocabulary profile from text
 * @param {string} text - Text to analyze
 * @returns {Object} Vocabulary profile with frequency, signature words, and metrics
 */
export function extractVocabularyProfile(text) {
  const words = text.toLowerCase().match(wordRegex) || [];
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      wordFrequency: new Map(),
      signatureWords: [],
      wordLengthDistribution: {},
      lexicalDensity: 0,
      vocabularyEntropy: 0,
      avgWordLength: 0,
      uniqueWordCount: 0
    };
  }

  const wordFrequency = new Map();
  const contentWords = [];
  let totalLength = 0;
  const lengthBuckets = { short: 0, medium: 0, long: 0 };

  words.forEach(word => {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    totalLength += word.length;

    if (word.length <= 4) {
      lengthBuckets.short++;
    } else if (word.length <= 7) {
      lengthBuckets.medium++;
    } else {
      lengthBuckets.long++;
    }

    if (!HIGH_FREQUENCY_WORDS.has(word) && word.length > 3) {
      contentWords.push(word);
    }
  });

  const avgWordLength = totalLength / totalWords;

  const lexicalDensity = contentWords.length / totalWords;

  const signatureWords = calculateSignatureWords(wordFrequency, totalWords);

  const vocabularyEntropy = calculateVocabularyEntropy(wordFrequency, totalWords);

  const wordLengthDistribution = {
    short: (lengthBuckets.short / totalWords) * 100,
    medium: (lengthBuckets.medium / totalWords) * 100,
    long: (lengthBuckets.long / totalWords) * 100
  };

  return {
    wordFrequency,
    signatureWords,
    wordLengthDistribution,
    lexicalDensity,
    vocabularyEntropy,
    avgWordLength,
    uniqueWordCount: wordFrequency.size,
    totalWords
  };
}

/**
 * Calculate signature words using TF-IDF-inspired scoring
 * @param {Map} wordFrequency - Word frequency map
 * @param {number} totalWords - Total word count
 * @returns {Array} Top signature words with scores
 */
function calculateSignatureWords(wordFrequency, totalWords) {
  const signatureWords = [];

  wordFrequency.forEach((count, word) => {
    if (HIGH_FREQUENCY_WORDS.has(word) || word.length <= 3) {
      return;
    }

    const tf = count / totalWords;

    const score = tf * (1 + Math.log(count + 1));

    signatureWords.push({
      word,
      frequency: count,
      score
    });
  });

  return signatureWords
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

/**
 * Calculate vocabulary entropy (diversity measure)
 * @param {Map} wordFrequency - Word frequency map
 * @param {number} totalWords - Total word count
 * @returns {number} Entropy value
 */
function calculateVocabularyEntropy(wordFrequency, totalWords) {
  let entropy = 0;

  wordFrequency.forEach(count => {
    const probability = count / totalWords;
    entropy -= probability * Math.log2(probability);
  });

  return entropy;
}

/**
 * Build vocabulary profile from multiple baseline texts
 * @param {string[]} texts - Array of baseline texts
 * @returns {Object} Aggregated vocabulary profile
 */
export function buildVocabularyProfile(texts) {
  if (!texts || texts.length === 0) {
    return {
      combinedFrequency: new Map(),
      signatureWords: [],
      avgWordLength: 0,
      lexicalDensity: 0,
      vocabularyEntropy: 0
    };
  }

  const combinedFrequency = new Map();
  let totalWords = 0;
  let totalLength = 0;
  let totalContentWords = 0;

  texts.forEach(text => {
    const words = text.toLowerCase().match(wordRegex) || [];
    words.forEach(word => {
      combinedFrequency.set(word, (combinedFrequency.get(word) || 0) + 1);
      totalWords++;
      totalLength += word.length;

      if (!HIGH_FREQUENCY_WORDS.has(word) && word.length > 3) {
        totalContentWords++;
      }
    });
  });

  const avgWordLength = totalWords > 0 ? totalLength / totalWords : 0;
  const lexicalDensity = totalWords > 0 ? totalContentWords / totalWords : 0;

  const signatureWords = calculateSignatureWords(combinedFrequency, totalWords);

  const vocabularyEntropy = calculateVocabularyEntropy(combinedFrequency, totalWords);

  return {
    combinedFrequency,
    signatureWords,
    avgWordLength,
    lexicalDensity,
    vocabularyEntropy,
    totalWords
  };
}

/**
 * Compare two vocabulary profiles
 * @param {Object} baseline - Baseline vocabulary profile
 * @param {Object} current - Current text vocabulary profile
 * @returns {Object} Comparison results with overlap and deviation metrics
 */
export function compareVocabularyProfiles(baseline, current) {
  if (!baseline || !current) {
    return {
      overlapScore: 0,
      newWords: [],
      missingSignatureWords: [],
      styleShiftScore: 0,
      avgWordLengthDiff: 0,
      lexicalDensityDiff: 0,
      entropyDiff: 0
    };
  }

  // 1. Content Word Analysis (Topic Consistency)
  const baselineWords = new Set(baseline.signatureWords.map(sw => sw.word));
  const currentWords = new Set(current.signatureWords.map(sw => sw.word));

  const overlap = [...currentWords].filter(w => baselineWords.has(w)).length;

  // Symmetric overlap: average of both directions
  const currentCoverage = currentWords.size > 0 ? (overlap / currentWords.size) * 100 : 0;
  const baselineCoverage = baselineWords.size > 0 ? (overlap / baselineWords.size) * 100 : 0;
  const contentOverlapScore = (currentCoverage + baselineCoverage) / 2;

  // 2. Function Word Analysis (Style Consistency)
  // This is more robust to topic changes as it measures "bridge" vocabulary
  const baselineFreq = baseline.combinedFrequency || baseline.wordFrequency;
  const currentFreq = current.wordFrequency;
  const baselineTotal = baseline.totalWords || 1;
  const currentTotal = current.totalWords || 1;

  let functionSimilaritySum = 0;
  let functionWordCount = 0;

  // Check top function words to see if usage rates are similar
  // We use the predefined set of high frequency words as our "style" corpus
  HIGH_FREQUENCY_WORDS.forEach(word => {
    const baseCount = baselineFreq.get(word) || 0;
    const currCount = currentFreq.get(word) || 0;

    // Only consider if at least one text uses the word
    if (baseCount > 0 || currCount > 0) {
      const baseRate = (baseCount / baselineTotal) * 1000; // Rate per 1000 words
      const currRate = (currCount / currentTotal) * 1000;

      // Calculate similarity: 100% - percent difference
      // We dampen the penalty for very rare words to avoid noise
      const maxRate = Math.max(baseRate, currRate);
      const diff = Math.abs(baseRate - currRate);
      
      // Similarity formula: closer rates = higher score
      // We use a decay function so small differences don't penalize too much
      const similarity = 100 / (1 + (diff / (maxRate * 0.5 || 1)));
      
      // Weight more common words higher
      const weight = Math.log(baseCount + currCount + 1);
      
      functionSimilaritySum += similarity * weight;
      functionWordCount += weight;
    }
  });

  const functionOverlapScore = functionWordCount > 0 ? functionSimilaritySum / functionWordCount : 50;

  // 3. Composite Overlap Score
  // Weighted 70% Function (Style) / 30% Content (Topic) to allow for topic changes
  const overlapScore = (functionOverlapScore * 0.7) + (contentOverlapScore * 0.3);

  const newWords = [...currentWords].filter(w => !baselineWords.has(w)).slice(0, 10);

  const missingSignatureWords = baseline.signatureWords
    .slice(0, 10)
    .filter(sw => !currentWords.has(sw.word))
    .map(sw => sw.word);

  const avgWordLengthDiff = current.avgWordLength - baseline.avgWordLength;
  const lexicalDensityDiff = current.lexicalDensity - baseline.lexicalDensity;
  const entropyDiff = current.vocabularyEntropy - baseline.vocabularyEntropy;

  const styleShiftScore = calculateStyleShiftScore({
    overlapScore,
    avgWordLengthDiff,
    lexicalDensityDiff,
    entropyDiff,
    newWordsCount: newWords.length,
    missingWordsCount: missingSignatureWords.length,
    currentTotalWords: current.totalWords || 1,
    baselineTotalWords: baseline.totalWords || 1
  });

  return {
    overlapScore,
    contentOverlapScore, // Return for debugging/advanced view if needed
    functionOverlapScore, // Return for debugging/advanced view if needed
    newWords,
    missingSignatureWords,
    styleShiftScore,
    avgWordLengthDiff,
    lexicalDensityDiff,
    entropyDiff
  };
}

/**
 * Calculate overall style shift score based on vocabulary differences
 * @param {Object} metrics - Various vocabulary comparison metrics
 * @returns {number} Style shift score (0-100, higher = more shift)
 */
function calculateStyleShiftScore(metrics) {
  const {
    overlapScore,
    avgWordLengthDiff,
    lexicalDensityDiff,
    entropyDiff,
    newWordsCount,
    missingWordsCount,
    currentTotalWords,
    baselineTotalWords
  } = metrics;

  const overlapPenalty = Math.max(0, 100 - overlapScore);

  const lengthPenalty = Math.abs(avgWordLengthDiff) * 10;

  const densityPenalty = Math.abs(lexicalDensityDiff) * 100;

  const entropyPenalty = Math.abs(entropyDiff) * 5;

  // Normalize by text length: convert raw counts to percentages
  const newWordsPenalty = (newWordsCount / currentTotalWords) * 100 * 2;

  const missingWordsPenalty = (missingWordsCount / baselineTotalWords) * 100 * 3;

  const totalShift = (
    overlapPenalty * 0.30 +
    lengthPenalty * 0.15 +
    densityPenalty * 0.20 +
    entropyPenalty * 0.15 +
    newWordsPenalty * 0.10 +
    missingWordsPenalty * 0.10
  );

  return Math.min(100, Math.max(0, totalShift));
}

/**
 * Calculate vocabulary overlap percentage between baseline texts and current text
 * @param {string[]} baselineTexts - Array of baseline texts
 * @param {string} currentText - Current text to compare
 * @returns {number} Overlap percentage (0-100)
 */
export function calculateVocabularyOverlap(baselineTexts, currentText) {
  if (!baselineTexts || baselineTexts.length === 0 || !currentText) {
    return 0;
  }

  const baselineWords = new Set();
  baselineTexts.forEach(text => {
    const words = text.toLowerCase().match(wordRegex) || [];
    words.forEach(word => {
      if (!HIGH_FREQUENCY_WORDS.has(word) && word.length > 3) {
        baselineWords.add(word);
      }
    });
  });

  const currentWords = currentText.toLowerCase().match(wordRegex) || [];
  const currentContentWords = new Set(
    currentWords.filter(w => !HIGH_FREQUENCY_WORDS.has(w) && w.length > 3)
  );

  if (currentContentWords.size === 0) {
    return 0;
  }

  const sharedWords = [...currentContentWords].filter(w => baselineWords.has(w));
  const overlapPercentage = (sharedWords.length / currentContentWords.size) * 100;

  return overlapPercentage;
}

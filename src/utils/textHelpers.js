/**
 * Smart Regex Helper
 * Creates regex patterns that detect grammatical variants automatically
 *
 * @param {string} keyword - The base word or phrase to match
 * @returns {RegExp} A regex pattern that matches the keyword and its variants
 */
export function createSmartRegex(keyword) {
  // Check if keyword contains spaces (multi-word phrase)
  if (keyword.includes(' ')) {
    // For multi-word phrases, match exactly
    const escapedPhrase = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
  }

  // For single words, match base word plus common suffixes
  // Handles: word, words, worded, wording, etc.
  const escapedWord = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escapedWord}(?:s|d|ed|ing)?\\b`, 'gi');
}

/**
 * Quote Exclusion Helper
 * Removes quoted material from text analysis (text the student didn't write)
 *
 * @param {string} text - The raw input text
 * @returns {string} Text with quoted material replaced by spaces
 */
export function excludeQuotedText(text) {
  if (!text) return '';

  // Normalize curly quotes to straight quotes
  let normalizedText = text
    .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes
    .replace(/[\u2018\u2019]/g, "'"); // Replace curly single quotes

  // Remove content inside double quotes (replace with single space to preserve word boundaries)
  normalizedText = normalizedText.replace(/"[^"]*"/g, ' ');

  // Remove content inside single quotes ONLY when they appear to be quotations
  // (preceded by space/start/punctuation and followed by space/end/punctuation)
  // This preserves contractions like "don't" and possessives like "John's"
  // Uses a two-step approach since JS doesn't support lookbehind in all environments
  normalizedText = normalizedText.replace(
    /(^|[\s,.:;!?(])'([^']*)'(?=[\s,.:;!?)]|$)/g,
    '$1 '
  );

  return normalizedText;
}

/**
 * MSTTR Calculator (Mean-Segmental Type-Token Ratio)
 * Fixes vocabulary bias where longer essays receive lower scores
 *
 * @param {string} text - The text to analyze
 * @param {number} segmentSize - Size of each segment (default: 50 words)
 * @returns {number} The MSTTR score (0-1 range)
 */
export function calculateMSTTR(text, segmentSize = 50) {
  const wordRegex = /[a-z]+(?:[''][a-z]+)?/gi;
  const words = text.toLowerCase().match(wordRegex) || [];

  if (words.length < segmentSize) {
    // If text is shorter than one segment, return simple TTR
    const uniqueWords = new Set(words);
    return words.length > 0 ? uniqueWords.size / words.length : 0;
  }

  let ttrSum = 0;
  let segmentCount = 0;

  // Process words in chunks of segmentSize
  for (let i = 0; i + segmentSize <= words.length; i += segmentSize) {
    const segment = words.slice(i, i + segmentSize);
    const uniqueInSegment = new Set(segment);
    const segmentTTR = uniqueInSegment.size / segmentSize;
    ttrSum += segmentTTR;
    segmentCount++;
  }

  // Return average TTR across all segments
  return segmentCount > 0 ? ttrSum / segmentCount : 0;
}

/**
 * Get word count from text
 * @param {string} text - The text to count words in
 * @returns {number} Word count
 */
export function getWordCount(text) {
  const wordRegex = /[a-z]+(?:[''][a-z]+)?/gi;
  const words = text.match(wordRegex) || [];
  return words.length;
}

/**
 * Format a number with fixed decimal places and optional suffix
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} suffix - Optional suffix (%, etc.)
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 1, suffix = '') {
  const formatted = parseFloat(value).toFixed(decimals);
  return suffix ? `${formatted}${suffix}` : formatted;
}

/**
 * Format a range of values (min-max)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} decimals - Number of decimal places
 * @param {string} suffix - Optional suffix
 * @returns {string} Formatted range (e.g., "5.2-8.7%")
 */
export function formatRange(min, max, decimals = 1, suffix = '') {
  const minFormatted = parseFloat(min).toFixed(decimals);
  const maxFormatted = parseFloat(max).toFixed(decimals);
  return suffix ? `${minFormatted}-${maxFormatted}${suffix}` : `${minFormatted}-${maxFormatted}`;
}

/**
 * Format a value with confidence interval
 * @param {number} mean - Mean value
 * @param {number} stdDev - Standard deviation
 * @param {number} decimals - Number of decimal places
 * @param {string} suffix - Optional suffix
 * @returns {string} Formatted with +/- notation
 */
export function formatWithConfidence(mean, stdDev, decimals = 1, suffix = '') {
  const meanFormatted = parseFloat(mean).toFixed(decimals);
  const stdDevFormatted = parseFloat(stdDev).toFixed(decimals);
  return suffix
    ? `${meanFormatted}${suffix} (±${stdDevFormatted}${suffix})`
    : `${meanFormatted} (±${stdDevFormatted})`;
}

/**
 * Get significance level label from z-score
 * @param {number} zScore - Absolute z-score value
 * @returns {string} Significance label
 */
export function getSignificanceLabel(zScore) {
  const absZScore = Math.abs(zScore);
  if (absZScore >= 2.0) return 'ALERT';
  if (absZScore >= 1.5) return 'WARNING';
  if (absZScore >= 1.0) return 'NOTICE';
  return 'OK';
}

/**
 * Get color class for z-score
 * @param {number} zScore - Absolute z-score value
 * @returns {string} CSS class name
 */
export function getZScoreColorClass(zScore) {
  const absZScore = Math.abs(zScore);
  if (absZScore >= 2.0) return 'deviation-high';
  if (absZScore >= 1.0) return 'deviation-medium';
  return 'deviation-normal';
}

/**
 * Truncate text to maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

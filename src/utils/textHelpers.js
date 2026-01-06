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

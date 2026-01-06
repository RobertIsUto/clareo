import {
  FORMAL_REGISTER_PHRASES,
  CONNECTIVES,
  HIGH_FREQUENCY_WORDS,
  FORMULAIC_NGRAMS
} from '../constants/phrases.js';
import { HUMAN_NGRAM_BASELINE } from '../constants/thresholds.js';
import { createSmartRegex, excludeQuotedText, calculateMSTTR } from './textHelpers.js';

// Pre-compile regex patterns for better performance
const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;
const wordRegex = /[a-z]+(?:[''][a-z]+)?/gi;
const passivePatterns = /\b(is|are|was|were|been|being|be)\s+(\w+ed|written|spoken|taken|given|made|done|seen|known|found|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|grown|hidden|ridden|risen|shaken|stolen|thrown|worn)\b/gi;

export function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function analyzeSentences(text) {
  const sentences = text.match(sentenceRegex) || [];
  return sentences
    .map((s, i) => {
      const words = s.trim().match(wordRegex) || [];
      const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
      return {
        index: i + 1,
        text: s.trim(),
        wordCount: words.length,
        syllableCount: syllables,
      };
    })
    .filter((s) => s.wordCount > 0);
}

export function calculateSentenceStats(sentences) {
  if (sentences.length === 0) return { mean: 0, min: 0, max: 0, stdDev: 0, total: 0 };
  const lengths = sentences.map((s) => s.wordCount);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  return {
    mean: mean.toFixed(1),
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    stdDev: Math.sqrt(variance).toFixed(2),
    total: sentences.length,
  };
}

export function calculateReadability(sentences, totalWords) {
  if (sentences.length === 0 || totalWords === 0) return { score: 0, grade: 0 };
  const totalSyllables = sentences.reduce((sum, s) => sum + s.syllableCount, 0);
  const avgSentenceLength = totalWords / sentences.length;
  const avgSyllablesPerWord = totalSyllables / totalWords;
  let score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  score = Math.max(0, Math.min(100, score));
  let grade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  grade = Math.max(0, grade);
  return { score: score.toFixed(1), grade: grade.toFixed(1) };
}

export function analyzeVocabulary(text) {
  const words = text.toLowerCase().match(wordRegex) || [];
  const uniqueWords = new Set(words);
  const ttr = words.length > 0 ? uniqueWords.size / words.length : 0;

  // Use MSTTR for standardized vocabulary measurement
  const msttr = calculateMSTTR(text, 50);

  const sophisticatedWords = words.filter((w) => w.length >= 6 && !HIGH_FREQUENCY_WORDS.has(w));
  const sophisticationRatio = words.length > 0 ? (sophisticatedWords.length / words.length) * 100 : 0;

  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.size,
    ttr: (ttr * 100).toFixed(1),
    sTTR: (msttr * 100).toFixed(1), // Using MSTTR instead of old sTTR
    sophisticationRatio: sophisticationRatio.toFixed(1),
  };
}

export function analyzeConnectives(text) {
  const results = {};
  let totalConnectives = 0;
  Object.entries(CONNECTIVES).forEach(([category, words]) => {
    const found = [];
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        found.push({ word, count: matches.length });
        totalConnectives += matches.length;
      }
    });
    results[category] = found;
  });
  return { byCategory: results, total: totalConnectives };
}

export function analyzeFormalRegister(text) {
  const found = [];
  let totalWeight = 0;

  // Use Smart Regex helper for each phrase
  FORMAL_REGISTER_PHRASES.forEach((item) => {
    const regex = createSmartRegex(item.phrase);
    const matches = text.match(regex);
    if (matches) {
      const count = matches.length;
      const weightedScore = count * item.weight;
      totalWeight += weightedScore;
      found.push({
        ...item,
        count,
        weightedScore,
        // Include suggestion in results for UI display
        suggestion: item.suggestion
      });
    }
  });

  const highSeverity = found.filter(f => f.weight === 3);
  const mediumSeverity = found.filter(f => f.weight === 2);
  const lowSeverity = found.filter(f => f.weight === 1);

  return {
    phrases: found.sort((a, b) => b.weightedScore - a.weightedScore),
    totalWeight,
    totalCount: found.reduce((sum, f) => sum + f.count, 0),
    severity: {
      high: highSeverity.reduce((sum, f) => sum + f.count, 0),
      medium: mediumSeverity.reduce((sum, f) => sum + f.count, 0),
      low: lowSeverity.reduce((sum, f) => sum + f.count, 0),
    }
  };
}

// Optimized n-gram analysis using Map for O(1) lookups
export function analyzeNgrams(text) {
  const words = text.toLowerCase().match(wordRegex) || [];
  const totalWords = words.length;

  if (totalWords < 10) {
    return {
      bigrams: { found: [], count: 0, rate: 0, excess: 0 },
      trigrams: { found: [], count: 0, rate: 0, excess: 0 },
      predictabilityScore: 0,
    };
  }

  // Build n-gram frequency maps
  const bigramMap = new Map();
  const trigramMap = new Map();

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigramMap.set(bigram, (bigramMap.get(bigram) || 0) + 1);
  }

  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    trigramMap.set(trigram, (trigramMap.get(trigram) || 0) + 1);
  }

  // Count formulaic n-grams
  const bigramCounts = {};
  const trigramCounts = {};

  FORMULAIC_NGRAMS.bigrams.forEach(bg => {
    const count = bigramMap.get(bg) || 0;
    if (count > 0) bigramCounts[bg] = count;
  });

  FORMULAIC_NGRAMS.trigrams.forEach(tg => {
    const count = trigramMap.get(tg) || 0;
    if (count > 0) trigramCounts[tg] = count;
  });

  const bigramTotal = Object.values(bigramCounts).reduce((a, b) => a + b, 0);
  const trigramTotal = Object.values(trigramCounts).reduce((a, b) => a + b, 0);

  const bigramRate = (bigramTotal / totalWords) * 100;
  const trigramRate = (trigramTotal / totalWords) * 100;

  const bigramExcess = Math.max(0, bigramRate - HUMAN_NGRAM_BASELINE.bigramRate);
  const trigramExcess = Math.max(0, trigramRate - HUMAN_NGRAM_BASELINE.trigramRate);

  const predictabilityScore = Math.min(100, (bigramExcess * 2 + trigramExcess * 5));

  return {
    bigrams: {
      found: Object.entries(bigramCounts).map(([phrase, count]) => ({ phrase, count })).sort((a, b) => b.count - a.count),
      count: bigramTotal,
      rate: bigramRate.toFixed(1),
      excess: bigramExcess.toFixed(1),
    },
    trigrams: {
      found: Object.entries(trigramCounts).map(([phrase, count]) => ({ phrase, count })).sort((a, b) => b.count - a.count),
      count: trigramTotal,
      rate: trigramRate.toFixed(1),
      excess: trigramExcess.toFixed(1),
    },
    predictabilityScore: predictabilityScore.toFixed(0),
  };
}

export function analyzeParagraphs(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  if (paragraphs.length === 0) {
    return {
      count: 0,
      avgSentencesPerPara: 0,
      avgWordsPerPara: 0,
      coherenceScore: 0,
      topicShiftScore: 0,
      paragraphDetails: [],
    };
  }

  const paragraphDetails = paragraphs.map((para, idx) => {
    const sentences = para.match(sentenceRegex) || [];
    const words = para.toLowerCase().match(wordRegex) || [];
    const contentWords = words.filter(w => !HIGH_FREQUENCY_WORDS.has(w) && w.length > 3);

    const firstSentence = sentences[0] || "";
    const openingWords = firstSentence.trim().split(/\s+/).slice(0, 3).join(" ");

    const allConnectives = Object.values(CONNECTIVES).flat();
    const hasTransition = allConnectives.some(c =>
      firstSentence.toLowerCase().trim().startsWith(c + " ") ||
      firstSentence.toLowerCase().trim().startsWith(c + ",")
    );

    return {
      index: idx + 1,
      sentenceCount: sentences.filter(s => s.trim()).length,
      wordCount: words.length,
      contentWords: contentWords.slice(0, 10),
      openingWords,
      hasTransition,
    };
  });

  let sharedWordCount = 0;
  let transitions = 0;

  for (let i = 1; i < paragraphDetails.length; i++) {
    const prevWords = new Set(paragraphDetails[i - 1].contentWords);
    const currWords = paragraphDetails[i].contentWords;
    const shared = currWords.filter(w => prevWords.has(w)).length;
    sharedWordCount += shared;
    if (paragraphDetails[i].hasTransition) transitions++;
  }

  const avgShared = paragraphDetails.length > 1 ? sharedWordCount / (paragraphDetails.length - 1) : 0;
  const transitionRate = paragraphDetails.length > 1 ? (transitions / (paragraphDetails.length - 1)) * 100 : 0;

  const coherenceScore = Math.min(100, avgShared * 20 + transitionRate * 0.5);

  const topicShiftScore = paragraphDetails.length > 1
    ? Math.max(0, 100 - coherenceScore)
    : 0;

  const totalSentences = paragraphDetails.reduce((sum, p) => sum + p.sentenceCount, 0);
  const totalWords = paragraphDetails.reduce((sum, p) => sum + p.wordCount, 0);

  return {
    count: paragraphs.length,
    avgSentencesPerPara: (totalSentences / paragraphs.length).toFixed(1),
    avgWordsPerPara: (totalWords / paragraphs.length).toFixed(1),
    coherenceScore: coherenceScore.toFixed(0),
    topicShiftScore: topicShiftScore.toFixed(0),
    transitionRate: transitionRate.toFixed(0),
    paragraphDetails,
  };
}

export function analyzeVariation(sentences) {
  if (sentences.length < 2) return { cv: 0 };
  const lengths = sentences.map((s) => s.wordCount);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  return { cv: cv.toFixed(1) };
}

export function analyzePassiveVoice(text) {
  const matches = text.match(passivePatterns) || [];
  const sentences = text.match(sentenceRegex) || [];
  return {
    count: matches.length,
    ratio: sentences.length > 0 ? ((matches.length / sentences.length) * 100).toFixed(1) : 0,
  };
}

/**
 * Main analysis orchestrator
 * @param {string} text - Original text for display
 * @returns {object} Complete analysis results
 */
export function runFullAnalysis(text) {
  try {
    // Step 1: Exclude quoted text for certain analyses
    const cleanText = excludeQuotedText(text);

    // Step 2: Run analyses on cleaned text
    const vocabulary = analyzeVocabulary(cleanText);
    const formalRegister = analyzeFormalRegister(cleanText);
    const passive = analyzePassiveVoice(cleanText);
    const connectives = analyzeConnectives(cleanText);
    const ngrams = analyzeNgrams(cleanText);

    // Step 3: Run analyses on original text (sentence structure matters)
    const sentences = analyzeSentences(text);
    const sentenceStats = calculateSentenceStats(sentences);
    const readability = calculateReadability(sentences, vocabulary.totalWords);
    const variation = analyzeVariation(sentences);
    const paragraphs = analyzeParagraphs(text);

    return {
      text, // Original text for display
      sentences,
      sentenceStats,
      vocabulary,
      readability,
      connectives,
      formalPhrases: formalRegister.phrases,
      formalRegister,
      variation,
      passive,
      ngrams,
      paragraphs,
    };
  } catch (error) {
    console.error("Error during text analysis:", error);
    throw new Error("Failed to analyze text. Please check your input.");
  }
}

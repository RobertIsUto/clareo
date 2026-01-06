import React, { useState } from "react";

const FORMAL_REGISTER_PHRASES = [
  { phrase: "delve into", category: "cliché", weight: 3 },
  { phrase: "delve", category: "cliché", weight: 3 },
  { phrase: "tapestry", category: "cliché", weight: 3 },
  { phrase: "rich tapestry", category: "cliché", weight: 3 },
  { phrase: "testament to", category: "cliché", weight: 3 },
  { phrase: "beacon", category: "cliché", weight: 3 },
  { phrase: "multifaceted", category: "cliché", weight: 3 },
  { phrase: "ever-evolving", category: "cliché", weight: 3 },
  { phrase: "myriad", category: "cliché", weight: 3 },
  { phrase: "plethora", category: "cliché", weight: 3 },
  { phrase: "paradigm shift", category: "cliché", weight: 3 },
  { phrase: "symbiotic", category: "cliché", weight: 3 },
  { phrase: "embark", category: "cliché", weight: 3 },
  { phrase: "embarked on", category: "cliché", weight: 3 },
  
  { phrase: "dive deep", category: "cliché", weight: 2 },
  { phrase: "testament", category: "cliché", weight: 2 },
  { phrase: "landscape", category: "cliché", weight: 2 },
  { phrase: "rapidly evolving", category: "cliché", weight: 2 },
  { phrase: "dynamic", category: "cliché", weight: 2 },
  { phrase: "realm", category: "cliché", weight: 2 },
  { phrase: "cornerstone", category: "cliché", weight: 2 },
  { phrase: "pinnacle", category: "cliché", weight: 2 },
  { phrase: "game-changer", category: "cliché", weight: 2 },
  { phrase: "leverage", category: "cliché", weight: 2 },
  { phrase: "harness", category: "cliché", weight: 2 },
  { phrase: "unleash", category: "cliché", weight: 2 },
  { phrase: "unlock", category: "cliché", weight: 2 },
  { phrase: "elevate", category: "cliché", weight: 2 },
  { phrase: "revolutionize", category: "cliché", weight: 2 },
  { phrase: "transformative", category: "cliché", weight: 2 },
  { phrase: "foster", category: "cliché", weight: 2 },
  { phrase: "cultivate", category: "cliché", weight: 2 },
  { phrase: "spearhead", category: "cliché", weight: 2 },
  { phrase: "orchestrate", category: "cliché", weight: 2 },
  { phrase: "navigating", category: "cliché", weight: 2 },
  { phrase: "journey", category: "cliché", weight: 2 },
  { phrase: "shed light on", category: "cliché", weight: 2 },
  { phrase: "underscore", category: "cliché", weight: 2 },
  { phrase: "underscores", category: "cliché", weight: 2 },
  { phrase: "intersection", category: "cliché", weight: 2 },
  { phrase: "interplay", category: "cliché", weight: 2 },
  { phrase: "synergy", category: "cliché", weight: 2 },
  { phrase: "nuanced", category: "cliché", weight: 2 },
  { phrase: "holistic", category: "cliché", weight: 2 },
  { phrase: "paradigm", category: "cliché", weight: 2 },
  
  { phrase: "comprehensive", category: "cliché", weight: 1 },
  { phrase: "crucial", category: "cliché", weight: 1 },
  { phrase: "pivotal", category: "cliché", weight: 1 },
  { phrase: "vital", category: "cliché", weight: 1 },
  { phrase: "it is important to note", category: "hedging", weight: 1 },
  { phrase: "it is worth noting", category: "hedging", weight: 1 },
  { phrase: "in terms of", category: "academic phrase", weight: 1 },
  { phrase: "with regard to", category: "formal connector", weight: 1 },
  { phrase: "with respect to", category: "formal connector", weight: 1 },
  { phrase: "in light of", category: "formal connector", weight: 1 },
  { phrase: "plays a crucial role", category: "emphasis phrase", weight: 2 },
  { phrase: "plays a vital role", category: "emphasis phrase", weight: 2 },
  { phrase: "plays a pivotal role", category: "emphasis phrase", weight: 2 },
  { phrase: "it is essential to", category: "hedging", weight: 1 },
  { phrase: "it is crucial to", category: "hedging", weight: 1 },
  { phrase: "in conclusion", category: "discourse marker", weight: 1 },
  { phrase: "to summarize", category: "discourse marker", weight: 1 },
  { phrase: "in summary", category: "discourse marker", weight: 1 },
  { phrase: "furthermore", category: "formal connector", weight: 1 },
  { phrase: "moreover", category: "formal connector", weight: 1 },
  { phrase: "nevertheless", category: "formal connector", weight: 1 },
  { phrase: "nonetheless", category: "formal connector", weight: 1 },
  { phrase: "consequently", category: "formal connector", weight: 1 },
  { phrase: "subsequently", category: "formal connector", weight: 1 },
  { phrase: "first and foremost", category: "emphasis phrase", weight: 2 },
  { phrase: "comprehensive understanding", category: "academic phrase", weight: 2 },
  { phrase: "holistic approach", category: "academic phrase", weight: 2 },
  { phrase: "facilitate", category: "academic vocabulary", weight: 1 },
  { phrase: "utilize", category: "academic vocabulary", weight: 1 },
  { phrase: "implement", category: "academic vocabulary", weight: 1 },
];

const CONNECTIVES = {
  additive: ["and", "also", "moreover", "furthermore", "additionally", "besides", "likewise", "similarly"],
  adversative: ["but", "however", "yet", "nevertheless", "nonetheless", "although", "though", "whereas", "while", "conversely"],
  causal: ["because", "therefore", "thus", "hence", "consequently", "accordingly", "so", "since"],
  temporal: ["then", "next", "finally", "subsequently", "meanwhile", "afterward", "previously", "first", "second", "third"],
};

const HIGH_FREQUENCY_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for",
  "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by",
  "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one",
  "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "people", "into", "year", "your", "good", "some",
  "could", "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how", "our",
  "work", "first", "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "is", "are", "was", "were", "been", "being", "has",
  "had", "does", "did", "am", "very", "more", "much", "such", "own", "same",
  "should", "must", "may", "might", "still", "here", "where", "why", "each",
  "every", "both", "few", "many",
]);

const FORMULAIC_NGRAMS = {
  bigrams: [
    "it is", "this is", "there are", "there is", "we can", "you can",
    "in order", "as well", "such as", "due to", "based on", "in the",
    "of the", "to the", "for the", "on the", "by the", "with the",
    "is a", "are a", "was a", "be a", "as a", "have a",
    "important to", "necessary to", "essential to", "crucial to",
    "ability to", "order to", "need to", "want to", "have to",
    "can be", "will be", "would be", "could be", "should be", "must be",
  ],
  trigrams: [
    "it is important", "it is essential", "it is crucial", "it is necessary",
    "in order to", "as well as", "due to the", "based on the",
    "one of the", "some of the", "many of the", "most of the",
    "the fact that", "in the context", "on the other", "at the same",
    "is one of", "are some of", "is a key", "plays a crucial",
    "plays a vital", "plays an important", "in this article",
    "in this essay", "we will explore", "let us delve", "let's explore",
    "when it comes", "it comes to", "comes to the",
  ],
};

const HUMAN_NGRAM_BASELINE = {
  bigramRate: 15,
  trigramRate: 3,
};

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function analyzeSentences(text) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [];
  return sentences
    .map((s, i) => {
      const words = s.trim().match(/[a-z]+(?:[''][a-z]+)?/gi) || [];
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

function calculateSentenceStats(sentences) {
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

function calculateReadability(sentences, totalWords) {
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

function analyzeVocabulary(text) {
  const words = text.toLowerCase().match(/[a-z]+(?:[''][a-z]+)?/g) || [];
  const uniqueWords = new Set(words);
  const ttr = words.length > 0 ? uniqueWords.size / words.length : 0;

  let ttrSum = 0;
  let chunks = 0;
  const chunkSize = 50;
  if (words.length >= chunkSize) {
    for (let i = 0; i < words.length; i += chunkSize) {
      if (i + chunkSize <= words.length) {
        const chunk = words.slice(i, i + chunkSize);
        const chunkUnique = new Set(chunk);
        ttrSum += chunkUnique.size / chunkSize;
        chunks++;
      }
    }
  }
  const sTTR = chunks > 0 ? ttrSum / chunks : ttr;

  const sophisticatedWords = words.filter((w) => w.length >= 6 && !HIGH_FREQUENCY_WORDS.has(w));
  const sophisticationRatio = words.length > 0 ? (sophisticatedWords.length / words.length) * 100 : 0;

  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.size,
    ttr: (ttr * 100).toFixed(1),
    sTTR: (sTTR * 100).toFixed(1),
    sophisticationRatio: sophisticationRatio.toFixed(1),
  };
}

function analyzeConnectives(text) {
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

function analyzeFormalRegister(text) {
  const found = [];
  let totalWeight = 0;
  
  FORMAL_REGISTER_PHRASES.forEach((item) => {
    const regex = new RegExp(`\\b${item.phrase}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) {
      const count = matches.length;
      const weightedScore = count * item.weight;
      totalWeight += weightedScore;
      found.push({ ...item, count, weightedScore });
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

function analyzeNgrams(text) {
  const words = text.toLowerCase().match(/[a-z]+(?:[''][a-z]+)?/g) || [];
  const totalWords = words.length;
  
  if (totalWords < 10) {
    return {
      bigrams: { found: [], count: 0, rate: 0, excess: 0 },
      trigrams: { found: [], count: 0, rate: 0, excess: 0 },
      predictabilityScore: 0,
    };
  }
  
  const textBigrams = [];
  const textTrigrams = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    textBigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    textTrigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  
  const bigramCounts = {};
  const trigramCounts = {};
  
  FORMULAIC_NGRAMS.bigrams.forEach(bg => {
    const count = textBigrams.filter(tb => tb === bg).length;
    if (count > 0) bigramCounts[bg] = count;
  });
  
  FORMULAIC_NGRAMS.trigrams.forEach(tg => {
    const count = textTrigrams.filter(tt => tt === tg).length;
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

function analyzeParagraphs(text) {
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
    const sentences = para.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [];
    const words = para.toLowerCase().match(/[a-z]+(?:[''][a-z]+)?/g) || [];
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

function analyzeVariation(sentences) {
  if (sentences.length < 2) return { cv: 0 };
  const lengths = sentences.map((s) => s.wordCount);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  return { cv: cv.toFixed(1) };
}

function analyzePassiveVoice(text) {
  const passivePatterns = /\b(is|are|was|were|been|being|be)\s+(\w+ed|written|spoken|taken|given|made|done|seen|known|found|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|grown|hidden|ridden|risen|shaken|stolen|thrown|worn)\b/gi;
  const matches = text.match(passivePatterns) || [];
  const sentences = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [];
  return {
    count: matches.length,
    ratio: sentences.length > 0 ? ((matches.length / sentences.length) * 100).toFixed(1) : 0,
  };
}

function runFullAnalysis(text) {
  const sentences = analyzeSentences(text);
  const sentenceStats = calculateSentenceStats(sentences);
  const vocabulary = analyzeVocabulary(text);
  const readability = calculateReadability(sentences, vocabulary.totalWords);
  const connectives = analyzeConnectives(text);
  const formalRegister = analyzeFormalRegister(text);
  const variation = analyzeVariation(sentences);
  const passive = analyzePassiveVoice(text);
  const ngrams = analyzeNgrams(text);
  const paragraphs = analyzeParagraphs(text);

  return {
    text,
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
}

const MetricCard = ({ value, label, sublabel, warning, tooltip }) => (
  <div className="metric-card" title={tooltip}>
    <div className="metric-value" style={{ color: warning ? "#e67e22" : "#2C3E50" }}>
      {value}
    </div>
    <div className="metric-label">{label}</div>
    {sublabel && <div className="metric-sublabel">{sublabel}</div>}
    {warning && <div className="metric-warning">{warning}</div>}
  </div>
);

const TextHighlighter = ({ text, mode }) => {
  const getHighlightedText = () => {
    if (mode === "none") return <div className="text-content">{text}</div>;

    let regex;
    let className = "";

    if (mode === "formal") {
      const phrases = FORMAL_REGISTER_PHRASES.map((p) => p.phrase).join("|");
      regex = new RegExp(`(${phrases})`, "gi");
      className = "highlight-formal";
    } else if (mode === "passive") {
      regex = /\b((?:is|are|was|were|been|being|be)\s+(?:\w+ed|written|spoken|taken|given|made|done|seen|known|found|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|grown|hidden|ridden|risen|shaken|stolen|thrown|worn))\b/gi;
      className = "highlight-passive";
    } else if (mode === "connectives") {
      const allConnectives = Object.values(CONNECTIVES).flat();
      const pattern = allConnectives.map((w) => `\\b${w}\\b`).join("|");
      regex = new RegExp(`(${pattern})`, "gi");
      className = "highlight-connective";
    } else if (mode === "ngrams") {
      const allNgrams = [...FORMULAIC_NGRAMS.trigrams, ...FORMULAIC_NGRAMS.bigrams];
      const pattern = allNgrams.map(ng => ng.replace(/\s+/g, "\\s+")).join("|");
      regex = new RegExp(`(${pattern})`, "gi");
      className = "highlight-ngram";
    }

    const split = text.split(regex);
    return (
      <div className="text-content">
        {split.map((part, i) => {
          if (part.match(regex)) {
            return (
              <span key={i} className={className}>
                {part}
              </span>
            );
          }
          return part;
        })}
      </div>
    );
  };

  return <div className="highlighter-container">{getHighlightedText()}</div>;
};

const generateAnalysisPDF = (results) => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Clareo Analysis Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        body { font-family: 'DM Sans', sans-serif; padding: 40px; color: #2C3E50; max-width: 800px; margin: 0 auto; }
        h1 { color: #00B8D9; border-bottom: 2px solid #00B8D9; padding-bottom: 10px; }
        h2 { color: #2C3E50; margin-top: 30px; font-size: 18px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 28px; font-weight: 700; color: #2C3E50; }
        .metric-label { font-size: 11px; text-transform: uppercase; color: #888; margin-top: 5px; }
        .text-sample { background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap; font-size: 13px; line-height: 1.6; max-height: 200px; overflow: hidden; }
        .phrase-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .phrase-tag { background: #e8f4f8; padding: 4px 10px; border-radius: 15px; font-size: 11px; }
        .severity-high { background: #f8d7da; color: #842029; }
        .severity-medium { background: #fff3cd; color: #664d03; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 8px 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 13px; }
        th { background: #f8f9fa; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #888; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Clareo Analysis Report</h1>
      <p style="color: #888; font-size: 13px;">Generated: ${new Date().toLocaleString()}</p>
      
      <h2>Summary Metrics</h2>
      <div class="metrics-grid">
        <div class="metric">
          <div class="metric-value">${results.readability.grade}</div>
          <div class="metric-label">Grade Level</div>
        </div>
        <div class="metric">
          <div class="metric-value">${results.variation.cv}%</div>
          <div class="metric-label">Sentence Variance</div>
        </div>
        <div class="metric">
          <div class="metric-value">${results.vocabulary.sTTR}%</div>
          <div class="metric-label">Vocab Variety (sTTR)</div>
        </div>
        <div class="metric">
          <div class="metric-value">${results.formalRegister.totalWeight}</div>
          <div class="metric-label">Formulaic Score</div>
        </div>
        <div class="metric">
          <div class="metric-value">${results.ngrams.predictabilityScore}%</div>
          <div class="metric-label">Predictability</div>
        </div>
        <div class="metric">
          <div class="metric-value">${results.paragraphs.coherenceScore}%</div>
          <div class="metric-label">Coherence</div>
        </div>
      </div>
      
      <h2>Additional Statistics</h2>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Words</td><td>${results.vocabulary.totalWords}</td></tr>
        <tr><td>Total Sentences</td><td>${results.sentenceStats.total}</td></tr>
        <tr><td>Avg. Sentence Length</td><td>${results.sentenceStats.mean} words</td></tr>
        <tr><td>Unique Words</td><td>${results.vocabulary.uniqueWords}</td></tr>
        <tr><td>Sophistication Ratio</td><td>${results.vocabulary.sophisticationRatio}%</td></tr>
        <tr><td>Passive Voice Constructions</td><td>${results.passive.count} (${results.passive.ratio}%)</td></tr>
        <tr><td>Paragraphs</td><td>${results.paragraphs.count}</td></tr>
        <tr><td>Connectives Used</td><td>${results.connectives.total}</td></tr>
      </table>
      
      ${results.formalPhrases.length > 0 ? `
      <h2>Formulaic Phrases Detected</h2>
      <table>
        <tr><th>Phrase</th><th>Count</th><th>Weight</th><th>Score</th></tr>
        ${results.formalPhrases.slice(0, 15).map(p => `
          <tr><td>${p.phrase}</td><td>${p.count}</td><td>${p.weight}</td><td>${p.weightedScore}</td></tr>
        `).join('')}
      </table>
      ` : ''}
      
      ${results.ngrams.trigrams.found.length > 0 || results.ngrams.bigrams.found.length > 0 ? `
      <h2>Common N-gram Patterns</h2>
      <div class="phrase-list">
        ${results.ngrams.trigrams.found.slice(0, 8).map(ng => `<span class="phrase-tag">${ng.phrase} (×${ng.count})</span>`).join('')}
        ${results.ngrams.bigrams.found.slice(0, 8).map(ng => `<span class="phrase-tag">${ng.phrase} (×${ng.count})</span>`).join('')}
      </div>
      ` : ''}
      
      <h2>Analyzed Text</h2>
      <div class="text-sample">${results.text.slice(0, 1500)}${results.text.length > 1500 ? '...' : ''}</div>
      
      <div class="footer">
        <p>This report was generated by Clareo, a stylometric analysis tool. These metrics describe linguistic features and do not determine authorship.</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
};

const generateComparisonPDF = (comparisonResult, baselineSampleCount) => {
  const printWindow = window.open('', '_blank');
  
  const metrics = [
    { lbl: "Grade Level", key: "grade", suffix: "", accessor: (c) => c.readability.grade },
    { lbl: "Sentence Variance (CV)", key: "cv", suffix: "%", accessor: (c) => c.variation.cv },
    { lbl: "Vocabulary (sTTR)", key: "sTTR", suffix: "%", accessor: (c) => c.vocabulary.sTTR },
    { lbl: "Sophistication", key: "sophistication", suffix: "%", accessor: (c) => c.vocabulary.sophisticationRatio },
    { lbl: "Formulaic (weighted)", key: "formalWeight", suffix: "", accessor: (c) => c.formalRegister?.totalWeight || 0 },
    { lbl: "Predictability", key: "predictability", suffix: "%", accessor: (c) => c.ngrams?.predictabilityScore || 0 },
    { lbl: "Coherence", key: "coherence", suffix: "%", accessor: (c) => c.paragraphs?.coherenceScore || 0 },
  ];
  
  const tableRows = metrics.map(m => {
    const base = parseFloat(comparisonResult.baseline[m.key]);
    const curr = parseFloat(m.accessor(comparisonResult.current));
    const diff = (curr - base).toFixed(1);
    const isWarning = m.key === "formalWeight" || m.key === "predictability";
    const diffColor = Math.abs(diff) > 5 
      ? (isWarning ? (diff > 0 ? "#c0392b" : "#27ae60") : (diff > 0 ? "#27ae60" : "#c0392b"))
      : "#2C3E50";
    return `<tr>
      <td>${m.lbl}</td>
      <td>${base}${m.suffix}</td>
      <td>${curr.toFixed(1)}${m.suffix}</td>
      <td style="color: ${diffColor}; font-weight: ${Math.abs(diff) > 5 ? 'bold' : 'normal'}">${diff > 0 ? "+" : ""}${diff}${m.suffix}</td>
    </tr>`;
  }).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Clareo Comparison Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        body { font-family: 'DM Sans', sans-serif; padding: 40px; color: #2C3E50; max-width: 800px; margin: 0 auto; }
        h1 { color: #00B8D9; border-bottom: 2px solid #00B8D9; padding-bottom: 10px; }
        h2 { color: #2C3E50; margin-top: 30px; font-size: 18px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px 15px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #e8f4f8; font-weight: 600; }
        .interpretation { background: #eef; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
        .interpretation strong { color: #00B8D9; }
        .text-sample { background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap; font-size: 13px; line-height: 1.6; max-height: 150px; overflow: hidden; margin-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #888; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Clareo Comparison Report</h1>
      <p style="color: #888; font-size: 13px;">Generated: ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <strong>Baseline:</strong> ${baselineSampleCount} sample${baselineSampleCount !== 1 ? 's' : ''} averaged<br>
        <strong>New Text:</strong> ${comparisonResult.current.vocabulary.totalWords} words, ${comparisonResult.current.sentenceStats.total} sentences
      </div>
      
      <h2>Metric Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Student Profile</th>
            <th>New Text</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div class="interpretation">
        <strong>Reading this report:</strong> Differences greater than ±5 are highlighted. For Formulaic and Predictability metrics, increases (positive differences) may indicate a shift toward template-driven language. For Sentence Variance, decreases may indicate more uniform sentence structure.
      </div>
      
      <h2>New Text Sample</h2>
      <div class="text-sample">${comparisonResult.current.text.slice(0, 800)}${comparisonResult.current.text.length > 800 ? '...' : ''}</div>
      
      <div class="footer">
        <p>This report was generated by Clareo, a stylometric analysis tool. These metrics describe linguistic features and do not determine authorship. Use unusual patterns as a starting point for discussion, not as evidence.</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
};

export default function App() {
  const [activeSection, setActiveSection] = useState("analysis");
  const [analysisText, setAnalysisText] = useState("");
  const [results, setResults] = useState(null);
  const [highlightMode, setHighlightMode] = useState("none");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [baselineInput, setBaselineInput] = useState("");
  const [baselineSamples, setBaselineSamples] = useState([]);
  const [comparisonText, setComparisonText] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleAnalyze = () => {
    if (!analysisText.trim()) return;
    setResults(runFullAnalysis(analysisText));
    setHighlightMode("none");
  };

  const addBaselineSample = () => {
    if (!baselineInput.trim()) return;
    const analysis = runFullAnalysis(baselineInput);

    if (analysis.vocabulary.totalWords < 100) {
      if (!window.confirm("This sample is very short (<100 words) and might skew your baseline data. Add it anyway?")) {
        return;
      }
    }

    setBaselineSamples([
      ...baselineSamples,
      {
        id: Date.now(),
        text: baselineInput.slice(0, 50) + "...",
        data: analysis,
      },
    ]);
    setBaselineInput("");
  };

  const removeBaseline = (id) => {
    setBaselineSamples(baselineSamples.filter((s) => s.id !== id));
  };

  const runComparison = () => {
    if (baselineSamples.length === 0 || !comparisonText.trim()) return;

    const current = runFullAnalysis(comparisonText);

    const profile = {
      grade: 0,
      cv: 0,
      sTTR: 0,
      sophistication: 0,
      formalWeight: 0,
      predictability: 0,
      coherence: 0,
    };

    baselineSamples.forEach((sample) => {
      profile.grade += parseFloat(sample.data.readability.grade);
      profile.cv += parseFloat(sample.data.variation.cv);
      profile.sTTR += parseFloat(sample.data.vocabulary.sTTR);
      profile.sophistication += parseFloat(sample.data.vocabulary.sophisticationRatio);
      profile.formalWeight += sample.data.formalRegister?.totalWeight || 0;
      profile.predictability += parseFloat(sample.data.ngrams?.predictabilityScore || 0);
      profile.coherence += parseFloat(sample.data.paragraphs?.coherenceScore || 0);
    });

    const count = baselineSamples.length;
    const averagedProfile = {
      grade: (profile.grade / count).toFixed(1),
      cv: (profile.cv / count).toFixed(1),
      sTTR: (profile.sTTR / count).toFixed(1),
      sophistication: (profile.sophistication / count).toFixed(1),
      formalWeight: (profile.formalWeight / count).toFixed(1),
      predictability: (profile.predictability / count).toFixed(0),
      coherence: (profile.coherence / count).toFixed(0),
    };

    setComparisonResult({
      baseline: averagedProfile,
      current: current,
    });
  };

  return (
    <div className="clareo-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;700&display=swap');
        
        :root { --primary: #00B8D9; --bg: #F4F7FA; --text: #2C3E50; --accent: #FF6B6B; --success: #27ae60; }
        * { box-sizing: border-box; }
        
        :root, body, #root {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          text-align: left !important;
        }

        html, body, #root {
          height: 100%;
          background: var(--bg);
          overflow-x: hidden;
        }
        
        body { 
          font-family: 'DM Sans', sans-serif; 
          color: var(--text); 
          overflow-y: auto; 
        }
        
        .clareo-app { 
          min-height: 100vh;
          width: 100%;
          max-width: none !important;
          margin: 0; 
          padding: 20px 40px; 
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
        }
        
        .content-wrapper {
          flex: 1;
          width: 100%;
        }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: white; padding: 20px 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: var(--primary); letter-spacing: 2px; font-weight: 600; }

        .nav button { background: none; border: none; padding: 10px 20px; cursor: pointer; font-family: inherit; font-weight: 500; color: #666; transition: 0.2s; }
        .nav button.active { color: var(--primary); font-weight: 700; }
        
        .grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 30px; 
          width: 100%; 
        }

        .panel { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h2 { margin-top: 0; font-family: 'Cormorant Garamond', serif; color: var(--primary); }
        h3 { font-size: 14px; color: #666; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 1px; }
        
        textarea { 
          width: 100%; 
          height: 200px; 
          padding: 15px; 
          border: 2px solid #eee; 
          border-radius: 8px; 
          font-family: inherit; 
          resize: vertical; 
          margin-bottom: 10px; 
          background-color: white; 
          color: #2C3E50;
        }
        textarea:focus { outline: none; border-color: var(--primary); }
        
        .btn { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline { background: transparent; border: 1px solid #ccc; color: #666; margin-right: 10px; }
        .btn-small { padding: 6px 12px; font-size: 11px; }
        
        .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .metrics-row-5 { grid-template-columns: repeat(5, 1fr); }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; cursor: help; transition: transform 0.2s; }
        .metric-card:hover { transform: translateY(-2px); }
        .metric-value { font-size: 24px; font-weight: 700; color: var(--text); }
        .metric-label { font-size: 11px; text-transform: uppercase; color: #888; margin-top: 5px; }
        .metric-sublabel { font-size: 10px; color: #aaa; margin-top: 3px; }
        .metric-warning { font-size: 10px; color: #e67e22; margin-top: 5px; }
        
        .highlighter-controls { display: flex; gap: 10px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; flex-wrap: wrap; }
        
        .highlighter-btn { 
          padding: 6px 12px; 
          border: 1px solid #ccc; 
          background: white; 
          color: #2C3E50; 
          border-radius: 20px; 
          font-size: 12px; 
          cursor: pointer; 
        }
        .highlighter-btn.active { background: var(--text); color: white; border-color: var(--text); }
        
        .highlighter-container { height: 300px; overflow-y: auto; line-height: 1.8; font-size: 15px; padding: 15px; background: #fafafa; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap; }
        
        .highlight-formal { background-color: #d1e7dd; color: #0f5132; padding: 2px 4px; border-radius: 4px; font-weight: 500; }
        .highlight-passive { background-color: #fff3cd; color: #664d03; padding: 2px 4px; border-radius: 4px; font-weight: 500; }
        .highlight-connective { background-color: #cff4fc; color: #055160; padding: 2px 4px; border-radius: 4px; font-weight: 500; }
        .highlight-ngram { background-color: #f8d7da; color: #842029; padding: 2px 4px; border-radius: 4px; font-weight: 500; }
        
        .baseline-list { margin-bottom: 20px; max-height: 150px; overflow-y: auto; }
        .baseline-item { display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 6px; font-size: 13px; }
        .remove-btn { color: #e74c3c; cursor: pointer; font-weight: bold; border: none; background: none; }
        
        .comp-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .comp-table th { text-align: left; color: #888; font-size: 11px; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #eee; }
        .comp-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
        .diff-pos { color: #27ae60; font-weight: bold; }
        .diff-neg { color: #c0392b; font-weight: bold; }
        
        .warning-box { background: #fff3cd; color: #856404; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        
        .severity-breakdown { display: flex; gap: 15px; margin-top: 10px; font-size: 12px; }
        .severity-item { display: flex; align-items: center; gap: 5px; }
        .severity-dot { width: 10px; height: 10px; border-radius: 50%; }
        .severity-high { background: #e74c3c; }
        .severity-medium { background: #f39c12; }
        .severity-low { background: #3498db; }
        
        .advanced-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        .toggle-advanced { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 5px; }
        
        .ngram-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .ngram-tag { background: #f8d7da; color: #842029; padding: 4px 10px; border-radius: 15px; font-size: 11px; }
        
        .paragraph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; margin-top: 10px; }
        .para-block { background: #e8f4f8; padding: 8px; border-radius: 6px; text-align: center; font-size: 11px; }
        .para-block.has-transition { border-left: 3px solid var(--primary); }
        
        .references { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        .references h3 { font-size: 14px; color: var(--text); margin-bottom: 10px; font-family: 'DM Sans', sans-serif; text-transform: uppercase; letter-spacing: 1px; }
        .ref-item { margin-bottom: 5px; padding-left: 10px; border-left: 2px solid var(--primary); }

        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .metrics-row { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <header className="header">
        <div className="logo">CLAREO</div>
        <nav className="nav">
          <button
            className={activeSection === "analysis" ? "active" : ""}
            onClick={() => setActiveSection("analysis")}
          >
            Analyze Text
          </button>
          <button
            className={activeSection === "compare" ? "active" : ""}
            onClick={() => setActiveSection("compare")}
          >
            Compare Profile
          </button>
        </nav>
      </header>

      <div className="content-wrapper">
        {activeSection === "analysis" && (
          <div className="grid">
            <div className="panel">
              <h2>Analyze Student Text</h2>
              <textarea
                placeholder="Paste student text here..."
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {analysisText.split(/\s+/).filter((w) => w).length} words
                </span>
                <button className="btn" onClick={handleAnalyze} disabled={!analysisText.trim()}>
                  Run Analysis
                </button>
              </div>

              {results && results.vocabulary.totalWords < 100 && (
                <div className="warning-box" style={{ marginTop: "15px" }}>
                  <strong>Short Text Warning:</strong> This text is under 100 words. Metrics may be unreliable.
                </div>
              )}
            </div>

            <div className="panel">
              {!results ? (
                <div style={{ textAlign: "center", color: "#888", paddingTop: "80px" }}>
                  Enter text and analyze to see metrics.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0 }}>Analysis Results</h2>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => generateAnalysisPDF(results)}
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      ↓ Download PDF
                    </button>
                  </div>
                  <div className="metrics-row metrics-row-5">
                    <MetricCard
                      value={results.readability.grade}
                      label="Grade Level"
                      tooltip="Flesch-Kincaid Grade Level"
                    />
                    <MetricCard
                      value={`${results.variation.cv}%`}
                      label="Sentence Var"
                      sublabel="Low < 25%"
                      tooltip="Coefficient of Variation in sentence length"
                    />
                    <MetricCard
                      value={`${results.vocabulary.sTTR}%`}
                      label="Vocab Variety"
                      sublabel="Std. TTR"
                      tooltip="Standardized Type-Token Ratio"
                    />
                    <MetricCard
                      value={results.formalRegister.totalWeight}
                      label="Formulaic"
                      sublabel={`${results.formalRegister.totalCount} phrases`}
                      warning={results.formalRegister.totalWeight > 10 ? "High" : null}
                      tooltip="Weighted score of formulaic/stock phrases"
                    />
                    <MetricCard
                      value={`${results.ngrams.predictabilityScore}%`}
                      label="Predictability"
                      sublabel="N-gram score"
                      warning={parseInt(results.ngrams.predictabilityScore) > 30 ? "Elevated" : null}
                      tooltip="Based on common formulaic n-gram patterns"
                    />
                  </div>

                  {/* Severity breakdown */}
                  <div className="severity-breakdown">
                    <div className="severity-item">
                      <span className="severity-dot severity-high"></span>
                      <span>High: {results.formalRegister.severity.high}</span>
                    </div>
                    <div className="severity-item">
                      <span className="severity-dot severity-medium"></span>
                      <span>Medium: {results.formalRegister.severity.medium}</span>
                    </div>
                    <div className="severity-item">
                      <span className="severity-dot severity-low"></span>
                      <span>Low: {results.formalRegister.severity.low}</span>
                    </div>
                  </div>

                  <div className="highlighter-controls">
                    <button
                      className={`highlighter-btn ${highlightMode === "none" ? "active" : ""}`}
                      onClick={() => setHighlightMode("none")}
                    >
                      None
                    </button>
                    <button
                      className={`highlighter-btn ${highlightMode === "formal" ? "active" : ""}`}
                      onClick={() => setHighlightMode("formal")}
                    >
                      Formulaic ({results.formalRegister.totalCount})
                    </button>
                    <button
                      className={`highlighter-btn ${highlightMode === "ngrams" ? "active" : ""}`}
                      onClick={() => setHighlightMode("ngrams")}
                    >
                      N-grams ({results.ngrams.bigrams.count + results.ngrams.trigrams.count})
                    </button>
                    <button
                      className={`highlighter-btn ${highlightMode === "passive" ? "active" : ""}`}
                      onClick={() => setHighlightMode("passive")}
                    >
                      Passive ({results.passive.count})
                    </button>
                    <button
                      className={`highlighter-btn ${highlightMode === "connectives" ? "active" : ""}`}
                      onClick={() => setHighlightMode("connectives")}
                    >
                      Connectives ({results.connectives.total})
                    </button>
                  </div>

                  <TextHighlighter text={results.text} mode={highlightMode} />

                  {/* Advanced section toggle */}
                  <div className="advanced-section">
                    <button className="toggle-advanced" onClick={() => setShowAdvanced(!showAdvanced)}>
                      {showAdvanced ? "▼" : "▶"} Advanced Analysis
                    </button>
                    
                    {showAdvanced && (
                      <>
                        {/* Paragraph Analysis */}
                        <h3>Paragraph Flow</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                          <div className="metric-card" style={{ padding: "10px" }}>
                            <div className="metric-value" style={{ fontSize: "18px" }}>{results.paragraphs.count}</div>
                            <div className="metric-label">Paragraphs</div>
                          </div>
                          <div className="metric-card" style={{ padding: "10px" }}>
                            <div className="metric-value" style={{ fontSize: "18px" }}>{results.paragraphs.coherenceScore}%</div>
                            <div className="metric-label">Coherence</div>
                          </div>
                          <div className="metric-card" style={{ padding: "10px" }}>
                            <div className="metric-value" style={{ fontSize: "18px" }}>{results.paragraphs.transitionRate}%</div>
                            <div className="metric-label">Transition Rate</div>
                          </div>
                        </div>
                        
                        <div className="paragraph-grid">
                          {results.paragraphs.paragraphDetails.map((p) => (
                            <div key={p.index} className={`para-block ${p.hasTransition ? "has-transition" : ""}`} title={`Opens: "${p.openingWords}..."`}>
                              <div style={{ fontWeight: "bold" }}>¶{p.index}</div>
                              <div>{p.sentenceCount}s / {p.wordCount}w</div>
                            </div>
                          ))}
                        </div>

                        {/* Top N-grams */}
                        {(results.ngrams.trigrams.found.length > 0 || results.ngrams.bigrams.found.length > 0) && (
                          <>
                            <h3>Common N-gram Patterns</h3>
                            <div className="ngram-list">
                              {results.ngrams.trigrams.found.slice(0, 5).map((ng, i) => (
                                <span key={`tri-${i}`} className="ngram-tag">{ng.phrase} ×{ng.count}</span>
                              ))}
                              {results.ngrams.bigrams.found.slice(0, 5).map((ng, i) => (
                                <span key={`bi-${i}`} className="ngram-tag">{ng.phrase} ×{ng.count}</span>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Top formal phrases */}
                        {results.formalPhrases.length > 0 && (
                          <>
                            <h3>Top Weighted Phrases</h3>
                            <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                              {results.formalPhrases.slice(0, 8).map((p, i) => (
                                <span key={i} style={{ marginRight: "15px" }}>
                                  <strong>{p.phrase}</strong> 
                                  <span style={{ color: "#888" }}> (×{p.count}, wt:{p.weightedScore})</span>
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ marginTop: "15px", fontSize: "12px", color: "#666", lineHeight: "1.5" }}>
                    <strong>Interpretation:</strong>
                    {parseFloat(results.variation.cv) < 25
                      ? " Uniform sentence lengths suggest robotic rhythm."
                      : " Natural variation in sentence length."}
                    {parseInt(results.ngrams.predictabilityScore) > 30
                      ? " Elevated predictability from common formulaic patterns."
                      : ""}
                    {results.formalRegister.severity.high > 2
                      ? " Multiple high-severity stock phrases detected."
                      : ""}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeSection === "compare" && (
          <div className="grid">
            <div className="panel">
              <h2>1. Build Student Profile</h2>
              
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
                Add 3+ past assignments to create a reliable baseline average.
              </p>

              <textarea
                style={{ height: "100px" }}
                placeholder="Paste a past assignment here..."
                value={baselineInput}
                onChange={(e) => setBaselineInput(e.target.value)}
              />
              <button className="btn btn-outline" onClick={addBaselineSample} disabled={!baselineInput.trim()}>
                + Add Sample
              </button>

              <div className="baseline-list" style={{ marginTop: "20px" }}>
                {baselineSamples.map((s, i) => (
                  <div key={s.id} className="baseline-item">
                    <span>Sample {i + 1} ({s.data.vocabulary.totalWords} words)</span>
                    <button className="remove-btn" onClick={() => removeBaseline(s.id)}>×</button>
                  </div>
                ))}
                {baselineSamples.length === 0 && (
                  <div style={{ fontStyle: "italic", color: "#ccc" }}>No samples added yet</div>
                )}
              </div>
            </div>

            <div className="panel">
              <h2>2. Compare New Work</h2>
              <textarea
                style={{ height: "100px" }}
                placeholder="Paste the new text under review..."
                value={comparisonText}
                onChange={(e) => setComparisonText(e.target.value)}
              />
              <button
                className="btn"
                onClick={runComparison}
                disabled={baselineSamples.length === 0 || !comparisonText.trim()}
              >
                Compare vs Profile
              </button>

              {comparisonResult && (
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Student Profile</th>
                      <th>New Text</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { lbl: "Grade Level", key: "grade", suffix: "", accessor: (c) => c.readability.grade },
                      { lbl: "Sentence Var (CV)", key: "cv", suffix: "%", accessor: (c) => c.variation.cv },
                      { lbl: "Vocab (sTTR)", key: "sTTR", suffix: "%", accessor: (c) => c.vocabulary.sTTR },
                      { lbl: "Sophistication", key: "sophistication", suffix: "%", accessor: (c) => c.vocabulary.sophisticationRatio },
                      { lbl: "Formulaic (wt)", key: "formalWeight", suffix: "", accessor: (c) => c.formalRegister?.totalWeight || 0 },
                      { lbl: "Predictability", key: "predictability", suffix: "%", accessor: (c) => c.ngrams?.predictabilityScore || 0 },
                      { lbl: "Coherence", key: "coherence", suffix: "%", accessor: (c) => c.paragraphs?.coherenceScore || 0 },
                    ].map((m) => {
                      const base = parseFloat(comparisonResult.baseline[m.key]);
                      const curr = parseFloat(m.accessor(comparisonResult.current));
                      const diff = (curr - base).toFixed(1);
                      const isWarning = m.key === "formalWeight" || m.key === "predictability";
                      const diffClass = isWarning 
                        ? (diff > 0 ? "diff-neg" : "diff-pos")
                        : (diff > 0 ? "diff-pos" : "diff-neg");
                      return (
                        <tr key={m.key}>
                          <td>{m.lbl}</td>
                          <td>{base}{m.suffix}</td>
                          <td>{curr.toFixed(1)}{m.suffix}</td>
                          <td className={Math.abs(diff) > 5 ? diffClass : ""}>
                            {diff > 0 ? "+" : ""}{diff}{m.suffix}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {comparisonResult && (
                <div style={{ marginTop: "15px", background: "#eef", padding: "10px", borderRadius: "6px", fontSize: "12px" }}>
                  <strong>Tip:</strong> Watch for simultaneous jumps in "Formulaic" and "Predictability" combined with drops in "Sentence Var" — these patterns suggest a shift away from the student's natural voice.
                </div>
              )}
              {comparisonResult && (
                <button 
                  className="btn btn-outline" 
                  onClick={() => generateComparisonPDF(comparisonResult, baselineSamples.length)}
                  style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  ↓ Download Comparison PDF
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="references">
        <h3>Methodology & Academic References</h3>
        <div className="ref-item">
          <strong>Readability:</strong> Flesch, R. (1948). <em>A new readability yardstick.</em> / Kincaid, J. P., et al. (1975). <em>Derivation of new readability formulas.</em>
        </div>
        <div className="ref-item">
          <strong>Sentence Variance (CV):</strong> Coefficient of variation in sentence lengths — a key marker of natural vs. robotic writing rhythm.
        </div>
        <div className="ref-item">
          <strong>Vocabulary & Cohesion:</strong> Based on <em>Coh-Metrix</em> (Graesser, A. C., et al., 2004), analyzing lexical diversity and connective density.
        </div>
        <div className="ref-item">
          <strong>N-gram Analysis:</strong> Detection of predictable phrase patterns common in template-driven or formulaic writing, based on computational linguistics research.
        </div>
        <div className="ref-item">
          <strong>Paragraph Coherence:</strong> Measures topic continuity via shared content words and transition usage between adjacent paragraphs.
        </div>
      </div>
    </div>
  );
}
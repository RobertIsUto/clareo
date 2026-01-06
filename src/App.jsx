import React, { useState } from "react";

const FORMAL_REGISTER_PHRASES = [
  { phrase: "delve into", category: "AI Cliché" },
  { phrase: "delve", category: "AI Cliché" },
  { phrase: "dive deep", category: "AI Cliché" },
  { phrase: "tapestry", category: "AI Cliché" },
  { phrase: "rich tapestry", category: "AI Cliché" },
  { phrase: "testament to", category: "AI Cliché" },
  { phrase: "testament", category: "AI Cliché" },
  { phrase: "landscape", category: "AI Cliché" },
  { phrase: "ever-evolving", category: "AI Cliché" },
  { phrase: "rapidly evolving", category: "AI Cliché" },
  { phrase: "dynamic", category: "AI Cliché" },
  { phrase: "realm", category: "AI Cliché" },
  { phrase: "beacon", category: "AI Cliché" },
  { phrase: "cornerstone", category: "AI Cliché" },
  { phrase: "pinnacle", category: "AI Cliché" },
  { phrase: "game-changer", category: "AI Cliché" },
  { phrase: "leverage", category: "AI Cliché" },
  { phrase: "harness", category: "AI Cliché" },
  { phrase: "unleash", category: "AI Cliché" },
  { phrase: "unlock", category: "AI Cliché" },
  { phrase: "elevate", category: "AI Cliché" },
  { phrase: "revolutionize", category: "AI Cliché" },
  { phrase: "transformative", category: "AI Cliché" },
  { phrase: "foster", category: "AI Cliché" },
  { phrase: "cultivate", category: "AI Cliché" },
  { phrase: "spearhead", category: "AI Cliché" },
  { phrase: "orchestrate", category: "AI Cliché" },
  { phrase: "navigating", category: "AI Cliché" },
  { phrase: "embarked on", category: "AI Cliché" },
  { phrase: "embark", category: "AI Cliché" },
  { phrase: "journey", category: "AI Cliché" },
  { phrase: "shed light on", category: "AI Cliché" },
  { phrase: "underscore", category: "AI Cliché" },
  { phrase: "underscores", category: "AI Cliché" },
  { phrase: "myriad", category: "AI Cliché" },
  { phrase: "plethora", category: "AI Cliché" },
  { phrase: "intersection", category: "AI Cliché" },
  { phrase: "interplay", category: "AI Cliché" },
  { phrase: "synergy", category: "AI Cliché" },
  { phrase: "symbiotic", category: "AI Cliché" },
  { phrase: "multifaceted", category: "AI Cliché" },
  { phrase: "nuanced", category: "AI Cliché" },
  { phrase: "holistic", category: "AI Cliché" },
  { phrase: "comprehensive", category: "AI Cliché" },
  { phrase: "paradigm shift", category: "AI Cliché" },
  { phrase: "paradigm", category: "AI Cliché" },
  { phrase: "crucial", category: "AI Cliché" },
  { phrase: "pivotal", category: "AI Cliché" },
  { phrase: "vital", category: "AI Cliché" },
  { phrase: "it is important to note", category: "hedging" },
  { phrase: "it is worth noting", category: "hedging" },
  { phrase: "in terms of", category: "academic phrase" },
  { phrase: "with regard to", category: "formal connector" },
  { phrase: "with respect to", category: "formal connector" },
  { phrase: "in light of", category: "formal connector" },
  { phrase: "plays a crucial role", category: "emphasis phrase" },
  { phrase: "plays a vital role", category: "emphasis phrase" },
  { phrase: "plays a pivotal role", category: "emphasis phrase" },
  { phrase: "it is essential to", category: "hedging" },
  { phrase: "it is crucial to", category: "hedging" },
  { phrase: "in conclusion", category: "discourse marker" },
  { phrase: "to summarize", category: "discourse marker" },
  { phrase: "in summary", category: "discourse marker" },
  { phrase: "furthermore", category: "formal connector" },
  { phrase: "moreover", category: "formal connector" },
  { phrase: "nevertheless", category: "formal connector" },
  { phrase: "nonetheless", category: "formal connector" },
  { phrase: "consequently", category: "formal connector" },
  { phrase: "subsequently", category: "formal connector" },
  { phrase: "first and foremost", category: "emphasis phrase" },
  { phrase: "comprehensive understanding", category: "academic phrase" },
  { phrase: "holistic approach", category: "academic phrase" },
  { phrase: "facilitate", category: "academic vocabulary" },
  { phrase: "utilize", category: "academic vocabulary" },
  { phrase: "implement", category: "academic vocabulary" },
];

const CONNECTIVES = {
  additive: [
    "and",
    "also",
    "moreover",
    "furthermore",
    "additionally",
    "besides",
    "likewise",
    "similarly",
  ],
  adversative: [
    "but",
    "however",
    "yet",
    "nevertheless",
    "nonetheless",
    "although",
    "though",
    "whereas",
    "while",
    "conversely",
  ],
  causal: [
    "because",
    "therefore",
    "thus",
    "hence",
    "consequently",
    "accordingly",
    "so",
    "since",
  ],
  temporal: [
    "then",
    "next",
    "finally",
    "subsequently",
    "meanwhile",
    "afterward",
    "previously",
    "first",
    "second",
    "third",
  ],
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
      const words = s.trim().match(/[a-z]+(?:['’][a-z]+)?/gi) || [];
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
  if (sentences.length === 0)
    return { mean: 0, min: 0, max: 0, stdDev: 0, total: 0 };
  const lengths = sentences.map((s) => s.wordCount);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
    lengths.length;

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

  return {
    score: score.toFixed(1),
    grade: grade.toFixed(1),
  };
}

function analyzeVocabulary(text) {
  const words = text.toLowerCase().match(/[a-z]+(?:['’][a-z]+)?/g) || [];
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

  const sophisticatedWords = words.filter(
    (w) => w.length >= 6 && !HIGH_FREQUENCY_WORDS.has(w)
  );
  const sophisticationRatio =
    words.length > 0 ? (sophisticatedWords.length / words.length) * 100 : 0;

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
  FORMAL_REGISTER_PHRASES.forEach((item) => {
    const regex = new RegExp(`\\b${item.phrase}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) {
      found.push({ ...item, count: matches.length });
    }
  });
  return found.sort((a, b) => b.count - a.count);
}

function analyzeVariation(sentences) {
  if (sentences.length < 2) return { cv: 0 };

  const lengths = sentences.map((s) => s.wordCount);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
    lengths.length;
  const stdDev = Math.sqrt(variance);

  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  return { cv: cv.toFixed(1) };
}

function analyzePassiveVoice(text) {
  const passivePatterns =
    /\b(is|are|was|were|been|being|be)\s+(\w+ed|written|spoken|taken|given|made|done|seen|known|found|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|grown|hidden|ridden|risen|shaken|stolen|thrown|worn)\b/gi;
  const matches = text.match(passivePatterns) || [];
  const sentences = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [];

  return {
    count: matches.length,
    ratio:
      sentences.length > 0
        ? ((matches.length / sentences.length) * 100).toFixed(1)
        : 0,
  };
}

function runFullAnalysis(text) {
  const sentences = analyzeSentences(text);
  const sentenceStats = calculateSentenceStats(sentences);
  const vocabulary = analyzeVocabulary(text);
  const readability = calculateReadability(sentences, vocabulary.totalWords);
  const connectives = analyzeConnectives(text);
  const formalPhrases = analyzeFormalRegister(text);
  const variation = analyzeVariation(sentences);
  const passive = analyzePassiveVoice(text);

  return {
    text,
    sentences,
    sentenceStats,
    vocabulary,
    readability,
    connectives,
    formalPhrases,
    variation,
    passive,
  };
}

const MetricCard = ({ value, label, sublabel, warning }) => (
  <div className="metric-card">
    <div
      className="metric-value"
      style={{ color: warning ? "#e67e22" : "#2C3E50" }}
    >
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
      regex =
        /\b((?:is|are|was|were|been|being|be)\s+(?:\w+ed|written|spoken|taken|given|made|done|seen|known|found|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|grown|hidden|ridden|risen|shaken|stolen|thrown|worn))\b/gi;
      className = "highlight-passive";
    } else if (mode === "connectives") {
      const allConnectives = Object.values(CONNECTIVES).flat();
      const pattern = allConnectives.map((w) => `\\b${w}\\b`).join("|");
      regex = new RegExp(`(${pattern})`, "gi");
      className = "highlight-connective";
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

export default function App() {
  const [activeSection, setActiveSection] = useState("analysis");
  const [analysisText, setAnalysisText] = useState("");
  const [results, setResults] = useState(null);
  const [highlightMode, setHighlightMode] = useState("none");

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
      if (
        !window.confirm(
          "This sample is very short (<100 words) and might skew your baseline data. Add it anyway?"
        )
      ) {
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
    };

    baselineSamples.forEach((sample) => {
      profile.grade += parseFloat(sample.data.readability.grade);
      profile.cv += parseFloat(sample.data.variation.cv);
      profile.sTTR += parseFloat(sample.data.vocabulary.sTTR);
      profile.sophistication += parseFloat(
        sample.data.vocabulary.sophisticationRatio
      );
    });

    const count = baselineSamples.length;
    const averagedProfile = {
      grade: (profile.grade / count).toFixed(1),
      cv: (profile.cv / count).toFixed(1),
      sTTR: (profile.sTTR / count).toFixed(1),
      sophistication: (profile.sophistication / count).toFixed(1),
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
        
        :root { --primary: #00B8D9; --bg: #F4F7FA; --text: #2C3E50; }
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
        
        .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: 700; color: var(--text); }
        .metric-label { font-size: 11px; text-transform: uppercase; color: #888; margin-top: 5px; }
        .metric-warning { font-size: 10px; color: #e67e22; margin-top: 5px; }
        
        .highlighter-controls { display: flex; gap: 10px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        
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
        
        .baseline-list { margin-bottom: 20px; max-height: 150px; overflow-y: auto; }
        .baseline-item { display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; margin-bottom: 5px; border-radius: 6px; font-size: 13px; }
        .remove-btn { color: #e74c3c; cursor: pointer; font-weight: bold; border: none; background: none; }
        
        .comp-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .comp-table th { text-align: left; color: #888; font-size: 11px; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #eee; }
        .comp-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
        .diff-pos { color: #27ae60; font-weight: bold; }
        .diff-neg { color: #c0392b; font-weight: bold; }
        
        .warning-box { background: #fff3cd; color: #856404; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {analysisText.split(/\s+/).filter((w) => w).length} words
                </span>
                <button
                  className="btn"
                  onClick={handleAnalyze}
                  disabled={!analysisText.trim()}
                >
                  Run Analysis
                </button>
              </div>

              {results && results.vocabulary.totalWords < 100 && (
                <div className="warning-box" style={{ marginTop: "15px" }}>
                  <strong>Short Text Warning:</strong> This text is under 100
                  words. Metrics like Grade Level and Variation may be unreliable.
                </div>
              )}
            </div>

            <div className="panel">
              {!results ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    paddingTop: "80px",
                  }}
                >
                  Enter text and analyze to see metrics.
                </div>
              ) : (
                <>
                  <div className="metrics-row">
                    <MetricCard
                      value={results.readability.grade}
                      label="Grade Level"
                    />
                    <MetricCard
                      value={`${results.variation.cv}%`}
                      label="Sentence Var"
                      sublabel="Low < 25%"
                    />
                    <MetricCard
                      value={`${results.vocabulary.sTTR}%`}
                      label="Vocab Variety"
                      sublabel="Std. TTR"
                    />
                    <MetricCard
                      value={results.formalPhrases.length}
                      label="Formal Phrases"
                    />
                  </div>

                  <div className="highlighter-controls">
                    <button
                      className={`highlighter-btn ${
                        highlightMode === "none" ? "active" : ""
                      }`}
                      onClick={() => setHighlightMode("none")}
                    >
                      None
                    </button>
                    <button
                      className={`highlighter-btn ${
                        highlightMode === "formal" ? "active" : ""
                      }`}
                      onClick={() => setHighlightMode("formal")}
                    >
                      Formal ({results.formalPhrases.length})
                    </button>
                    <button
                      className={`highlighter-btn ${
                        highlightMode === "passive" ? "active" : ""
                      }`}
                      onClick={() => setHighlightMode("passive")}
                    >
                      Passive ({results.passive.count})
                    </button>
                    <button
                      className={`highlighter-btn ${
                        highlightMode === "connectives" ? "active" : ""
                      }`}
                      onClick={() => setHighlightMode("connectives")}
                    >
                      Connectives ({results.connectives.total})
                    </button>
                  </div>

                  <TextHighlighter text={results.text} mode={highlightMode} />

                  <div
                    style={{
                      marginTop: "15px",
                      fontSize: "12px",
                      color: "#666",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong>Interpretation:</strong>
                    {parseFloat(results.variation.cv) < 25
                      ? " This text has very uniform sentence lengths (robotic rhythm)."
                      : " This text shows natural variation in sentence length."}
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
              <p
                style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}
              >
                Add 3+ past assignments to create a reliable baseline average.
              </p>

              <textarea
                style={{ height: "100px" }}
                placeholder="Paste a past assignment here..."
                value={baselineInput}
                onChange={(e) => setBaselineInput(e.target.value)}
              />
              <button
                className="btn btn-outline"
                onClick={addBaselineSample}
                disabled={!baselineInput.trim()}
              >
                + Add Sample
              </button>

              <div className="baseline-list" style={{ marginTop: "20px" }}>
                {baselineSamples.map((s, i) => (
                  <div key={s.id} className="baseline-item">
                    <span>
                      Sample {i + 1} ({s.data.vocabulary.totalWords} words)
                    </span>
                    <button
                      className="remove-btn"
                      onClick={() => removeBaseline(s.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {baselineSamples.length === 0 && (
                  <div style={{ fontStyle: "italic", color: "#ccc" }}>
                    No samples added yet
                  </div>
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
                      { lbl: "Grade Level", key: "grade", suffix: "" },
                      { lbl: "Sentence Var (CV)", key: "cv", suffix: "%" },
                      { lbl: "Vocab (sTTR)", key: "sTTR", suffix: "%" },
                      {
                        lbl: "Sophistication",
                        key: "sophistication",
                        suffix: "%",
                      },
                    ].map((m) => {
                      const base = parseFloat(comparisonResult.baseline[m.key]);
                      const curr = parseFloat(
                        m.key === "grade"
                          ? comparisonResult.current.readability.grade
                          : m.key === "cv"
                          ? comparisonResult.current.variation.cv
                          : m.key === "sTTR"
                          ? comparisonResult.current.vocabulary.sTTR
                          : comparisonResult.current.vocabulary
                              .sophisticationRatio
                      );
                      const diff = (curr - base).toFixed(1);
                      return (
                        <tr key={m.key}>
                          <td>{m.lbl}</td>
                          <td>
                            {base}
                            {m.suffix}
                          </td>
                          <td>
                            {curr.toFixed(1)}
                            {m.suffix}
                          </td>
                          <td className={diff > 0 ? "diff-pos" : "diff-neg"}>
                            {diff > 0 ? "+" : ""}
                            {diff}
                            {m.suffix}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {comparisonResult && (
                <div
                  style={{
                    marginTop: "15px",
                    background: "#eef",
                    padding: "10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  <strong>Tip:</strong> Significant jumps in "Sophistication"
                  combined with a drop in "Sentence Var" often indicate a shift in
                  writing style.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="references">
        <h3>Methodology & Academic References</h3>
        <div className="ref-item">
          <strong>Readability:</strong> Flesch, R. (1948).{" "}
          <em>A new readability yardstick.</em> Journal of Applied Psychology. /
          Kincaid, J. P., et al. (1975).{" "}
          <em>Derivation of new readability formulas.</em>
        </div>
        <div className="ref-item">
          <strong>Sentence Variance (CV):</strong> Measures the standard
          deviation of sentence lengths relative to the mean, a key marker of
          "natural" writing rhythm vs. robotic uniformity.
        </div>
        <div className="ref-item">
          <strong>Vocabulary & Cohesion:</strong> Based on principles from{" "}
          <em>Coh-Metrix</em> (Graesser, A. C., et al., 2004), analyzing lexical
          diversity (Type-Token Ratio) and connective density.
        </div>
      </div>
    </div>
  );
}
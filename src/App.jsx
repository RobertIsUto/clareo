import React, { useState, useCallback, useMemo } from "react";
import "./App.css";
import { MetricCard } from "./components/MetricCard";
import { TextHighlighter } from "./components/TextHighlighter";
import CalculationDrawer from "./components/CalculationDrawer";
import { runFullAnalysis } from "./utils/textAnalysis";
import { generateAnalysisPDF, generateComparisonPDF, generateMethodologyPDF } from "./utils/pdfGenerator";
import { getWordCount, formatRange, formatWithConfidence, getSignificanceLabel, getZScoreColorClass } from "./utils/textHelpers";
import { THRESHOLDS, STATISTICAL_THRESHOLDS, COMPOSITE_SCORE_WEIGHTS, STYLE_CHANGE_FLAGS } from "./constants/thresholds";
import { calculateMetricStatistics, calculateZScore, isStatisticallySignificant, detectOutliers } from "./utils/statisticalAnalysis";
import { buildVocabularyProfile, compareVocabularyProfiles, extractVocabularyProfile } from "./utils/vocabularyFingerprint";
import { buildSyntacticProfile, compareSyntacticProfiles, analyzeSentenceStructure } from "./utils/syntacticAnalysis";
import { buildErrorProfile, compareErrorProfiles, detectErrorPatterns } from "./utils/errorDetection";

export default function App() {
  const [activeSection, setActiveSection] = useState("analysis");
  const [analysisText, setAnalysisText] = useState("");
  const [results, setResults] = useState(null);
  const [highlightMode, setHighlightMode] = useState("none");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [baselineInput, setBaselineInput] = useState("");
  const [assignmentType, setAssignmentType] = useState("essay");
  const [baselineSamples, setBaselineSamples] = useState([]);
  const [comparisonText, setComparisonText] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);

  // Calculation drawer state (for comparison section)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMetric, setDrawerMetric] = useState(null); // null = composite, string = metric key

  // Analysis drawer state (for analysis section)
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [analysisDrawerMetric, setAnalysisDrawerMetric] = useState(null);

  const wordCount = useMemo(() => getWordCount(analysisText), [analysisText]);

  const handleAnalyze = useCallback(() => {
    if (!analysisText.trim()) return;
    try {
      setResults(runFullAnalysis(analysisText));
      setHighlightMode("none");
    } catch (error) {
      alert(error.message);
    }
  }, [analysisText]);

  const addBaselineSample = useCallback(() => {
    if (!baselineInput.trim()) return;
    const analysis = runFullAnalysis(baselineInput);

    if (analysis.vocabulary.totalWords < THRESHOLDS.MIN_WORDS) {
      if (!window.confirm("This sample is very short (<100 words) and might skew your baseline data. Add it anyway?")) {
        return;
      }
    }

    setBaselineSamples(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fullText: baselineInput,
        preview: baselineInput.slice(0, 50) + "...",
        data: analysis,
        metadata: {
          wordCount: analysis.vocabulary.totalWords,
          dateAdded: new Date().toISOString(),
          assignmentType: assignmentType,
          isOutlier: false
        }
      },
    ]);
    setBaselineInput("");
  }, [baselineInput, assignmentType]);

  const removeBaseline = useCallback((id) => {
    setBaselineSamples(prev => prev.filter((s) => s.id !== id));
  }, []);

  /**
   * Build comprehensive student writing profile from baseline samples
   * Includes statistical analysis for all metrics plus vocabulary, syntax, and error patterns
   */
  const buildStudentProfile = useCallback((samples) => {
    if (!samples || samples.length === 0) {
      return null;
    }

    const metrics = {};
    const metricKeys = [
      { key: 'grade', accessor: (s) => parseFloat(s.data.readability.grade) },
      { key: 'cv', accessor: (s) => parseFloat(s.data.variation.cv) },
      { key: 'sTTR', accessor: (s) => parseFloat(s.data.vocabulary.sTTR) },
      { key: 'sophistication', accessor: (s) => parseFloat(s.data.vocabulary.sophisticationRatio) },
      { key: 'formalWeight', accessor: (s) => s.data.formalRegister?.totalWeight || 0 },
      { key: 'predictability', accessor: (s) => parseFloat(s.data.ngrams?.predictabilityScore || 0) },
      { key: 'coherence', accessor: (s) => parseFloat(s.data.paragraphs?.coherenceScore || 0) },
      { key: 'passiveRatio', accessor: (s) => parseFloat(s.data.passive?.ratio || 0) },
      { key: 'avgSentenceLength', accessor: (s) => parseFloat(s.data.sentenceStats?.mean || 0) },
      { key: 'totalWords', accessor: (s) => s.data.vocabulary.totalWords }
    ];

    metricKeys.forEach(({ key, accessor }) => {
      const values = samples.map(accessor);
      metrics[key] = calculateMetricStatistics(values);
    });

    const texts = samples.map(s => s.fullText);
    const vocabulary = buildVocabularyProfile(texts);
    const syntactic = buildSyntacticProfile(texts);
    const errors = buildErrorProfile(texts);

    const outlierSamples = detectOutliers(
      samples.map(s => ({ id: s.id, value: s.data.vocabulary.totalWords })),
      'iqr'
    );

    const overallVariance = Object.values(metrics).reduce((sum, m) => {
      return sum + (m.stdDev / (m.mean || 1));
    }, 0) / Object.keys(metrics).length;

    const confidenceScore = Math.max(0, Math.min(100,
      100 - (overallVariance * 10) - (outlierSamples.length * 5)
    ));

    return {
      metrics,
      vocabulary,
      syntactic,
      errors,
      reliability: {
        sampleCount: samples.length,
        overallVariance: overallVariance.toFixed(2),
        confidenceScore: confidenceScore.toFixed(0),
        outlierCount: outlierSamples.length,
        outlierIds: outlierSamples
      }
    };
  }, []);

  /**
   * Calculate metric deviations with z-scores and significance levels
   */
  const calculateMetricDeviations = useCallback((baselineMetrics, currentAnalysis) => {
    const deviations = [];

    const metricMapping = [
      { key: 'grade', label: 'Grade Level', accessor: (c) => parseFloat(c.readability.grade), suffix: '' },
      { key: 'cv', label: 'Sentence Variation', accessor: (c) => parseFloat(c.variation.cv), suffix: '%' },
      { key: 'sTTR', label: 'Vocabulary Variety', accessor: (c) => parseFloat(c.vocabulary.sTTR), suffix: '%' },
      { key: 'sophistication', label: 'Sophistication', accessor: (c) => parseFloat(c.vocabulary.sophisticationRatio), suffix: '%' },
      { key: 'formalWeight', label: 'Formulaic Weight', accessor: (c) => c.formalRegister?.totalWeight || 0, suffix: '' },
      { key: 'predictability', label: 'Predictability', accessor: (c) => parseFloat(c.ngrams?.predictabilityScore || 0), suffix: '%' },
      { key: 'coherence', label: 'Coherence', accessor: (c) => parseFloat(c.paragraphs?.coherenceScore || 0), suffix: '%' },
      { key: 'passiveRatio', label: 'Passive Voice', accessor: (c) => parseFloat(c.passive?.ratio || 0), suffix: '%' },
      { key: 'avgSentenceLength', label: 'Avg Sentence Length', accessor: (c) => parseFloat(c.sentenceStats?.mean || 0), suffix: '' }
    ];

    metricMapping.forEach(({ key, label, accessor, suffix }) => {
      const baseline = baselineMetrics[key];
      if (!baseline) return;

      const currentValue = accessor(currentAnalysis);
      const diff = currentValue - baseline.mean;
      const zScore = calculateZScore(currentValue, baseline.mean, baseline.stdDev);
      const significance = isStatisticallySignificant(diff, baseline.stdDev, STATISTICAL_THRESHOLDS.SIGNIFICANCE_LEVELS.MEDIUM);

      deviations.push({
        key,
        label,
        baselineMean: baseline.mean,
        baselineStdDev: baseline.stdDev,
        baselineMin: baseline.min,
        baselineMax: baseline.max,
        currentValue,
        diff,
        zScore,
        significance: significance.level,
        isSignificant: significance.significant,
        suffix,
        colorClass: getZScoreColorClass(zScore),
        significanceLabel: getSignificanceLabel(zScore)
      });
    });

    return deviations;
  }, []);

  /**
   * Calculate composite consistency score (0-100)
   * Higher scores indicate better consistency with baseline
   */
  const calculateCompositeScore = useCallback((metricDeviations, vocabComparison, syntaxComparison, errorComparison) => {
    // Calculate RMS (Root Mean Square) of z-scores to avoid unfair accumulation across many metrics
    const significantDeviations = metricDeviations.filter(d => d.isSignificant);
    const zScores = metricDeviations.map(d => d.zScore);
    const rmsZScore = Math.sqrt(zScores.reduce((sum, z) => sum + z * z, 0) / zScores.length);

    // Use statistically grounded smooth decay instead of arbitrary multipliers
    // This maps Z-scores to scores: 0→100, 1→80, 2→50, 3→30
    const metricScore = 100 / (1 + Math.pow(rmsZScore / 2, 2));

    const vocabScore = vocabComparison.overlapScore || 50;

    // Apply same statistical decay to syntax deviation (which is already a Z-score-like measure)
    const syntaxScore = 100 / (1 + Math.pow(syntaxComparison.overallDeviation / 2, 2));

    // Error consistency - penalize suspiciously clean proportionally
    const errorScore = errorComparison.suspiciouslyClean
      ? Math.max(40, 100 - (Math.abs(errorComparison.cleanlinessChange) * 1.5))  // Bigger penalty but proportional
      : Math.max(0, 100 - (Math.abs(errorComparison.cleanlinessChange) * 0.8));

    let specialPenalty = 0;
    if (errorComparison.suspiciouslyClean) {
      specialPenalty += 10;
    }
    if (significantDeviations.length >= 3) {
      // Scale penalty with number of deviations, capped at 20
      const deviationPenalty = Math.min(20, significantDeviations.length * 5);
      specialPenalty += deviationPenalty;
    }

    const compositeScore = (
      metricScore * COMPOSITE_SCORE_WEIGHTS.METRIC_DEVIATIONS +
      vocabScore * COMPOSITE_SCORE_WEIGHTS.VOCABULARY_OVERLAP +
      syntaxScore * COMPOSITE_SCORE_WEIGHTS.SYNTACTIC_PATTERNS +
      errorScore * COMPOSITE_SCORE_WEIGHTS.ERROR_CONSISTENCY
    ) - specialPenalty;

    return Math.max(0, Math.min(100, compositeScore));
  }, []);

  /**
   * Generate style change flags based on analysis
   */
  const generateStyleChangeFlags = useCallback((metricDeviations, vocabComparison, syntaxComparison, errorComparison, reliability) => {
    const flags = [];

    if (errorComparison.suspiciouslyClean) {
      flags.push({
        type: 'SUSPICIOUSLY_CLEAN',
        severity: 'high',
        message: STYLE_CHANGE_FLAGS.SUSPICIOUSLY_CLEAN.message,
        detail: errorComparison.confidenceNote
      });
    }

    if (vocabComparison.overlapScore < STYLE_CHANGE_FLAGS.VOCABULARY_SHIFT.threshold) {
      flags.push({
        type: 'VOCABULARY_SHIFT',
        severity: 'medium',
        message: STYLE_CHANGE_FLAGS.VOCABULARY_SHIFT.message,
        detail: `Vocabulary overlap: ${vocabComparison.overlapScore.toFixed(0)}%`
      });
    }

    const significantDeviations = metricDeviations.filter(d => d.isSignificant);
    if (significantDeviations.length >= STYLE_CHANGE_FLAGS.MULTIPLE_DEVIATIONS.threshold) {
      flags.push({
        type: 'MULTIPLE_DEVIATIONS',
        severity: 'high',
        message: STYLE_CHANGE_FLAGS.MULTIPLE_DEVIATIONS.message,
        detail: `${significantDeviations.length} metrics showing significant deviations`
      });
    }

    if (syntaxComparison.overallDeviation >= STYLE_CHANGE_FLAGS.SYNTACTIC_SHIFT.threshold) {
      flags.push({
        type: 'SYNTACTIC_SHIFT',
        severity: 'medium',
        message: STYLE_CHANGE_FLAGS.SYNTACTIC_SHIFT.message,
        detail: `Syntactic deviation score: ${syntaxComparison.overallDeviation.toFixed(2)}`
      });
    }

    const sophisticationDeviation = metricDeviations.find(d => d.key === 'sophistication');
    if (sophisticationDeviation && sophisticationDeviation.zScore >= STYLE_CHANGE_FLAGS.SOPHISTICATION_JUMP.threshold) {
      flags.push({
        type: 'SOPHISTICATION_JUMP',
        severity: 'medium',
        message: STYLE_CHANGE_FLAGS.SOPHISTICATION_JUMP.message,
        detail: `Z-score: ${sophisticationDeviation.zScore.toFixed(2)}`
      });
    }

    const formulaicDeviation = metricDeviations.find(d => d.key === 'formalWeight');
    if (formulaicDeviation && formulaicDeviation.zScore >= STYLE_CHANGE_FLAGS.FORMULAIC_INCREASE.threshold) {
      flags.push({
        type: 'FORMULAIC_INCREASE',
        severity: 'low',
        message: STYLE_CHANGE_FLAGS.FORMULAIC_INCREASE.message,
        detail: `Formulaic weight increased by ${formulaicDeviation.diff.toFixed(1)}`
      });
    }

    return flags;
  }, []);

  /**
   * Run comprehensive comparison analysis
   */
  const runComparison = useCallback(() => {
    if (baselineSamples.length < STATISTICAL_THRESHOLDS.MIN_BASELINE_SAMPLES || !comparisonText.trim()) return;

    const current = runFullAnalysis(comparisonText);

    const profile = buildStudentProfile(baselineSamples);

    if (!profile) {
      alert("Unable to build student profile. Please ensure baseline samples are valid.");
      return;
    }

    const currentVocabProfile = extractVocabularyProfile(comparisonText);
    const vocabComparison = compareVocabularyProfiles(profile.vocabulary, currentVocabProfile);

    const currentSyntaxAnalysis = analyzeSentenceStructure(comparisonText);
    const syntaxComparison = compareSyntacticProfiles(profile.syntactic, currentSyntaxAnalysis);

    const currentErrorAnalysis = detectErrorPatterns(comparisonText);
    const errorComparison = compareErrorProfiles(profile.errors, currentErrorAnalysis);

    const metricDeviations = calculateMetricDeviations(profile.metrics, current);

    const consistencyScore = calculateCompositeScore(
      metricDeviations,
      vocabComparison,
      syntaxComparison,
      errorComparison
    );

    const flags = generateStyleChangeFlags(
      metricDeviations,
      vocabComparison,
      syntaxComparison,
      errorComparison,
      profile.reliability
    );

    setComparisonResult({
      profile,
      current,
      metricDeviations,
      vocabComparison,
      syntaxComparison,
      errorComparison,
      consistencyScore,
      flags
    });
  }, [baselineSamples, comparisonText, buildStudentProfile, calculateMetricDeviations, calculateCompositeScore, generateStyleChangeFlags]);

  /**
   * Click handlers for calculation drawer
   */
  const handleMetricClick = useCallback((metricKey) => {
    setDrawerMetric(metricKey);
    setDrawerOpen(true);
  }, []);

  const handleCompositeClick = useCallback(() => {
    setDrawerMetric(null); // null indicates composite score
    setDrawerOpen(true);
  }, []);

  /**
   * Click handlers for analysis drawer
   */
  const handleAnalysisMetricClick = useCallback((metricKey) => {
    setAnalysisDrawerMetric(metricKey);
    setAnalysisDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setAnalysisDrawerOpen(false);
  }, []);

  return (
    <div className="clareo-app">
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
          <AnalysisSection
            analysisText={analysisText}
            setAnalysisText={setAnalysisText}
            wordCount={wordCount}
            handleAnalyze={handleAnalyze}
            results={results}
            highlightMode={highlightMode}
            setHighlightMode={setHighlightMode}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            onMetricClick={handleAnalysisMetricClick}
          />
        )}

        {activeSection === "compare" && (
          <ComparisonSection
            baselineInput={baselineInput}
            setBaselineInput={setBaselineInput}
            assignmentType={assignmentType}
            setAssignmentType={setAssignmentType}
            addBaselineSample={addBaselineSample}
            baselineSamples={baselineSamples}
            removeBaseline={removeBaseline}
            comparisonText={comparisonText}
            setComparisonText={setComparisonText}
            runComparison={runComparison}
            comparisonResult={comparisonResult}
            onCompositeClick={handleCompositeClick}
            onMetricClick={handleMetricClick}
          />
        )}
      </div>

      <References />

      {/* Calculation Drawer - Comparison Mode */}
      <CalculationDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        metricKey={drawerMetric}
        comparisonResult={comparisonResult}
        baselineSamples={baselineSamples}
      />

      {/* Calculation Drawer - Analysis Mode */}
      <CalculationDrawer
        isOpen={analysisDrawerOpen}
        onClose={handleDrawerClose}
        metricKey={analysisDrawerMetric}
        analysisResults={results}
      />
    </div>
  );
}

function AnalysisSection({ analysisText, setAnalysisText, wordCount, handleAnalyze, results, highlightMode, setHighlightMode, showAdvanced, setShowAdvanced, onMetricClick }) {
  return (
    <div className="grid">
      <div className="panel">
        <h2>Analyze Student Text</h2>
        <textarea
          placeholder="Paste student text here..."
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAnalyze();
            }
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {wordCount} words
          </span>
          <button className="btn" onClick={handleAnalyze} disabled={!analysisText.trim()}>
            Run Analysis
          </button>
        </div>

        {results && results.vocabulary.totalWords < THRESHOLDS.MIN_WORDS && (
          <div className="warning-box" style={{ marginTop: "1rem" }}>
            <strong>Short Text Warning:</strong> This text is under 100 words. Metrics may be unreliable.
          </div>
        )}
      </div>

      <div className="panel">
        {!results ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: "5rem" }}>
            Enter text and analyze to see metrics.
          </div>
        ) : (
          <ResultsDisplay
            results={results}
            highlightMode={highlightMode}
            setHighlightMode={setHighlightMode}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
          />
        )}
      </div>
    </div>
  );
}

function ResultsDisplay({ results, highlightMode, setHighlightMode, showAdvanced, setShowAdvanced }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Analysis Results</h2>
        <button
          className="btn btn-outline btn-small"
          onClick={() => generateAnalysisPDF(results)}
        >
          Download PDF
        </button>
      </div>

      <div className="metrics-row metrics-row-5">
        <MetricCard
          value={results.readability.grade}
          label="Grade Level"
          tooltip="Flesch-Kincaid Grade Level"
          clickable={true}
          onClick={() => onMetricClick('gradeLevel')}
        />
        <MetricCard
          value={results.variation.cv + "%"}
          label="Sentence Var"
          sublabel="Low < 25%"
          tooltip="Coefficient of Variation in sentence length"
          clickable={true}
          onClick={() => onMetricClick('sentenceVariance')}
        />
        <MetricCard
          value={results.vocabulary.sTTR + "%"}
          label="Vocab Variety"
          sublabel="MSTTR"
          tooltip="Mean-Segmental Type-Token Ratio"
          clickable={true}
          onClick={() => onMetricClick('vocabVariety')}
        />
        <MetricCard
          value={results.formalRegister.totalWeight}
          label="Formulaic"
          sublabel={results.formalRegister.totalCount + " phrases"}
          warning={results.formalRegister.totalWeight > THRESHOLDS.HIGH_FORMULAIC ? "High" : null}
          tooltip="Weighted score of formulaic/stock phrases"
          clickable={true}
          onClick={() => onMetricClick('formulaic')}
        />
        <MetricCard
          value={results.ngrams.predictabilityScore + "%"}
          label="Predictability"
          sublabel="N-gram score"
          warning={parseInt(results.ngrams.predictabilityScore) > THRESHOLDS.HIGH_PREDICTABILITY ? "Elevated" : null}
          tooltip="Based on common formulaic n-gram patterns"
          clickable={true}
          onClick={() => onMetricClick('predictability')}
        />
      </div>

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
        {[
          { mode: "none", label: "None" },
          { mode: "formal", label: "Formulaic (" + results.formalRegister.totalCount + ")" },
          { mode: "ngrams", label: "N-grams (" + (results.ngrams.bigrams.count + results.ngrams.trigrams.count) + ")" },
          { mode: "passive", label: "Passive (" + results.passive.count + ")" },
          { mode: "connectives", label: "Connectives (" + results.connectives.total + ")" },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            className={"highlighter-btn" + (highlightMode === mode ? " active" : "")}
            onClick={() => setHighlightMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      <TextHighlighter text={results.text} mode={highlightMode} />

      <AdvancedSection results={results} showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced} />

      <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
        <strong>Interpretation:</strong>
        {parseFloat(results.variation.cv) < THRESHOLDS.LOW_CV
          ? " Uniform sentence lengths suggest robotic rhythm."
          : " Natural variation in sentence length."}
        {parseInt(results.ngrams.predictabilityScore) > THRESHOLDS.HIGH_PREDICTABILITY
          ? " Elevated predictability from common formulaic patterns."
          : ""}
        {results.formalRegister.severity.high > THRESHOLDS.HIGH_SEVERITY_THRESHOLD
          ? " Multiple high-severity stock phrases detected."
          : ""}
      </div>
    </>
  );
}

function AdvancedSection({ results, showAdvanced, setShowAdvanced }) {
  return (
    <div className="advanced-section">
      <button className="toggle-advanced" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? "▼" : "▶"} Advanced Analysis
      </button>

      {showAdvanced && (
        <>
          <h3>Paragraph Flow</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <MetricCard value={results.paragraphs.count} label="Paragraphs" />
            <MetricCard value={results.paragraphs.coherenceScore + "%"} label="Coherence" />
            <MetricCard value={results.paragraphs.transitionRate + "%"} label="Transition Rate" />
          </div>

          <div className="paragraph-grid">
            {results.paragraphs.paragraphDetails.map((p) => (
              <div key={p.index} className={"para-block" + (p.hasTransition ? " has-transition" : "")} title={"Opens: \"" + p.openingWords + "...\""}>
                <div style={{ fontWeight: "bold" }}>¶{p.index}</div>
                <div>{p.sentenceCount}s / {p.wordCount}w</div>
              </div>
            ))}
          </div>

          {(results.ngrams.trigrams.found.length > 0 || results.ngrams.bigrams.found.length > 0) && (
            <>
              <h3>Common N-gram Patterns</h3>
              <div className="ngram-list">
                {results.ngrams.trigrams.found.slice(0, 5).map((ng, i) => (
                  <span key={"tri-" + i} className="ngram-tag">{ng.phrase} x{ng.count}</span>
                ))}
                {results.ngrams.bigrams.found.slice(0, 5).map((ng, i) => (
                  <span key={"bi-" + i} className="ngram-tag">{ng.phrase} x{ng.count}</span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ComparisonSection({ baselineInput, setBaselineInput, assignmentType, setAssignmentType, addBaselineSample, baselineSamples, removeBaseline, comparisonText, setComparisonText, runComparison, comparisonResult, onCompositeClick, onMetricClick }) {
  const profileQuality = useMemo(() => {
    if (baselineSamples.length === 0) return null;

    if (baselineSamples.length >= STATISTICAL_THRESHOLDS.STRONG_BASELINE_SAMPLES) {
      return { level: 'excellent', color: 'var(--success)', label: 'Excellent' };
    } else if (baselineSamples.length >= STATISTICAL_THRESHOLDS.RECOMMENDED_BASELINE_SAMPLES) {
      return { level: 'good', color: 'var(--info)', label: 'Good' };
    } else if (baselineSamples.length >= STATISTICAL_THRESHOLDS.ZSCORE_THRESHOLD_SAMPLES) {
      return { level: 'adequate', color: 'var(--warning)', label: 'Adequate' };
    } else if (baselineSamples.length >= STATISTICAL_THRESHOLDS.MIN_BASELINE_SAMPLES) {
      return { level: 'limited', color: 'var(--caution)', label: 'Limited' };
    }
    return { level: 'insufficient', color: 'var(--error)', label: 'Insufficient' };
  }, [baselineSamples.length]);

  return (
    <div className="grid">
      <div className="panel">
        <h2>1. Build Student Profile</h2>

        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Add past assignments to build a writing profile. The more samples you provide, the more accurate the analysis.
        </p>

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
            Assignment Type
          </label>
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid var(--border-medium)",
              fontSize: "0.875rem",
              backgroundColor: "white",
              color: "var(--text-primary)"
            }}
          >
            <option value="essay">Essay</option>
            <option value="creative">Creative Writing</option>
            <option value="lab-report">Lab Report</option>
            <option value="response">Response Paper</option>
            <option value="research">Research Paper</option>
            <option value="other">Other</option>
          </select>
        </div>

        <textarea
          style={{ minHeight: "100px" }}
          placeholder="Paste a past assignment here..."
          value={baselineInput}
          onChange={(e) => setBaselineInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              addBaselineSample();
            }
          }}
        />
        <button className="btn btn-outline btn-small" onClick={addBaselineSample} disabled={!baselineInput.trim()}>
          Add Sample
        </button>

        {profileQuality && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "8px",
            border: `2px solid ${profileQuality.color}`,
            backgroundColor: `${profileQuality.color}15`,
            fontSize: "0.875rem"
          }}>
            <strong>Profile Quality: {profileQuality.label}</strong>
            {baselineSamples.length < STATISTICAL_THRESHOLDS.ZSCORE_THRESHOLD_SAMPLES && (
              <div style={{ marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                Add more samples to enable advanced statistical analysis
              </div>
            )}
            {baselineSamples.length >= STATISTICAL_THRESHOLDS.ZSCORE_THRESHOLD_SAMPLES && baselineSamples.length < STATISTICAL_THRESHOLDS.STRONG_BASELINE_SAMPLES && (
              <div style={{ marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                Adding more samples will continue to improve accuracy
              </div>
            )}
          </div>
        )}

        <div className="baseline-list" style={{ marginTop: "1.5rem" }}>
          {baselineSamples.map((s, i) => (
            <div key={s.id} className="baseline-item">
              <div style={{ flex: 1 }}>
                <div>Sample {i + 1} ({s.metadata.wordCount} words)</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {s.metadata.assignmentType} • {new Date(s.metadata.dateAdded).toLocaleDateString()}
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeBaseline(s.id)}>×</button>
            </div>
          ))}
          {baselineSamples.length === 0 && (
            <div style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No samples added yet</div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>2. Compare New Work</h2>
        <textarea
          style={{ minHeight: "100px" }}
          placeholder="Paste the new text under review..."
          value={comparisonText}
          onChange={(e) => setComparisonText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (baselineSamples.length >= STATISTICAL_THRESHOLDS.MIN_BASELINE_SAMPLES && comparisonText.trim()) {
                runComparison();
              }
            }
          }}
        />
        <button
          className="btn"
          onClick={runComparison}
          disabled={baselineSamples.length < STATISTICAL_THRESHOLDS.MIN_BASELINE_SAMPLES || !comparisonText.trim()}
        >
          Compare vs Profile
        </button>

        {comparisonResult && <ComparisonResults comparisonResult={comparisonResult} baselineSamples={baselineSamples} onCompositeClick={onCompositeClick} onMetricClick={onMetricClick} />}
      </div>
    </div>
  );
}

function ComparisonResults({ comparisonResult, baselineSamples, onCompositeClick, onMetricClick }) {
  const { consistencyScore, flags, metricDeviations, profile } = comparisonResult;

  const getScoreColor = (score) => {
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.EXCELLENT) return 'var(--success)';
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.GOOD) return 'var(--info)';
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.MODERATE) return 'var(--warning)';
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.CONCERNING) return 'var(--caution)';
    return 'var(--error)';
  };

  const getScoreLabel = (score) => {
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.EXCELLENT) return 'Highly Consistent';
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.GOOD) return 'Generally Consistent';
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.MODERATE) return 'Noticeable Deviation';
    if (score >= STATISTICAL_THRESHOLDS.CONSISTENCY_SCORE_RANGES.CONCERNING) return 'Significant Deviation';
    return 'Dramatic Change';
  };

  return (
    <>
      <div
        className="clickable-score-card"
        onClick={() => onCompositeClick && onCompositeClick()}
        style={{
          marginTop: "1.5rem",
          padding: "1.5rem",
          borderRadius: "12px",
          border: `2px solid ${getScoreColor(consistencyScore)}`,
          backgroundColor: `${getScoreColor(consistencyScore)}10`
        }}
      >
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          Style Consistency Score
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: "700", color: getScoreColor(consistencyScore) }}>
            {consistencyScore.toFixed(0)}
          </div>
          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: "600" }}>{getScoreLabel(consistencyScore)}</div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Based on {baselineSamples.length} baseline sample(s)
            </div>
          </div>
        </div>
        <div style={{
          height: "8px",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: "4px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${consistencyScore}%`,
            height: "100%",
            backgroundColor: getScoreColor(consistencyScore),
            transition: "width 0.3s ease"
          }}></div>
        </div>
      </div>

      {flags.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Style Change Indicators</h3>
          {flags.map((flag, idx) => (
            <div key={idx} style={{
              padding: "0.75rem 1rem",
              marginBottom: "0.75rem",
              borderRadius: "8px",
              border: `1px solid ${flag.severity === 'high' ? 'var(--error)' : flag.severity === 'medium' ? 'var(--warning)' : 'var(--info)'}`,
              backgroundColor: `${flag.severity === 'high' ? 'var(--error)' : flag.severity === 'medium' ? 'var(--warning)' : 'var(--info)'}10`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  color: flag.severity === 'high' ? 'var(--error)' : flag.severity === 'medium' ? 'var(--warning)' : 'var(--info)'
                }}>
                  {flag.severity}
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>{flag.message}</span>
              </div>
              {flag.detail && (
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{flag.detail}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <EnhancedComparisonTable comparisonResult={comparisonResult} baselineSamples={baselineSamples} onMetricClick={onMetricClick} />

      <div style={{ marginTop: "1rem", background: "rgba(74, 144, 164, 0.1)", padding: "1rem", borderRadius: "10px", fontSize: "0.875rem" }}>
        <strong>Analysis Note:</strong> This tool detects changes in writing style patterns. Deviations may indicate natural improvement, outside assistance, or use of writing tools. Use results as a starting point for conversation, not definitive proof.
      </div>

      <button
        className="btn btn-outline btn-small"
        onClick={() => {
          // Extract baseline means from profile metrics for PDF generator
          const baseline = {};
          const metrics = comparisonResult.profile.metrics;
          Object.keys(metrics).forEach(key => {
            baseline[key] = metrics[key].mean;
          });

          const pdfData = {
            baseline,
            current: comparisonResult.current
          };

          generateComparisonPDF(pdfData, baselineSamples.length);
        }}
        style={{ marginTop: "1rem" }}
      >
        Download Comparison PDF
      </button>
    </>
  );
}

function EnhancedComparisonTable({ comparisonResult, baselineSamples, onMetricClick }) {
  const { metricDeviations } = comparisonResult;
  const showZScores = baselineSamples.length >= STATISTICAL_THRESHOLDS.ZSCORE_THRESHOLD_SAMPLES;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Detailed Metric Analysis</h3>
      <table className="comp-table enhanced-comp-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Baseline Range</th>
            <th>Current</th>
            {showZScores && <th>Z-Score</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {metricDeviations.map((deviation) => (
            <tr
              key={deviation.key}
              className="clickable-metric-row"
              onClick={() => onMetricClick && onMetricClick(deviation.key)}
              title="Click to see how this metric is calculated"
            >
              <td>{deviation.label}</td>
              <td>
                {formatRange(deviation.baselineMin, deviation.baselineMax, 1, deviation.suffix)}
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {formatWithConfidence(deviation.baselineMean, deviation.baselineStdDev, 1, deviation.suffix)}
                </div>
              </td>
              <td style={{ fontWeight: "600" }}>
                {deviation.currentValue.toFixed(1)}{deviation.suffix}
              </td>
              {showZScores && (
                <td style={{ fontWeight: "600" }}>
                  {deviation.zScore.toFixed(2)}
                </td>
              )}
              <td>
                <span className={`significance-badge ${deviation.colorClass}`}>
                  {deviation.significanceLabel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
        {showZScores ? (
          <>
            <strong>Legend:</strong> Z-score indicates how many standard deviations the current value is from baseline mean.
            Absolute z-scores above 1.5 warrant attention, above 2.0 are highly significant.
          </>
        ) : (
          <>
            <strong>Note:</strong> Z-scores will be displayed when you have {STATISTICAL_THRESHOLDS.ZSCORE_THRESHOLD_SAMPLES}+ baseline samples for more reliable statistical analysis.
          </>
        )}
      </div>
    </div>
  );
}

function References() {
  return (
    <div className="references">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>Methodology & Academic References</h3>
        <button
          className="btn btn-outline btn-small"
          onClick={generateMethodologyPDF}
        >
          Full Math Documentation
        </button>
      </div>
      <div className="ref-item">
        <strong>Readability:</strong> Flesch, R. (1948). <em>A new readability yardstick.</em> / Kincaid, J. P., et al. (1975). <em>Derivation of new readability formulas.</em>
      </div>
      <div className="ref-item">
        <strong>Sentence Variance (CV):</strong> Coefficient of variation in sentence lengths measuring natural vs. algorithmic writing rhythm.
      </div>
      <div className="ref-item">
        <strong>Vocabulary & Cohesion:</strong> Based on <em>Coh-Metrix</em> (Graesser, A. C., et al., 2004), analyzing lexical diversity and connective density.
      </div>
      <div className="ref-item">
        <strong>N-gram Analysis:</strong> Detection of predictable phrase patterns common in template-driven or formulaic writing.
      </div>
      <div className="ref-item">
        <strong>Statistical Methods:</strong> Z-score analysis and standard deviation calculations for measuring deviation from established writing patterns.
      </div>
    </div>
  );
}

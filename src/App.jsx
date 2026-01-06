import React, { useState, useCallback, useMemo } from "react";
import "./App.css";
import { MetricCard } from "./components/MetricCard";
import { TextHighlighter } from "./components/TextHighlighter";
import { PhraseSuggestions } from "./components/PhraseSuggestions";
import { runFullAnalysis } from "./utils/textAnalysis";
import { generateAnalysisPDF, generateComparisonPDF } from "./utils/pdfGenerator";
import { getWordCount } from "./utils/textHelpers";
import { THRESHOLDS } from "./constants/thresholds";

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
        id: Date.now(),
        text: baselineInput.slice(0, 50) + "...",
        data: analysis,
      },
    ]);
    setBaselineInput("");
  }, [baselineInput]);

  const removeBaseline = useCallback((id) => {
    setBaselineSamples(prev => prev.filter((s) => s.id !== id));
  }, []);

  const runComparison = useCallback(() => {
    if (baselineSamples.length === 0 || !comparisonText.trim()) return;

    const current = runFullAnalysis(comparisonText);

    const profile = {
      grade: 0, cv: 0, sTTR: 0, sophistication: 0,
      formalWeight: 0, predictability: 0, coherence: 0,
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
  }, [baselineSamples, comparisonText]);

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
          />
        )}

        {activeSection === "compare" && (
          <ComparisonSection 
            baselineInput={baselineInput}
            setBaselineInput={setBaselineInput}
            addBaselineSample={addBaselineSample}
            baselineSamples={baselineSamples}
            removeBaseline={removeBaseline}
            comparisonText={comparisonText}
            setComparisonText={setComparisonText}
            runComparison={runComparison}
            comparisonResult={comparisonResult}
          />
        )}
      </div>

      <References />
    </div>
  );
}

function AnalysisSection({ analysisText, setAnalysisText, wordCount, handleAnalyze, results, highlightMode, setHighlightMode, showAdvanced, setShowAdvanced }) {
  return (
    <div className="grid">
      <div className="panel">
        <h2>Analyze Student Text</h2>
        <textarea
          placeholder="Paste student text here..."
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
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
          value={results.variation.cv + "%"}
          label="Sentence Var"
          sublabel="Low < 25%"
          tooltip="Coefficient of Variation in sentence length"
        />
        <MetricCard
          value={results.vocabulary.sTTR + "%"}
          label="Vocab Variety"
          sublabel="MSTTR"
          tooltip="Mean-Segmental Type-Token Ratio"
        />
        <MetricCard
          value={results.formalRegister.totalWeight}
          label="Formulaic"
          sublabel={results.formalRegister.totalCount + " phrases"}
          warning={results.formalRegister.totalWeight > THRESHOLDS.HIGH_FORMULAIC ? "High" : null}
          tooltip="Weighted score of formulaic/stock phrases"
        />
        <MetricCard
          value={results.ngrams.predictabilityScore + "%"}
          label="Predictability"
          sublabel="N-gram score"
          warning={parseInt(results.ngrams.predictabilityScore) > THRESHOLDS.HIGH_PREDICTABILITY ? "Elevated" : null}
          tooltip="Based on common formulaic n-gram patterns"
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

      <PhraseSuggestions phrases={results.formalPhrases} />

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
                  <span key={"tri-" + i} className="ngram-tag">{ng.phrase} ×{ng.count}</span>
                ))}
                {results.ngrams.bigrams.found.slice(0, 5).map((ng, i) => (
                  <span key={"bi-" + i} className="ngram-tag">{ng.phrase} ×{ng.count}</span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ComparisonSection({ baselineInput, setBaselineInput, addBaselineSample, baselineSamples, removeBaseline, comparisonText, setComparisonText, runComparison, comparisonResult }) {
  return (
    <div className="grid">
      <div className="panel">
        <h2>1. Build Student Profile</h2>
        
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Add 3+ past assignments to create a reliable baseline average.
        </p>

        <textarea
          style={{ minHeight: "100px" }}
          placeholder="Paste a past assignment here..."
          value={baselineInput}
          onChange={(e) => setBaselineInput(e.target.value)}
        />
        <button className="btn btn-outline btn-small" onClick={addBaselineSample} disabled={!baselineInput.trim()}>
          + Add Sample
        </button>

        <div className="baseline-list" style={{ marginTop: "1.5rem" }}>
          {baselineSamples.map((s, i) => (
            <div key={s.id} className="baseline-item">
              <span>Sample {i + 1} ({s.data.vocabulary.totalWords} words)</span>
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
        />
        <button
          className="btn"
          onClick={runComparison}
          disabled={baselineSamples.length === 0 || !comparisonText.trim()}
        >
          Compare vs Profile
        </button>

        {comparisonResult && <ComparisonTable comparisonResult={comparisonResult} baselineSamples={baselineSamples} />}
      </div>
    </div>
  );
}

function ComparisonTable({ comparisonResult, baselineSamples }) {
  const metrics = [
    { lbl: "Grade Level", key: "grade", suffix: "", accessor: (c) => c.readability.grade },
    { lbl: "Sentence Var (CV)", key: "cv", suffix: "%", accessor: (c) => c.variation.cv },
    { lbl: "Vocab (sTTR)", key: "sTTR", suffix: "%", accessor: (c) => c.vocabulary.sTTR },
    { lbl: "Sophistication", key: "sophistication", suffix: "%", accessor: (c) => c.vocabulary.sophisticationRatio },
    { lbl: "Formulaic (wt)", key: "formalWeight", suffix: "", accessor: (c) => c.formalRegister?.totalWeight || 0 },
    { lbl: "Predictability", key: "predictability", suffix: "%", accessor: (c) => c.ngrams?.predictabilityScore || 0 },
    { lbl: "Coherence", key: "coherence", suffix: "%", accessor: (c) => c.paragraphs?.coherenceScore || 0 },
  ];

  return (
    <>
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
          {metrics.map((m) => {
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
                <td className={Math.abs(diff) > THRESHOLDS.SIGNIFICANT_DIFF ? diffClass : ""}>
                  {diff > 0 ? "+" : ""}{diff}{m.suffix}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem", background: "rgba(74, 144, 164, 0.1)", padding: "1rem", borderRadius: "10px", fontSize: "0.875rem" }}>
        <strong>Tip:</strong> Watch for simultaneous jumps in "Formulaic" and "Predictability" combined with drops in "Sentence Var" — these patterns suggest a shift away from the student's natural voice.
      </div>

      <button 
        className="btn btn-outline btn-small" 
        onClick={() => generateComparisonPDF(comparisonResult, baselineSamples.length)}
        style={{ marginTop: "1rem" }}
      >
        ↓ Download Comparison PDF
      </button>
    </>
  );
}

function References() {
  return (
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
  );
}

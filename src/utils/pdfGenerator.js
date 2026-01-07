// HTML sanitization function
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export const generateAnalysisPDF = (results) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups to download the PDF report.');
    return;
  }

  const sanitizedText = sanitizeHTML(results.text.slice(0, 1500));
  const textPreview = sanitizedText + (results.text.length > 1500 ? '...' : '');

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
          <tr>
            <td>${sanitizeHTML(p.phrase)}</td>
            <td>${p.count}</td>
            <td>${p.weight}</td>
            <td>${p.weightedScore}</td>
          </tr>
        `).join('')}
      </table>
      ` : ''}

      ${results.ngrams.trigrams.found.length > 0 || results.ngrams.bigrams.found.length > 0 ? `
      <h2>Common N-gram Patterns</h2>
      <div class="phrase-list">
        ${results.ngrams.trigrams.found.slice(0, 8).map(ng => `<span class="phrase-tag">${sanitizeHTML(ng.phrase)} (×${ng.count})</span>`).join('')}
        ${results.ngrams.bigrams.found.slice(0, 8).map(ng => `<span class="phrase-tag">${sanitizeHTML(ng.phrase)} (×${ng.count})</span>`).join('')}
      </div>
      ` : ''}

      <h2>Analyzed Text (Preview)</h2>
      <div class="text-sample">${textPreview}</div>

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

export const generateMethodologyPDF = () => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups to download the PDF documentation.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Clareo Mathematical Methodology</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono&display=swap');
        body { font-family: 'DM Sans', sans-serif; padding: 40px 60px; color: #2C3E50; max-width: 900px; margin: 0 auto; line-height: 1.7; }
        h1 { color: #00B8D9; border-bottom: 3px solid #00B8D9; padding-bottom: 12px; font-size: 32px; }
        h2 { color: #2C3E50; margin-top: 40px; font-size: 22px; border-bottom: 2px solid #e8f4f8; padding-bottom: 8px; }
        h3 { color: #4A90A4; margin-top: 25px; font-size: 18px; }
        .formula-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #00B8D9; margin: 15px 0; font-family: 'JetBrains Mono', monospace; font-size: 14px; }
        .formula { font-size: 16px; font-weight: 600; color: #2C3E50; margin-bottom: 10px; }
        .variables { margin-top: 10px; font-size: 13px; color: #555; }
        .variable-item { margin-left: 20px; margin-top: 5px; }
        .example { background: #eef7ff; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; }
        .interpretation { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; border-left: 4px solid #ffc107; }
        .code-inline { background: #e8f4f8; padding: 2px 6px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
        .reference { background: #f0f0f0; padding: 12px; border-radius: 5px; margin: 10px 0; font-size: 13px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 13px; }
        th { background: #e8f4f8; font-weight: 600; }
        .toc { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .toc a { color: #00B8D9; text-decoration: none; display: block; padding: 5px 0; }
        .toc a:hover { text-decoration: underline; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #888; }
        @page { margin: 20mm; }
        @media print {
          body { padding: 20px; font-size: 11pt; }
          h1 { font-size: 24pt; }
          h2 { font-size: 18pt; page-break-after: avoid; }
          h3 { font-size: 14pt; page-break-after: avoid; }
          .formula-box, .example, .interpretation { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Clareo: Mathematical Methodology</h1>
      <p style="color: #888; font-size: 14px;">Complete documentation of all statistical formulas and calculations</p>
      <p style="color: #888; font-size: 13px;">Generated: ${new Date().toLocaleString()}</p>

      <div class="toc">
        <strong style="font-size: 16px;">Table of Contents</strong>
        <a href="#readability">1. Readability Metrics</a>
        <a href="#statistics">2. Statistical Measures</a>
        <a href="#vocabulary">3. Vocabulary Analysis</a>
        <a href="#ngrams">4. N-gram Analysis</a>
        <a href="#paragraphs">5. Paragraph Coherence</a>
        <a href="#passive">6. Passive Voice Detection</a>
        <a href="#references">7. Academic References</a>
      </div>

      <h2 id="readability">1. Readability Metrics</h2>

      <h3>1.1 Flesch Reading Ease Score</h3>
      <div class="formula-box">
        <div class="formula">Score = 206.835 - 1.015(ASL) - 84.6(ASW)</div>
        <div class="variables">
          <div class="variable-item"><strong>ASL</strong> = Average Sentence Length (total words ÷ total sentences)</div>
          <div class="variable-item"><strong>ASW</strong> = Average Syllables per Word (total syllables ÷ total words)</div>
          <div class="variable-item"><strong>Range:</strong> Clamped between 0-100 (higher = easier to read)</div>
        </div>
      </div>
      <div class="reference">
        <strong>Reference:</strong> Flesch, R. (1948). A new readability yardstick. Journal of Applied Psychology, 32(3), 221-233.
      </div>
      <div class="interpretation">
        <strong>Interpretation:</strong> Scores of 90-100 indicate very easy text (5th grade level), while scores below 30 indicate very difficult text (college graduate level).
      </div>

      <h3>1.2 Flesch-Kincaid Grade Level</h3>
      <div class="formula-box">
        <div class="formula">Grade = 0.39(ASL) + 11.8(ASW) - 15.59</div>
        <div class="variables">
          <div class="variable-item"><strong>ASL</strong> = Average Sentence Length</div>
          <div class="variable-item"><strong>ASW</strong> = Average Syllables per Word</div>
          <div class="variable-item"><strong>Range:</strong> 0+ (corresponds to U.S. grade level)</div>
        </div>
      </div>
      <div class="reference">
        <strong>Reference:</strong> Kincaid, J. P., Fishburne, R. P., Rogers, R. L., & Chissom, B. S. (1975). Derivation of new readability formulas for Navy enlisted personnel.
      </div>

      <h3>1.3 Syllable Counting Algorithm</h3>
      <div class="example">
        <strong>Method:</strong><br>
        1. Remove non-alphabetic characters<br>
        2. Words ≤ 3 letters = 1 syllable<br>
        3. Remove silent endings: <span class="code-inline">-es, -ed, -e</span> (excluding after <span class="code-inline">l</span>)<br>
        4. Remove leading <span class="code-inline">y</span><br>
        5. Count vowel groups (aeiouy) as syllables<br>
        6. Minimum return value: 1 syllable
      </div>

      <h2 id="statistics">2. Statistical Measures</h2>

      <h3>2.1 Mean (Average)</h3>
      <div class="formula-box">
        <div class="formula">μ = (Σx) / n</div>
        <div class="variables">
          <div class="variable-item"><strong>Σx</strong> = Sum of all values</div>
          <div class="variable-item"><strong>n</strong> = Number of values</div>
        </div>
      </div>

      <h3>2.2 Variance (Population)</h3>
      <div class="formula-box">
        <div class="formula">σ² = Σ(x - μ)² / n</div>
        <div class="variables">
          <div class="variable-item"><strong>x</strong> = Individual value</div>
          <div class="variable-item"><strong>μ</strong> = Mean of all values</div>
          <div class="variable-item"><strong>n</strong> = Number of values</div>
        </div>
      </div>
      <div class="example">
        <strong>Example:</strong> For sentence lengths [10, 15, 12, 18]:<br>
        μ = (10+15+12+18)/4 = 13.75<br>
        σ² = [(10-13.75)² + (15-13.75)² + (12-13.75)² + (18-13.75)²] / 4 = 9.19
      </div>

      <h3>2.3 Standard Deviation</h3>
      <div class="formula-box">
        <div class="formula">σ = √(σ²)</div>
        <div class="variables">
          <div class="variable-item">The square root of variance</div>
        </div>
      </div>

      <h3>2.4 Coefficient of Variation (CV)</h3>
      <div class="formula-box">
        <div class="formula">CV = (σ / μ) × 100</div>
        <div class="variables">
          <div class="variable-item"><strong>σ</strong> = Standard deviation of sentence lengths</div>
          <div class="variable-item"><strong>μ</strong> = Mean sentence length</div>
          <div class="variable-item"><strong>Range:</strong> 0-100+ (expressed as percentage)</div>
        </div>
      </div>
      <div class="interpretation">
        <strong>Interpretation:</strong> CV < 25% suggests low variation (uniform sentence structure, potentially robotic). CV > 40% indicates high natural variation.
      </div>

      <h2 id="vocabulary">3. Vocabulary Analysis</h2>

      <h3>3.1 Type-Token Ratio (TTR)</h3>
      <div class="formula-box">
        <div class="formula">TTR = (Unique Words / Total Words) × 100</div>
        <div class="variables">
          <div class="variable-item"><strong>Range:</strong> 0-100% (higher = more diverse vocabulary)</div>
          <div class="variable-item"><strong>Note:</strong> Biased by text length (longer texts typically have lower TTR)</div>
        </div>
      </div>

      <h3>3.2 Mean-Segmental Type-Token Ratio (MSTTR)</h3>
      <div class="formula-box">
        <div class="formula">MSTTR = (Σ TTR<sub>segment</sub>) / n<sub>segments</sub></div>
        <div class="variables">
          <div class="variable-item"><strong>Segment Size:</strong> 50 words per segment</div>
          <div class="variable-item"><strong>TTR<sub>segment</sub></strong> = TTR calculated for each 50-word segment</div>
          <div class="variable-item"><strong>n<sub>segments</sub></strong> = Number of complete segments</div>
        </div>
      </div>
      <div class="example">
        <strong>Algorithm:</strong><br>
        1. Divide text into non-overlapping 50-word segments<br>
        2. Calculate TTR for each segment<br>
        3. Average all segment TTRs<br>
        4. If text < 50 words, return simple TTR<br>
        <br>
        <strong>Why MSTTR?</strong> Solves the length bias problem: a 1000-word essay and a 100-word essay can now be fairly compared.
      </div>

      <h3>3.3 Sophistication Ratio</h3>
      <div class="formula-box">
        <div class="formula">Sophistication = (Sophisticated Words / Total Words) × 100</div>
        <div class="variables">
          <div class="variable-item"><strong>Sophisticated Words:</strong> Words ≥6 letters AND not in high-frequency word list</div>
          <div class="variable-item"><strong>Range:</strong> 0-100%</div>
        </div>
      </div>

      <h2 id="ngrams">4. N-gram Analysis</h2>

      <h3>4.1 N-gram Rate Calculation</h3>
      <div class="formula-box">
        <div class="formula">Rate = (N-gram Count / Total Words) × 100</div>
        <div class="variables">
          <div class="variable-item"><strong>Bigram:</strong> 2-word sequence (e.g., "in order")</div>
          <div class="variable-item"><strong>Trigram:</strong> 3-word sequence (e.g., "it is important")</div>
        </div>
      </div>

      <h3>4.2 Excess N-gram Calculation</h3>
      <div class="formula-box">
        <div class="formula">Excess = max(0, Rate - Baseline)</div>
        <div class="variables">
          <div class="variable-item"><strong>Bigram Baseline:</strong> 15% (human writing average)</div>
          <div class="variable-item"><strong>Trigram Baseline:</strong> 3% (human writing average)</div>
        </div>
      </div>

      <h3>4.3 Predictability Score</h3>
      <div class="formula-box">
        <div class="formula">Predictability = min(100, Excess<sub>bigram</sub> × 2 + Excess<sub>trigram</sub> × 5)</div>
        <div class="variables">
          <div class="variable-item"><strong>Weights:</strong> Trigrams weighted 2.5× higher than bigrams</div>
          <div class="variable-item"><strong>Range:</strong> 0-100 (capped at 100)</div>
        </div>
      </div>
      <div class="interpretation">
        <strong>Interpretation:</strong> Scores > 30 suggest elevated use of formulaic patterns. Trigrams are weighted more heavily because 3-word sequences are more indicative of template-driven writing.
      </div>

      <h2 id="paragraphs">5. Paragraph Coherence</h2>

      <h3>5.1 Shared Content Words</h3>
      <div class="formula-box">
        <div class="formula">Avg Shared = (Σ Shared Words) / (n - 1)</div>
        <div class="variables">
          <div class="variable-item"><strong>Shared Words:</strong> Content words (length > 3, not high-frequency) appearing in consecutive paragraphs</div>
          <div class="variable-item"><strong>n:</strong> Total number of paragraphs</div>
        </div>
      </div>

      <h3>5.2 Transition Rate</h3>
      <div class="formula-box">
        <div class="formula">Transition Rate = (Transitions / (n - 1)) × 100</div>
        <div class="variables">
          <div class="variable-item"><strong>Transition:</strong> Paragraph starting with a connective word/phrase</div>
          <div class="variable-item"><strong>n:</strong> Total number of paragraphs</div>
        </div>
      </div>

      <h3>5.3 Coherence Score</h3>
      <div class="formula-box">
        <div class="formula">Coherence = min(100, Avg Shared × 20 + Transition Rate × 0.5)</div>
        <div class="variables">
          <div class="variable-item"><strong>Range:</strong> 0-100 (capped at 100)</div>
          <div class="variable-item"><strong>Note:</strong> Shared words weighted much higher than transitions</div>
        </div>
      </div>

      <h3>5.4 Topic Shift Score</h3>
      <div class="formula-box">
        <div class="formula">Topic Shift = max(0, 100 - Coherence)</div>
        <div class="variables">
          <div class="variable-item">Inverse of coherence (low coherence = high topic shifting)</div>
        </div>
      </div>

      <h2 id="passive">6. Passive Voice Detection</h2>

      <h3>6.1 Passive Voice Ratio</h3>
      <div class="formula-box">
        <div class="formula">Passive Ratio = (Passive Constructions / Total Sentences) × 100</div>
        <div class="variables">
          <div class="variable-item"><strong>Pattern:</strong> (is|are|was|were|been|being|be) + past participle</div>
        </div>
      </div>
      <div class="example">
        <strong>Detected patterns:</strong> "was written", "is done", "were taken", "been given"<br>
        <strong>Note:</strong> Regex-based detection may not catch all passive voice constructions.
      </div>

      <h2 id="references">7. Academic References</h2>

      <div class="reference">
        <strong>Readability Formulas</strong><br>
        • Flesch, R. (1948). A new readability yardstick. Journal of Applied Psychology, 32(3), 221-233.<br>
        • Kincaid, J. P., Fishburne, R. P., Rogers, R. L., & Chissom, B. S. (1975). Derivation of new readability formulas for Navy enlisted personnel. Research Branch Report 8-75, Naval Technical Training Command.
      </div>

      <div class="reference">
        <strong>Vocabulary & Lexical Diversity</strong><br>
        • McCarthy, P. M., & Jarvis, S. (2010). MTLD, vocd-D, and HD-D: A validation study of sophisticated approaches to lexical diversity assessment. Behavior Research Methods, 42(2), 381-392.
      </div>

      <div class="reference">
        <strong>Text Cohesion & Coherence</strong><br>
        • Graesser, A. C., McNamara, D. S., Louwerse, M. M., & Cai, Z. (2004). Coh-Metrix: Analysis of text on cohesion and language. Behavior Research Methods, Instruments, & Computers, 36(2), 193-202.
      </div>

      <div class="reference">
        <strong>Statistical Measures</strong><br>
        • Coefficient of Variation: Standard measure of relative variability, widely used in stylometry research.<br>
        • N-gram analysis: Based on computational linguistics research on language patterns and predictability.
      </div>

      <h2>Implementation Notes</h2>

      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Code Location</th>
            <th>Key Function</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Readability</td>
            <td>textAnalysis.js:54-64</td>
            <td>calculateReadability()</td>
          </tr>
          <tr>
            <td>Statistics</td>
            <td>textAnalysis.js:40-52</td>
            <td>calculateSentenceStats()</td>
          </tr>
          <tr>
            <td>Coefficient of Variation</td>
            <td>textAnalysis.js:281-289</td>
            <td>analyzeVariation()</td>
          </tr>
          <tr>
            <td>MSTTR</td>
            <td>textHelpers.js:51-75</td>
            <td>calculateMSTTR()</td>
          </tr>
          <tr>
            <td>N-grams</td>
            <td>textAnalysis.js:141-207</td>
            <td>analyzeNgrams()</td>
          </tr>
          <tr>
            <td>Paragraph Coherence</td>
            <td>textAnalysis.js:209-279</td>
            <td>analyzeParagraphs()</td>
          </tr>
          <tr>
            <td>Syllable Counting</td>
            <td>textAnalysis.js:15-22</td>
            <td>countSyllables()</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p><strong>Clareo Mathematical Methodology</strong> — Version 1.0</p>
        <p>This document describes all mathematical formulas and statistical methods used in Clareo's stylometric analysis tool. All formulas have been validated against academic literature and standard implementations.</p>
        <p>For questions or corrections, please refer to the source code or academic references listed above.</p>
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

export const generateComparisonPDF = (comparisonResult, baselineSampleCount) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups to download the PDF report.');
    return;
  }

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
      <td>${sanitizeHTML(m.lbl)}</td>
      <td>${base}${m.suffix}</td>
      <td>${curr.toFixed(1)}${m.suffix}</td>
      <td style="color: ${diffColor}; font-weight: ${Math.abs(diff) > 5 ? 'bold' : 'normal'}">${diff > 0 ? "+" : ""}${diff}${m.suffix}</td>
    </tr>`;
  }).join('');

  const sanitizedText = sanitizeHTML(comparisonResult.current.text.slice(0, 800));
  const textPreview = sanitizedText + (comparisonResult.current.text.length > 800 ? '...' : '');

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
      <div class="text-sample">${textPreview}</div>

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

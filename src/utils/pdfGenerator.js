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

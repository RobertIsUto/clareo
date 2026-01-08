import { useMemo } from 'react';

/**
 * Displays a single calculation step with formula, substitution, result, and interpretation
 */
export default function CalculationStep({ stepNumber, title, formula, substitution, result, interpretation, highlight = false }) {
  return (
    <div className={`calc-step ${highlight ? 'calc-step-highlight' : ''}`}>
      <div className="calc-step-header">
        <span className="calc-step-number">{stepNumber}</span>
        <h4 className="calc-step-title">{title}</h4>
      </div>

      {formula && (
        <div className="calc-formula-section">
          <div className="calc-label">Formula:</div>
          <code className="calc-formula">{formula}</code>
        </div>
      )}

      {substitution && (
        <div className="calc-substitution-section">
          <div className="calc-label">Calculation:</div>
          <code className="calc-substitution">{substitution}</code>
        </div>
      )}

      {result !== undefined && result !== null && (
        <div className="calc-result-section">
          <div className="calc-label">Result:</div>
          <div className="calc-result">{result}</div>
        </div>
      )}

      {interpretation && (
        <div className="calc-interpretation">
          {interpretation}
        </div>
      )}
    </div>
  );
}

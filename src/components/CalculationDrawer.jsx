import { useEffect } from 'react';
import CalculationStep from './CalculationStep.jsx';
import { prepareMetricCalculation, prepareCompositeCalculation, prepareAnalysisMetricCalculation } from '../utils/calculationExplainer.js';

/**
 * Side drawer that displays step-by-step calculation breakdowns
 * Can handle both comparison mode (with baseline) and analysis mode (standalone metrics)
 */
export default function CalculationDrawer({
  isOpen,
  onClose,
  metricKey,
  comparisonResult,
  baselineSamples,
  analysisResults // For analysis mode (non-comparison)
}) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Determine mode: comparison vs analysis
  const isAnalysisMode = !comparisonResult && analysisResults;
  const isComparisonMode = !!comparisonResult;

  if (!isAnalysisMode && !isComparisonMode) return null;

  // Prepare calculation data based on mode
  let calculationData;
  let isComposite = false;

  if (isAnalysisMode) {
    // Analysis mode: show individual metric calculations
    calculationData = prepareAnalysisMetricCalculation(metricKey, analysisResults);
  } else {
    // Comparison mode: show Z-scores or composite
    isComposite = metricKey === null || metricKey === 'composite';
    calculationData = isComposite
      ? prepareCompositeCalculation(comparisonResult)
      : prepareMetricCalculation(metricKey, comparisonResult, baselineSamples);
  }

  if (!calculationData) return null;

  const { steps } = calculationData;

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`calculation-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="drawer-header">
          <div>
            <h3 id="drawer-title" className="drawer-title">
              {isComposite
                ? 'Composite Consistency Score'
                : (calculationData.metricLabel || calculationData.metric?.label || 'Metric Calculation')}
            </h3>
            {isAnalysisMode && calculationData.currentValue && (
              <div className="drawer-subtitle">
                Current: {calculationData.currentValue}
              </div>
            )}
            {isComparisonMode && !isComposite && calculationData.metric && (
              <div className="drawer-subtitle">
                Current: {calculationData.metric.currentValue.toFixed(1)}{calculationData.metric.suffix}
                {' | '}
                Baseline: {calculationData.metric.baselineMean.toFixed(1)}{calculationData.metric.suffix}
              </div>
            )}
          </div>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          {calculationData.showZScoreWarning && (
            <div className="calc-warning">
              <strong>Note:</strong> With only {baselineSamples.length} baseline samples, statistical measures have limited reliability. Add more samples for more confident analysis.
            </div>
          )}

          <div className="calc-steps-container">
            {steps.map((step, index) => (
              <CalculationStep
                key={index}
                stepNumber={index + 1}
                title={step.title}
                formula={step.formula}
                substitution={step.substitution}
                result={step.result}
                interpretation={step.interpretation}
                highlight={index === steps.length - 1 && isComposite}
              />
            ))}
          </div>

          {/* Additional info for composite score */}
          {isComposite && (
            <div className="composite-summary">
              <h4>Component Breakdown</h4>
              <div className="component-weights">
                <div className="component-item">
                  <span className="component-label">Metric Deviations:</span>
                  <span className="component-value">{calculationData.components.metricScore.toFixed(1)} pts (40%)</span>
                </div>
                <div className="component-item">
                  <span className="component-label">Vocabulary Overlap:</span>
                  <span className="component-value">{calculationData.components.vocabScore.toFixed(1)} pts (10%)</span>
                </div>
                <div className="component-item">
                  <span className="component-label">Syntactic Patterns:</span>
                  <span className="component-value">{calculationData.components.syntaxScore.toFixed(1)} pts (30%)</span>
                </div>
                <div className="component-item">
                  <span className="component-label">Error Consistency:</span>
                  <span className="component-value">{calculationData.components.errorScore.toFixed(1)} pts (15%)</span>
                </div>
                {calculationData.components.specialPenalty > 0 && (
                  <div className="component-item penalty">
                    <span className="component-label">Special Penalties:</span>
                    <span className="component-value">-{calculationData.components.specialPenalty.toFixed(1)} pts</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Educational note */}
          <div className="calc-footer-note">
            <p>
              <strong>Understanding These Calculations:</strong>
            </p>
            {isAnalysisMode ? (
              <p>
                These calculations show how the individual metrics are computed from the text.
                Each metric provides insight into different aspects of writing style, complexity,
                and patterns. For baseline comparison and statistical significance, use the
                "Compare Profile" feature.
              </p>
            ) : (
              <>
                <p>
                  These calculations compare the current text against the student's own baseline,
                  not a universal standard. Statistical significance (Z-scores) helps identify
                  patterns that differ from what this specific student typically produces.
                </p>
                {!isComposite && (
                  <p>
                    A Z-score tells you how many "standard deviations" away from the student's
                    average this value is. Values beyond ±2.0 are statistically significant (less
                    than 5% chance of occurring naturally).
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

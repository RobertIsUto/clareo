import { useState, useCallback, useMemo } from 'react';
import { runFullAnalysis } from '../utils/textAnalysis';
import { STATISTICAL_THRESHOLDS, COMPOSITE_SCORE_WEIGHTS, STYLE_CHANGE_FLAGS } from '../constants/thresholds';
import { calculateMetricStatistics, calculateZScore, isStatisticallySignificant, detectOutliers } from '../utils/statisticalAnalysis';
import { buildVocabularyProfile, compareVocabularyProfiles, extractVocabularyProfile } from '../utils/vocabularyFingerprint';
import { buildSyntacticProfile, compareSyntacticProfiles, analyzeSentenceStructure } from '../utils/syntacticAnalysis';
import { buildErrorProfile, compareErrorProfiles, detectErrorPatterns } from '../utils/errorDetection';
import { getZScoreColorClass, getSignificanceLabel } from '../utils/textHelpers';

/**
 * Custom hook for managing comparison calculations and state
 * Handles profile building, metric deviations, composite scoring, and style flags
 */
export function useComparisonCalculations(baselineSamples) {
  const [comparisonText, setComparisonText] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);

  /**
   * Build comprehensive student writing profile from baseline samples
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
   */
  const calculateCompositeScore = useCallback((metricDeviations, vocabComparison, syntaxComparison, errorComparison) => {
    const significantDeviations = metricDeviations.filter(d => d.isSignificant);
    const zScores = metricDeviations.map(d => d.zScore);
    const rmsZScore = Math.sqrt(zScores.reduce((sum, z) => sum + z * z, 0) / zScores.length);

    const metricScore = 100 / (1 + Math.pow(rmsZScore / 2, 2));
    const vocabScore = vocabComparison.overlapScore || 50;
    const syntaxScore = 100 / (1 + Math.pow(syntaxComparison.overallDeviation / 2, 2));

    const errorScore = errorComparison.suspiciouslyClean
      ? Math.max(40, 100 - (Math.abs(errorComparison.cleanlinessChange) * 1.5))
      : Math.max(0, 100 - (Math.abs(errorComparison.cleanlinessChange) * 0.8));

    let specialPenalty = 0;
    if (errorComparison.suspiciouslyClean) {
      specialPenalty += 10;
    }
    if (significantDeviations.length >= 3) {
      const deviationPenalty = Math.min(20, significantDeviations.length * 5);
      specialPenalty += deviationPenalty;
    }

    const weightedSum = (
      metricScore * COMPOSITE_SCORE_WEIGHTS.METRIC_DEVIATIONS +
      vocabScore * COMPOSITE_SCORE_WEIGHTS.VOCABULARY_OVERLAP +
      syntaxScore * COMPOSITE_SCORE_WEIGHTS.SYNTACTIC_PATTERNS +
      errorScore * COMPOSITE_SCORE_WEIGHTS.ERROR_CONSISTENCY
    );
    const compositeScore = weightedSum - specialPenalty;

    return Math.max(0, Math.min(100, compositeScore));
  }, []);

  /**
   * Generate style change flags based on analysis
   */
  const generateStyleChangeFlags = useCallback((metricDeviations, vocabComparison, syntaxComparison, errorComparison) => {
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

  // Memoized student profile based on baseline samples
  const studentProfile = useMemo(() => {
    return buildStudentProfile(baselineSamples);
  }, [baselineSamples, buildStudentProfile]);

  /**
   * Run comprehensive comparison analysis
   */
  const runComparison = useCallback(() => {
    if (baselineSamples.length < STATISTICAL_THRESHOLDS.MIN_BASELINE_SAMPLES || !comparisonText.trim()) return;

    const current = runFullAnalysis(comparisonText);
    const profile = buildStudentProfile(baselineSamples);

    if (!profile) {
      alert('Unable to build student profile. Please ensure baseline samples are valid.');
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
      errorComparison
    );

    setComparisonResult({
      profile,
      current,
      vocabComparison,
      syntaxComparison,
      errorComparison,
      metricDeviations,
      consistencyScore,
      flags
    });
  }, [baselineSamples, comparisonText, buildStudentProfile, calculateMetricDeviations, calculateCompositeScore, generateStyleChangeFlags]);

  const clearComparison = useCallback(() => {
    setComparisonText('');
    setComparisonResult(null);
  }, []);

  return {
    // State
    comparisonText,
    comparisonResult,
    studentProfile,

    // Setters
    setComparisonText,

    // Actions
    runComparison,
    clearComparison
  };
}

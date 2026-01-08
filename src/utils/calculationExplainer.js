import { COMPOSITE_SCORE_WEIGHTS, STATISTICAL_THRESHOLDS } from '../constants/thresholds.js';
import { FORMAL_REGISTER_PHRASES } from '../constants/phrases.js';

/**
 * Prepare calculation breakdown for an individual metric's Z-score
 */
export function prepareMetricCalculation(metricKey, comparisonResult, baselineSamples) {
  const deviation = comparisonResult.metricDeviations.find(d => d.key === metricKey);
  if (!deviation) return null;

  const metricProfile = comparisonResult.profile.metrics[metricKey];
  const baselineValues = metricProfile?.values || [];

  const steps = [];

  // Step 1: Collect Baseline Values
  steps.push({
    title: 'Collect Baseline Values',
    formula: null,
    substitution: `${baselineValues.length} baseline samples`,
    result: `Range: ${deviation.baselineMin.toFixed(1)}${deviation.suffix} to ${deviation.baselineMax.toFixed(1)}${deviation.suffix}`,
    interpretation: `These values come from ${baselineValues.length} past assignments submitted by the student.`
  });

  // Step 2: Calculate Baseline Mean
  const sumFormula = baselineValues.length <= 5
    ? `(${baselineValues.map(v => v.toFixed(1)).join(' + ')}) / ${baselineValues.length}`
    : `sum of ${baselineValues.length} values / ${baselineValues.length}`;

  steps.push({
    title: 'Calculate Baseline Mean (Average)',
    formula: 'μ = Σx / n',
    substitution: sumFormula,
    result: `${deviation.baselineMean.toFixed(2)}${deviation.suffix}`,
    interpretation: `The student's typical ${deviation.label} is ${deviation.baselineMean.toFixed(1)}${deviation.suffix}.`
  });

  // Step 3: Calculate Standard Deviation
  steps.push({
    title: 'Calculate Standard Deviation',
    formula: 'σ = √(Σ(x - μ)² / n)',
    substitution: `Measures how much variation exists in the baseline`,
    result: `σ = ${deviation.baselineStdDev.toFixed(2)}${deviation.suffix}`,
    interpretation: interpretStdDev(deviation.baselineStdDev, deviation.baselineMean, deviation.label)
  });

  // Step 4: Calculate Z-Score
  const zCalc = `(${deviation.currentValue.toFixed(2)} - ${deviation.baselineMean.toFixed(2)}) / ${deviation.baselineStdDev.toFixed(2)} = ${deviation.zScore.toFixed(2)}`;

  steps.push({
    title: 'Calculate Z-Score',
    formula: 'z = (x - μ) / σ',
    substitution: zCalc,
    result: `z = ${deviation.zScore.toFixed(2)}`,
    interpretation: interpretZScore(deviation.zScore, deviation.label, deviation.currentValue > deviation.baselineMean)
  });

  return {
    steps,
    metric: deviation,
    showZScoreWarning: baselineSamples.length < STATISTICAL_THRESHOLDS.ZSCORE_THRESHOLD_SAMPLES
  };
}

/**
 * Prepare calculation breakdown for composite consistency score
 */
export function prepareCompositeCalculation(comparisonResult) {
  const { metricDeviations, vocabComparison, syntaxComparison, errorComparison, consistencyScore } = comparisonResult;

  const steps = [];

  // Step 1: Calculate RMS Z-Score
  const zScores = metricDeviations.map(d => d.zScore);
  const zScoresStr = zScores.map(z => z.toFixed(2)).join(', ');
  const sumSquares = zScores.reduce((sum, z) => sum + z * z, 0);
  const rmsZScore = Math.sqrt(sumSquares / zScores.length);

  steps.push({
    title: 'Calculate RMS (Root Mean Square) Z-Score',
    formula: 'RMS = √(Σz² / n)',
    substitution: `√((${zScores.map(z => z.toFixed(1) + '²').join(' + ')}) / ${zScores.length})`,
    result: `RMS = ${rmsZScore.toFixed(2)}`,
    interpretation: interpretRmsZScore(rmsZScore)
  });

  // Step 2: Metric Deviation Component
  const metricScore = 100 / (1 + Math.pow(rmsZScore / 2, 2));
  steps.push({
    title: 'Metric Deviation Component',
    formula: 'metricScore = 100 / (1 + (RMS/2)²)',
    substitution: `100 / (1 + (${rmsZScore.toFixed(2)}/2)²) = 100 / (1 + ${Math.pow(rmsZScore / 2, 2).toFixed(2)}) = ${metricScore.toFixed(1)}`,
    result: `${metricScore.toFixed(1)} × 40% weight = ${(metricScore * 0.40).toFixed(1)} points`,
    interpretation: 'Statistical decay function: Z=0→100pts, Z=2→50pts, Z=3→30pts. More principled than arbitrary multipliers.'
  });

  // Step 3: Vocabulary Overlap Component
  const vocabScore = vocabComparison.overlapScore || 50;
  steps.push({
    title: 'Vocabulary Overlap Component',
    formula: 'Symmetric overlap (average of both directions)',
    substitution: `${vocabScore.toFixed(1)}% vocabulary overlap`,
    result: `${vocabScore.toFixed(1)} × 10% weight = ${(vocabScore * 0.10).toFixed(1)} points`,
    interpretation: vocabScore >= 70
      ? 'Strong vocabulary consistency with baseline.'
      : vocabScore >= 50
      ? 'Moderate vocabulary overlap.'
      : 'Low vocabulary overlap suggests different word choices. Note: Symmetric calculation prevents penalizing vocabulary expansion.'
  });

  // Step 4: Syntactic Patterns Component
  const syntaxScore = 100 / (1 + Math.pow(syntaxComparison.overallDeviation / 2, 2));
  steps.push({
    title: 'Syntactic Patterns Component',
    formula: 'syntaxScore = 100 / (1 + (deviation/2)²)',
    substitution: `100 / (1 + (${syntaxComparison.overallDeviation.toFixed(2)}/2)²) = ${syntaxScore.toFixed(1)}`,
    result: `${syntaxScore.toFixed(1)} × 30% weight = ${(syntaxScore * 0.30).toFixed(1)} points`,
    interpretation: 'Based on Z-score deviations in sentence structure, clause usage, and opening patterns (now all on same statistical scale).'
  });

  // Step 5: Error Consistency Component
  const errorScore = errorComparison.suspiciouslyClean
    ? Math.max(40, 100 - (Math.abs(errorComparison.cleanlinessChange) * 1.5))
    : Math.max(0, 100 - (Math.abs(errorComparison.cleanlinessChange) * 0.8));
  steps.push({
    title: 'Error Consistency Component',
    formula: errorComparison.suspiciouslyClean
      ? 'max(40, 100 - |cleanlinessChange| × 1.5)'
      : 'max(0, 100 - |cleanlinessChange| × 0.8)',
    substitution: errorComparison.suspiciouslyClean
      ? `max(40, 100 - ${Math.abs(errorComparison.cleanlinessChange).toFixed(1)} × 1.5) = ${errorScore.toFixed(1)}`
      : `100 - ${Math.abs(errorComparison.cleanlinessChange).toFixed(1)} × 0.8 = ${errorScore.toFixed(1)}`,
    result: `${errorScore.toFixed(1)} × 15% weight = ${(errorScore * 0.15).toFixed(1)} points`,
    interpretation: errorComparison.suspiciouslyClean
      ? 'Writing is suspiciously cleaner than baseline - proportional penalty based on magnitude of change (allows for genuine improvement).'
      : 'Error patterns are consistent with baseline writing.'
  });

  // Step 6: Calculate Weighted Sum
  const weightedSum = (
    metricScore * COMPOSITE_SCORE_WEIGHTS.METRIC_DEVIATIONS +
    vocabScore * COMPOSITE_SCORE_WEIGHTS.VOCABULARY_OVERLAP +
    syntaxScore * COMPOSITE_SCORE_WEIGHTS.SYNTACTIC_PATTERNS +
    errorScore * COMPOSITE_SCORE_WEIGHTS.ERROR_CONSISTENCY
  );

  steps.push({
    title: 'Sum Weighted Components',
    formula: 'sum of all weighted scores',
    substitution: `${(metricScore * 0.40).toFixed(1)} + ${(vocabScore * 0.10).toFixed(1)} + ${(syntaxScore * 0.30).toFixed(1)} + ${(errorScore * 0.15).toFixed(1)}`,
    result: `${weightedSum.toFixed(1)} points`,
    interpretation: null
  });

  // Step 7: Apply Special Penalties (if any)
  const significantDeviations = metricDeviations.filter(d => d.isSignificant);
  let specialPenalty = 0;
  const penalties = [];

  if (errorComparison.suspiciouslyClean) {
    specialPenalty += 10;
    penalties.push('Suspiciously clean text: -10 points');
  }

  if (significantDeviations.length >= 3) {
    const deviationPenalty = Math.min(20, significantDeviations.length * 5);
    specialPenalty += deviationPenalty;
    penalties.push(`${significantDeviations.length} significant deviations: -${deviationPenalty} points (scaled: ${significantDeviations.length}×5, capped at 20)`);
  }

  if (specialPenalty > 0) {
    steps.push({
      title: 'Apply Special Penalties',
      formula: null,
      substitution: penalties.join('; '),
      result: `-${specialPenalty} points`,
      interpretation: 'Additional penalties for patterns that suggest style inconsistency.'
    });
  }

  // Step 8: Final Score
  const finalScore = Math.max(0, Math.min(100, weightedSum - specialPenalty));
  steps.push({
    title: 'Final Consistency Score',
    formula: 'clamp(weightedSum - penalties, 0, 100)',
    substitution: specialPenalty > 0
      ? `${weightedSum.toFixed(1)} - ${specialPenalty} = ${finalScore.toFixed(1)}`
      : `${weightedSum.toFixed(1)}`,
    result: `${finalScore.toFixed(0)} / 100`,
    interpretation: interpretCompositeScore(finalScore)
  });

  return {
    steps,
    components: {
      metricScore: metricScore * 0.40,
      vocabScore: vocabScore * 0.10,
      syntaxScore: syntaxScore * 0.30,
      errorScore: errorScore * 0.15,
      specialPenalty
    },
    finalScore
  };
}

/**
 * Interpretation helper functions
 */

function interpretStdDev(stdDev, mean, metricLabel) {
  const cv = (stdDev / mean) * 100;
  if (cv < 10) {
    return `Very consistent baseline - student's ${metricLabel.toLowerCase()} varies by only ${stdDev.toFixed(1)} on average.`;
  } else if (cv < 20) {
    return `Moderately consistent baseline - typical variation of ${stdDev.toFixed(1)} in ${metricLabel.toLowerCase()}.`;
  } else {
    return `Variable baseline - ${metricLabel.toLowerCase()} shows considerable natural variation (σ = ${stdDev.toFixed(1)}).`;
  }
}

function interpretZScore(zScore, metricLabel, isHigher) {
  const absZ = Math.abs(zScore);
  const direction = isHigher ? 'higher' : 'lower';

  if (absZ < 1.0) {
    return `This ${metricLabel.toLowerCase()} is **within normal variation** for this student. The difference is not statistically significant.`;
  } else if (absZ < 1.5) {
    return `This ${metricLabel.toLowerCase()} is slightly ${direction} than usual (${absZ.toFixed(1)} standard deviations), but still within an expected range.`;
  } else if (absZ < 2.0) {
    return `This ${metricLabel.toLowerCase()} is **notably ${direction}** than the student's baseline (${absZ.toFixed(1)} standard deviations). This warrants attention and conversation.`;
  } else {
    return `This ${metricLabel.toLowerCase()} is **significantly ${direction}** than baseline (${absZ.toFixed(1)} standard deviations). This is a strong statistical indicator of style change.`;
  }
}

function interpretRmsZScore(rmsZScore) {
  if (rmsZScore < 1.0) {
    return 'Overall metrics are statistically consistent with baseline writing patterns. Most measurements fall within normal variation.';
  } else if (rmsZScore < 1.5) {
    return 'Some metrics show minor deviations from baseline, but nothing highly unusual. This could reflect natural variation or topic differences.';
  } else if (rmsZScore < 2.0) {
    return 'Several metrics show notable deviations from established patterns. This suggests the writing style has changed in measurable ways.';
  } else {
    return 'Multiple metrics show significant deviations, suggesting substantial style changes across different dimensions of writing.';
  }
}

function interpretCompositeScore(score) {
  if (score >= 90) {
    return '**Highly Consistent**: Writing is very well-aligned with the student\'s established patterns across all measures.';
  } else if (score >= 70) {
    return '**Generally Consistent**: Writing shows good alignment with baseline with some minor variations that could be natural.';
  } else if (score >= 50) {
    return '**Noticeable Deviation**: Clear differences from baseline patterns detected. This may warrant a conversation about the writing process.';
  } else if (score >= 30) {
    return '**Significant Deviation**: Substantial stylistic differences suggest possible external influence or assistance. Recommend discussing with student.';
  } else {
    return '**Dramatic Change**: Very large style changes detected across multiple dimensions. Strong recommendation to have a conversation with the student about their writing process.';
  }
}

/**
 * Prepare calculation breakdown for an analysis metric (non-comparison)
 */
export function prepareAnalysisMetricCalculation(metricKey, results) {
  if (!results) return null;

  const steps = [];

  switch (metricKey) {
    case 'gradeLevel':
      return prepareGradeLevelCalculation(results);
    case 'sentenceVariance':
      return prepareSentenceVarianceCalculation(results);
    case 'vocabVariety':
      return prepareVocabVarietyCalculation(results);
    case 'formulaic':
      return prepareFormulaicCalculation(results);
    case 'predictability':
      return preparePredictabilityCalculation(results);
    default:
      return null;
  }
}

function prepareGradeLevelCalculation(results) {
  const { readability, sentences, vocabulary } = results;
  const totalWords = vocabulary.totalWords;
  const totalSentences = sentences.length;
  const avgSentenceLength = totalWords / totalSentences;

  // Calculate syllables
  const totalSyllables = sentences.reduce((sum, s) => sum + s.syllableCount, 0);
  const avgSyllablesPerWord = totalSyllables / totalWords;

  return {
    steps: [
      {
        title: 'Calculate Average Sentence Length',
        formula: 'ASL = total words / total sentences',
        substitution: `${totalWords} words / ${totalSentences} sentences`,
        result: `${avgSentenceLength.toFixed(1)} words/sentence`,
        interpretation: avgSentenceLength < 15 ? 'Short sentences, easier to read.' : avgSentenceLength > 25 ? 'Long sentences, more complex.' : 'Moderate sentence length.'
      },
      {
        title: 'Calculate Average Syllables Per Word',
        formula: 'ASW = total syllables / total words',
        substitution: `${totalSyllables} syllables / ${totalWords} words`,
        result: `${avgSyllablesPerWord.toFixed(2)} syllables/word`,
        interpretation: avgSyllablesPerWord < 1.5 ? 'Simple vocabulary.' : avgSyllablesPerWord > 2.0 ? 'Complex vocabulary.' : 'Moderate vocabulary complexity.'
      },
      {
        title: 'Apply Flesch-Kincaid Formula',
        formula: 'Grade = 0.39×ASL + 11.8×ASW - 15.59',
        substitution: `0.39×${avgSentenceLength.toFixed(1)} + 11.8×${avgSyllablesPerWord.toFixed(2)} - 15.59`,
        result: `Grade ${readability.grade}`,
        interpretation: `This text is at approximately a grade ${Math.round(parseFloat(readability.grade))} reading level according to the Flesch-Kincaid formula.`
      }
    ],
    metricLabel: 'Grade Level (Flesch-Kincaid)',
    currentValue: readability.grade
  };
}

function prepareSentenceVarianceCalculation(results) {
  const { sentences, sentenceStats, variation } = results;
  const mean = parseFloat(sentenceStats.mean);
  const stdDev = parseFloat(sentenceStats.stdDev);

  return {
    steps: [
      {
        title: 'Calculate Mean Sentence Length',
        formula: 'μ = Σx / n',
        substitution: `Sum of all sentence lengths / ${sentences.length} sentences`,
        result: `μ = ${mean.toFixed(1)} words`,
        interpretation: 'Average sentence length across the text.'
      },
      {
        title: 'Calculate Standard Deviation',
        formula: 'σ = √(Σ(x - μ)² / n)',
        substitution: 'Measure of spread in sentence lengths',
        result: `σ = ${stdDev.toFixed(1)} words`,
        interpretation: stdDev < 5 ? 'Low variation - sentences are similar in length.' : stdDev > 10 ? 'High variation - diverse sentence lengths.' : 'Moderate variation in sentence lengths.'
      },
      {
        title: 'Calculate Coefficient of Variation',
        formula: 'CV = (σ / μ) × 100',
        substitution: `(${stdDev.toFixed(1)} / ${mean.toFixed(1)}) × 100`,
        result: `CV = ${variation.cv}%`,
        interpretation: parseFloat(variation.cv) < 25
          ? 'CV < 25% suggests uniform sentence lengths, which can indicate algorithmic or templated writing.'
          : 'CV ≥ 25% indicates natural variation in sentence structure typical of human writing.'
      }
    ],
    metricLabel: 'Sentence Variance (Coefficient of Variation)',
    currentValue: `${variation.cv}%`
  };
}

function prepareVocabVarietyCalculation(results) {
  const { vocabulary } = results;

  return {
    steps: [
      {
        title: 'Split Text into 50-Word Segments',
        formula: null,
        substitution: `Text divided into segments of 50 words each`,
        result: 'Non-overlapping segments created',
        interpretation: 'MSTTR uses 50-word segments to account for text length effects on vocabulary diversity.'
      },
      {
        title: 'Calculate TTR for Each Segment',
        formula: 'TTR = (unique words / total words) × 100',
        substitution: 'For each 50-word segment',
        result: 'Individual TTR values calculated',
        interpretation: 'Type-Token Ratio measures vocabulary diversity within each segment.'
      },
      {
        title: 'Calculate Mean-Segmental TTR',
        formula: 'MSTTR = (Σ segment_TTR) / n_segments',
        substitution: 'Average of all segment TTRs',
        result: `MSTTR = ${vocabulary.sTTR}%`,
        interpretation: parseFloat(vocabulary.sTTR) < 60
          ? 'Lower variety - more repetitive vocabulary.'
          : parseFloat(vocabulary.sTTR) > 75
          ? 'High variety - diverse vocabulary usage.'
          : 'Moderate vocabulary variety.'
      }
    ],
    metricLabel: 'Vocabulary Variety (MSTTR)',
    currentValue: `${vocabulary.sTTR}%`
  };
}

function prepareFormulaicCalculation(results) {
  const { formalRegister } = results;
  const databaseSize = FORMAL_REGISTER_PHRASES.length;

  return {
    steps: [
      {
        title: 'Detect Formulaic Phrases',
        formula: null,
        substitution: `Scanned text against database of ${databaseSize} known formulaic phrases`,
        result: `Found ${formalRegister.totalCount} formulaic phrases in this text`,
        interpretation: 'Formulaic phrases include clichés, transition phrases, and template language commonly found in AI-generated text.'
      },
      {
        title: 'Apply Severity Weights',
        formula: 'weight = Σ(phrase_count × severity_weight)',
        substitution: `High (×3): ${formalRegister.severity.high}, Medium (×2): ${formalRegister.severity.medium}, Low (×1): ${formalRegister.severity.low}`,
        result: `Total weight = ${formalRegister.totalWeight.toFixed(1)}`,
        interpretation: formalRegister.totalWeight < 5
          ? 'Low formulaic score - minimal use of stock phrases.'
          : formalRegister.totalWeight > 10
          ? 'High formulaic score - heavy reliance on template language.'
          : 'Moderate use of formulaic phrases.'
      }
    ],
    metricLabel: 'Formulaic Language Score',
    currentValue: formalRegister.totalWeight.toFixed(1)
  };
}

function preparePredictabilityCalculation(results) {
  const { ngrams } = results;
  const bigramRate = parseFloat(ngrams.bigrams.rate);
  const trigramRate = parseFloat(ngrams.trigrams.rate);
  const bigramExcess = Math.max(0, bigramRate - 15);
  const trigramExcess = Math.max(0, trigramRate - 3);

  return {
    steps: [
      {
        title: 'Calculate N-gram Rates',
        formula: 'rate = (formulaic_ngrams / total_words) × 100',
        substitution: `Bigrams: ${bigramRate.toFixed(1)}%, Trigrams: ${trigramRate.toFixed(1)}%`,
        result: 'Baseline rates: 15% bigrams, 3% trigrams (human writing)',
        interpretation: 'Formulaic n-grams are common word sequences that appear frequently in template-driven or AI-generated text.'
      },
      {
        title: 'Calculate Excess N-grams',
        formula: 'excess = max(0, rate - baseline)',
        substitution: `Bigram excess: max(0, ${bigramRate.toFixed(1)} - 15) = ${bigramExcess.toFixed(1)}; Trigram excess: max(0, ${trigramRate.toFixed(1)} - 3) = ${trigramExcess.toFixed(1)}`,
        result: `Bigram: ${bigramExcess.toFixed(1)}%, Trigram: ${trigramExcess.toFixed(1)}%`,
        interpretation: 'Excess measures how much this text exceeds typical human writing patterns.'
      },
      {
        title: 'Calculate Predictability Score',
        formula: 'score = min(100, excess_bigram×2 + excess_trigram×5)',
        substitution: `min(100, ${bigramExcess.toFixed(1)}×2 + ${trigramExcess.toFixed(1)}×5)`,
        result: `${ngrams.predictabilityScore}%`,
        interpretation: parseFloat(ngrams.predictabilityScore) < 20
          ? 'Low predictability - natural, varied language.'
          : parseFloat(ngrams.predictabilityScore) > 30
          ? 'High predictability - may indicate template-driven or AI-generated patterns.'
          : 'Moderate predictability score.'
      }
    ],
    metricLabel: 'Predictability Score',
    currentValue: `${ngrams.predictabilityScore}%`
  };
}

export const THRESHOLDS = {
  MIN_WORDS: 100,
  LOW_CV: 25,
  HIGH_PREDICTABILITY: 30,
  HIGH_FORMULAIC: 10,
  SIGNIFICANT_DIFF: 5,
  HIGH_SEVERITY_THRESHOLD: 2,
};

export const HUMAN_NGRAM_BASELINE = {
  bigramRate: 15,
  trigramRate: 3,
};

export const STATISTICAL_THRESHOLDS = {
  MIN_BASELINE_SAMPLES: 3,
  RECOMMENDED_BASELINE_SAMPLES: 5,
  STRONG_BASELINE_SAMPLES: 7,

  OUTLIER_ZSCORE_THRESHOLD: 2.5,

  SIGNIFICANCE_LEVELS: {
    LOW: 1.0,
    MEDIUM: 1.5,
    HIGH: 2.0
  },

  VARIANCE_LEVELS: {
    LOW: 15,
    MEDIUM: 30,
    HIGH: 50
  },

  CONSISTENCY_SCORE_RANGES: {
    EXCELLENT: 90,
    GOOD: 70,
    MODERATE: 50,
    CONCERNING: 30,
    CRITICAL: 0
  },

  VOCABULARY_OVERLAP_THRESHOLDS: {
    HIGH: 70,
    MODERATE: 50,
    LOW: 30
  },

  ERROR_RATE_THRESHOLDS: {
    CLEAN: 1.0,
    TYPICAL: 3.0,
    HIGH: 5.0
  },

  SYNTACTIC_DEVIATION_THRESHOLDS: {
    NORMAL: 1.0,
    NOTABLE: 1.5,
    SIGNIFICANT: 2.0
  }
};

export const COMPOSITE_SCORE_WEIGHTS = {
  METRIC_DEVIATIONS: 0.35,
  VOCABULARY_OVERLAP: 0.25,
  SYNTACTIC_PATTERNS: 0.20,
  ERROR_CONSISTENCY: 0.15,
  SPECIAL_PENALTIES: 0.05
};

export const STYLE_CHANGE_FLAGS = {
  SUSPICIOUSLY_CLEAN: {
    threshold: { baselineErrors: 3.0, currentErrors: 1.0 },
    severity: 'high',
    message: 'Error rate suspiciously low compared to baseline'
  },
  VOCABULARY_SHIFT: {
    threshold: 40,
    severity: 'medium',
    message: 'Vocabulary overlap significantly lower than expected'
  },
  MULTIPLE_DEVIATIONS: {
    threshold: 3,
    severity: 'high',
    message: 'Multiple metrics showing simultaneous significant deviations'
  },
  SYNTACTIC_SHIFT: {
    threshold: 2.0,
    severity: 'medium',
    message: 'Sentence structure patterns differ significantly from baseline'
  },
  SOPHISTICATION_JUMP: {
    threshold: 1.8,
    severity: 'medium',
    message: 'Vocabulary sophistication increased significantly'
  },
  FORMULAIC_INCREASE: {
    threshold: 1.5,
    severity: 'low',
    message: 'Increase in formulaic language usage'
  }
};

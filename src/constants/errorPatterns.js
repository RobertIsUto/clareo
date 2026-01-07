/**
 * Error Pattern Constants
 * Common writing errors for pattern detection and style consistency analysis
 */

/**
 * Common grammatical and stylistic errors
 * Note: These are intentionally broad to catch patterns without false positives
 */
export const COMMON_ERROR_PATTERNS = [
  {
    id: 'its-contraction',
    pattern: /\bits\s+(\w+ing)\b/gi,
    type: 'contraction-misuse',
    severity: 1,
    description: 'Possible its/it\'s confusion'
  },
  {
    id: 'could-of',
    pattern: /\b(could|should|would|might|must)\s+of\b/gi,
    type: 'modal-preposition',
    severity: 2,
    description: 'Modal + "of" instead of "have"'
  },
  {
    id: 'there-overuse',
    pattern: /\bthere\s+(is|are|was|were)\s+(a|an|the|many|several|some|numerous)\b/gi,
    type: 'expletive-overuse',
    severity: 1,
    description: 'Expletive construction overuse'
  },
  {
    id: 'your-youre',
    pattern: /\byour\s+(going|coming|being|doing|having)\b/gi,
    type: 'possessive-contraction',
    severity: 2,
    description: 'Possible your/you\'re confusion'
  },
  {
    id: 'affect-effect',
    pattern: /\b(affect|effect)(s|ed|ing)?\b/gi,
    type: 'commonly-confused',
    severity: 1,
    description: 'Commonly confused word pair'
  },
  {
    id: 'then-than',
    pattern: /\b(more|less|better|worse|rather)\s+then\b/gi,
    type: 'commonly-confused',
    severity: 2,
    description: 'Then/than confusion in comparison'
  },
  {
    id: 'alot',
    pattern: /\balot\b/gi,
    type: 'spacing-error',
    severity: 2,
    description: 'Spacing error: "alot" should be "a lot"'
  },
  {
    id: 'loose-lose',
    pattern: /\b(loose|lose)(s|d|ing)?\b/gi,
    type: 'commonly-confused',
    severity: 1,
    description: 'Loose/lose confusion'
  },
  {
    id: 'their-there',
    pattern: /\b(their|there|they\'re)\b/gi,
    type: 'commonly-confused',
    severity: 1,
    description: 'Their/there/they\'re usage'
  },
  {
    id: 'comma-splice-potential',
    pattern: /,\s+(however|therefore|moreover|furthermore|nevertheless|thus|hence)\s+/gi,
    type: 'comma-splice',
    severity: 1,
    description: 'Potential comma splice with conjunctive adverb'
  },
  {
    id: 'fragment-because',
    pattern: /^because\s+\w+.*[.!?]\s+[A-Z]/gm,
    type: 'sentence-fragment',
    severity: 1,
    description: 'Potential sentence fragment starting with "because"'
  },
  {
    id: 'double-negative',
    pattern: /\b(don\'t|doesn\'t|didn\'t|won\'t|can\'t|couldn\'t|shouldn\'t|wouldn\'t)\s+\w*\s+(no|nothing|nobody|nowhere|never|none)\b/gi,
    type: 'double-negative',
    severity: 2,
    description: 'Double negative construction'
  },
  {
    id: 'subject-verb',
    pattern: /\b(he|she|it)\s+(have|do|are)\b/gi,
    type: 'agreement',
    severity: 2,
    description: 'Subject-verb agreement error'
  },
  {
    id: 'redundancy',
    pattern: /\b(advance\s+forward|past\s+history|future\s+plans|repeat\s+again|close\s+proximity|end\s+result)\b/gi,
    type: 'redundancy',
    severity: 1,
    description: 'Redundant phrase'
  },
  {
    id: 'wordiness',
    pattern: /\b(in\s+order\s+to|due\s+to\s+the\s+fact\s+that|at\s+this\s+point\s+in\s+time|for\s+the\s+purpose\s+of)\b/gi,
    type: 'wordiness',
    severity: 1,
    description: 'Wordy construction'
  }
];

/**
 * Spelling variant patterns (British vs American)
 * Lower severity as these aren't errors, just style differences
 */
export const SPELLING_VARIANTS = {
  british: [
    /\b\w+our\b/gi,
    /\b\w+ise\b/gi,
    /\b\w+yse\b/gi,
    /\bcentre\b/gi,
    /\btheatre\b/gi
  ],
  american: [
    /\b\w+or\b/gi,
    /\b\w+ize\b/gi,
    /\b\w+yze\b/gi,
    /\bcenter\b/gi,
    /\btheater\b/gi
  ]
};

/**
 * Style inconsistency patterns
 */
export const STYLE_PATTERNS = {
  contractions: {
    pattern: /\b(don\'t|doesn\'t|didn\'t|isn\'t|aren\'t|wasn\'t|weren\'t|haven\'t|hasn\'t|hadn\'t|can\'t|couldn\'t|shouldn\'t|wouldn\'t|won\'t|it\'s|that\'s|what\'s|who\'s|where\'s|when\'s|how\'s|I\'m|you\'re|we\'re|they\'re|I\'ve|you\'ve|we\'ve|they\'ve|I\'ll|you\'ll|we\'ll|they\'ll|he\'s|she\'s)\b/gi,
    type: 'contraction',
    severity: 0,
    description: 'Contraction usage'
  },
  firstPerson: {
    pattern: /\b(I|me|my|mine|we|us|our|ours)\b/gi,
    type: 'first-person',
    severity: 0,
    description: 'First-person pronouns'
  },
  secondPerson: {
    pattern: /\b(you|your|yours)\b/gi,
    type: 'second-person',
    severity: 0,
    description: 'Second-person pronouns'
  },
  colloquial: {
    pattern: /\b(gonna|wanna|gotta|kinda|sorta|yeah|yep|nope|ok|okay)\b/gi,
    type: 'colloquial',
    severity: 2,
    description: 'Colloquial language'
  }
};

/**
 * Punctuation errors
 */
export const PUNCTUATION_ERRORS = [
  {
    id: 'space-before-punctuation',
    pattern: /\s+[.,!?;:]/g,
    type: 'punctuation-spacing',
    severity: 1,
    description: 'Space before punctuation'
  },
  {
    id: 'multiple-punctuation',
    pattern: /[.!?]{2,}/g,
    type: 'punctuation-repetition',
    severity: 1,
    description: 'Multiple punctuation marks'
  },
  {
    id: 'missing-space-after',
    pattern: /[.,!?;:][a-zA-Z]/g,
    type: 'punctuation-spacing',
    severity: 1,
    description: 'Missing space after punctuation'
  },
  {
    id: 'quotation-spacing',
    pattern: /[.,!?]\s*["']/g,
    type: 'quotation-punctuation',
    severity: 1,
    description: 'Quotation mark placement'
  }
];

/**
 * Error severity weights for scoring
 */
export const ERROR_SEVERITY_WEIGHTS = {
  0: 0.5,
  1: 1.0,
  2: 2.0,
  3: 3.0
};

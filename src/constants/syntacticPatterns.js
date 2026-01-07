/**
 * Syntactic Pattern Constants
 * Patterns for analyzing sentence structure and writing style
 */

/**
 * Sentence opening patterns - categorize how sentences begin
 */
export const SENTENCE_OPENINGS = {
  subject: {
    pattern: /^(i|we|he|she|it|they|the|this|that|these|those|many|some|most|all|each|every|any|a|an)\b/i,
    label: 'Subject'
  },
  conjunction: {
    pattern: /^(and|but|or|so|yet|nor|for)\b/i,
    label: 'Conjunction'
  },
  adverb: {
    pattern: /^(however|therefore|moreover|furthermore|additionally|consequently|thus|hence|nevertheless|meanwhile|likewise|similarly|indeed|certainly|clearly|obviously|perhaps|possibly|probably|unfortunately|fortunately|interestingly|surprisingly|notably|specifically|particularly|especially)\b/i,
    label: 'Adverb'
  },
  prepositional: {
    pattern: /^(in|on|at|by|with|from|to|for|of|about|after|before|during|through|under|over|between|among|across|along|around|near|beyond)\b/i,
    label: 'Prepositional'
  },
  subordinate: {
    pattern: /^(although|though|even though|whereas|while|whilst|because|since|as|if|unless|until|when|whenever|where|wherever|after|before)\b/i,
    label: 'Subordinate'
  },
  interrogative: {
    pattern: /^(who|what|when|where|why|how|which|whose|whom)\b/i,
    label: 'Interrogative'
  },
  infinitive: {
    pattern: /^(to\s+[a-z]+)\b/i,
    label: 'Infinitive'
  },
  participial: {
    pattern: /^([a-z]+ing|[a-z]+ed)\s/i,
    label: 'Participial'
  }
};

/**
 * Clause markers for complexity analysis
 */
export const CLAUSE_MARKERS = {
  coordinating: {
    words: ['and', 'but', 'or', 'so', 'yet', 'nor', 'for'],
    label: 'Coordinating'
  },
  subordinating: {
    words: [
      'because', 'since', 'as', 'although', 'though', 'even though',
      'while', 'whereas', 'if', 'unless', 'until', 'when', 'whenever',
      'where', 'wherever', 'after', 'before', 'that', 'which', 'who'
    ],
    label: 'Subordinating'
  },
  correlative: {
    words: [
      'either...or', 'neither...nor', 'not only...but also',
      'both...and', 'whether...or'
    ],
    label: 'Correlative'
  }
};

/**
 * Sentence complexity markers
 */
export const COMPLEXITY_MARKERS = {
  simple: {
    maxClauses: 1,
    description: 'Single independent clause'
  },
  compound: {
    hasCoordinating: true,
    description: 'Two or more independent clauses'
  },
  complex: {
    hasSubordinating: true,
    description: 'Independent clause with dependent clause'
  },
  compoundComplex: {
    hasCoordinating: true,
    hasSubordinating: true,
    description: 'Multiple independent clauses with dependent clause'
  }
};

/**
 * Rhetorical device patterns
 */
export const RHETORICAL_PATTERNS = {
  parallelism: {
    pattern: /\b(not only .+ but also|both .+ and|either .+ or|neither .+ nor)\b/i,
    label: 'Parallelism'
  },
  repetition: {
    pattern: /\b(\w+)\b.*\b\1\b/i,
    label: 'Repetition'
  },
  question: {
    pattern: /\?$/,
    label: 'Question'
  },
  exclamation: {
    pattern: /!$/,
    label: 'Exclamation'
  }
};

/**
 * Academic writing markers
 */
export const ACADEMIC_MARKERS = {
  hedging: [
    'might', 'may', 'could', 'would', 'should', 'possibly', 'perhaps',
    'probably', 'likely', 'unlikely', 'seems', 'appears', 'tends to',
    'suggests', 'indicates', 'implies'
  ],
  boosting: [
    'clearly', 'obviously', 'certainly', 'definitely', 'undoubtedly',
    'indeed', 'always', 'never', 'must', 'will', 'proves', 'demonstrates'
  ],
  signposting: [
    'firstly', 'secondly', 'thirdly', 'finally', 'in conclusion',
    'to summarize', 'to sum up', 'in summary', 'in brief',
    'to begin with', 'moving on to', 'turning to', 'next'
  ]
};

/**
 * Punctuation patterns for style analysis
 */
export const PUNCTUATION_PATTERNS = {
  semicolon: {
    pattern: /;/g,
    label: 'Semicolon',
    weight: 2
  },
  colon: {
    pattern: /(?<!:):/g,
    label: 'Colon',
    weight: 1
  },
  dash: {
    pattern: /—|--/g,
    label: 'Dash',
    weight: 1
  },
  parenthetical: {
    pattern: /\([^)]+\)/g,
    label: 'Parenthetical',
    weight: 1
  },
  comma: {
    pattern: /,/g,
    label: 'Comma',
    weight: 0.5
  }
};

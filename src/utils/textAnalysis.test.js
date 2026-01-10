import { describe, it, expect } from 'vitest'
import {
  countSyllables,
  analyzeSentences,
  calculateSentenceStats,
  calculateReadability,
  analyzeVocabulary,
  analyzeVariation
} from './textAnalysis'

describe('countSyllables', () => {
  it('counts single syllable words', () => {
    expect(countSyllables('cat')).toBe(1)
    expect(countSyllables('the')).toBe(1)
    expect(countSyllables('dog')).toBe(1)
  })

  it('counts two syllable words', () => {
    expect(countSyllables('happy')).toBe(2)
    expect(countSyllables('water')).toBe(2)
  })

  it('counts multi-syllable words', () => {
    expect(countSyllables('beautiful')).toBe(3)
    expect(countSyllables('university')).toBe(5)
    expect(countSyllables('particularly')).toBe(5)
  })

  it('handles silent e', () => {
    expect(countSyllables('make')).toBe(1)
    expect(countSyllables('cake')).toBe(1)
    expect(countSyllables('love')).toBe(1)
  })

  it('returns 1 for very short words', () => {
    expect(countSyllables('a')).toBe(1)
    expect(countSyllables('an')).toBe(1)
    expect(countSyllables('be')).toBe(1)
  })

  it('handles words with consecutive vowels', () => {
    expect(countSyllables('queue')).toBeGreaterThanOrEqual(1)
    expect(countSyllables('beautiful')).toBe(3)
  })
})

describe('analyzeSentences', () => {
  it('splits text into sentences', () => {
    const text = 'First sentence. Second sentence!'
    const result = analyzeSentences(text)
    expect(result).toHaveLength(2)
  })

  it('returns sentence objects with correct properties', () => {
    const text = 'This is a test sentence.'
    const result = analyzeSentences(text)
    expect(result[0]).toHaveProperty('index', 1)
    expect(result[0]).toHaveProperty('text')
    expect(result[0]).toHaveProperty('wordCount')
    expect(result[0]).toHaveProperty('syllableCount')
  })

  it('counts words per sentence', () => {
    const text = 'One two three four five.'
    const result = analyzeSentences(text)
    expect(result[0].wordCount).toBe(5)
  })

  it('handles multiple sentence endings', () => {
    const text = 'Really?! Yes. Okay...'
    const result = analyzeSentences(text)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('filters out empty sentences', () => {
    const text = 'Hello.   .World.'
    const result = analyzeSentences(text)
    result.forEach(s => {
      expect(s.wordCount).toBeGreaterThan(0)
    })
  })

  it('handles text without ending punctuation', () => {
    const text = 'This has no ending'
    const result = analyzeSentences(text)
    expect(result).toHaveLength(1)
    expect(result[0].wordCount).toBe(4)
  })

  it('handles abbreviations (Dr., Mr., etc.)', () => {
    const text = 'Dr. Smith went home. He was tired.'
    const result = analyzeSentences(text)
    expect(result).toHaveLength(2)
    expect(result[0].text).toContain('Dr. Smith')
  })

  it('handles decimal numbers', () => {
    const text = 'The value is 3.14 exactly. That is pi.'
    const result = analyzeSentences(text)
    expect(result).toHaveLength(2)
    expect(result[0].text).toContain('3.14')
  })

  it('handles i.e. and e.g.', () => {
    const text = 'Use a connector, i.e. a USB cable. It works well.'
    const result = analyzeSentences(text)
    expect(result).toHaveLength(2)
  })
})

describe('calculateSentenceStats', () => {
  it('calculates mean sentence length', () => {
    const sentences = [
      { wordCount: 5 },
      { wordCount: 10 },
      { wordCount: 15 }
    ]
    const result = calculateSentenceStats(sentences)
    expect(parseFloat(result.mean)).toBe(10)
  })

  it('finds min and max', () => {
    const sentences = [
      { wordCount: 5 },
      { wordCount: 10 },
      { wordCount: 15 }
    ]
    const result = calculateSentenceStats(sentences)
    expect(result.min).toBe(5)
    expect(result.max).toBe(15)
  })

  it('calculates standard deviation', () => {
    const sentences = [
      { wordCount: 10 },
      { wordCount: 10 },
      { wordCount: 10 }
    ]
    const result = calculateSentenceStats(sentences)
    expect(parseFloat(result.stdDev)).toBe(0)
  })

  it('returns total sentence count', () => {
    const sentences = [
      { wordCount: 5 },
      { wordCount: 10 }
    ]
    const result = calculateSentenceStats(sentences)
    expect(result.total).toBe(2)
  })

  it('handles empty array', () => {
    const result = calculateSentenceStats([])
    expect(result.mean).toBe(0)
    expect(result.total).toBe(0)
  })
})

describe('calculateReadability', () => {
  it('returns a numeric grade level', () => {
    const sentences = [
      { wordCount: 10, syllableCount: 15 },
      { wordCount: 10, syllableCount: 15 }
    ]
    const result = calculateReadability(sentences, 20)
    expect(typeof parseFloat(result.grade)).toBe('number')
  })

  it('calculates Flesch-Kincaid correctly', () => {
    // 10 sentences, 100 words total, 150 syllables
    const sentences = Array(10).fill({ wordCount: 10, syllableCount: 15 })
    const result = calculateReadability(sentences, 100)
    expect(parseFloat(result.grade)).toBeCloseTo(6, 0)
  })

  it('handles zero sentences gracefully', () => {
    const result = calculateReadability([], 0)
    expect(result.grade).toBe(0)
  })

  it('clamps grade to valid range', () => {
    const sentences = [{ wordCount: 5, syllableCount: 5 }]
    const result = calculateReadability(sentences, 5)
    expect(parseFloat(result.grade)).toBeGreaterThanOrEqual(0)
  })
})

describe('analyzeVocabulary', () => {
  it('counts total words', () => {
    const text = 'one two three four five'
    const result = analyzeVocabulary(text)
    expect(result.totalWords).toBe(5)
  })

  it('counts unique words', () => {
    const text = 'the the the cat cat dog'
    const result = analyzeVocabulary(text)
    expect(result.uniqueWords).toBe(3)
  })

  it('calculates type-token ratio', () => {
    const text = 'unique words only here'
    const result = analyzeVocabulary(text)
    expect(parseFloat(result.ttr)).toBe(100.0) // Returns percentage
  })

  it('calculates sophistication ratio', () => {
    const text = 'the a is extraordinary phenomenal magnificent'
    const result = analyzeVocabulary(text)
    expect(result.sophisticationRatio).toBeGreaterThan(0)
  })

  it('handles empty text', () => {
    const result = analyzeVocabulary('')
    expect(result.totalWords).toBe(0)
    expect(result.uniqueWords).toBe(0)
  })
})

describe('analyzeVariation', () => {
  it('calculates coefficient of variation', () => {
    const sentences = [
      { wordCount: 10 },
      { wordCount: 10 },
      { wordCount: 10 }
    ]
    const result = analyzeVariation(sentences)
    expect(parseFloat(result.cv)).toBe(0)
  })

  it('returns higher CV for varied sentence lengths', () => {
    const varied = [
      { wordCount: 5 },
      { wordCount: 15 },
      { wordCount: 25 }
    ]
    const uniform = [
      { wordCount: 15 },
      { wordCount: 15 },
      { wordCount: 15 }
    ]
    const variedResult = analyzeVariation(varied)
    const uniformResult = analyzeVariation(uniform)
    expect(parseFloat(variedResult.cv)).toBeGreaterThan(parseFloat(uniformResult.cv))
  })

  it('handles single sentence', () => {
    const result = analyzeVariation([{ wordCount: 10 }])
    expect(result.cv).toBeDefined()
  })

  it('handles empty array', () => {
    const result = analyzeVariation([])
    expect(parseFloat(result.cv)).toBe(0)
  })
})

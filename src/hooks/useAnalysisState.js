import { useState, useCallback, useMemo } from 'react';
import { runFullAnalysis } from '../utils/textAnalysis';
import { getWordCount } from '../utils/textHelpers';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for managing text analysis state
 * Handles analysis text input, results, and display modes
 */
export function useAnalysisState() {
  const [analysisText, setAnalysisText] = useState('');
  const [results, setResults] = useState(null);
  const [highlightMode, setHighlightMode] = useState('none');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce text for word count calculation to avoid excessive recalculations
  const debouncedText = useDebounce(analysisText, 300);
  const wordCount = useMemo(() => getWordCount(debouncedText), [debouncedText]);

  const handleAnalyze = useCallback(() => {
    if (!analysisText.trim()) return;
    try {
      setResults(runFullAnalysis(analysisText));
      setHighlightMode('none');
    } catch (error) {
      alert(error.message);
    }
  }, [analysisText]);

  const clearAnalysis = useCallback(() => {
    setAnalysisText('');
    setResults(null);
    setHighlightMode('none');
    setShowAdvanced(false);
  }, []);

  return {
    // State
    analysisText,
    results,
    highlightMode,
    showAdvanced,
    wordCount,

    // Setters
    setAnalysisText,
    setHighlightMode,
    setShowAdvanced,

    // Actions
    handleAnalyze,
    clearAnalysis
  };
}

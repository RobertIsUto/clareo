import { useState, useCallback, useRef } from 'react';
import { runFullAnalysis } from '../utils/textAnalysis';
import { THRESHOLDS } from '../constants/thresholds';

const MAX_UNDO_STACK_SIZE = 10;

/**
 * Custom hook for managing baseline samples with undo capability
 * Handles baseline input, assignment type, sample management, and undo/redo
 */
export function useBaselineManagement() {
  const [baselineInput, setBaselineInput] = useState('');
  const [assignmentType, setAssignmentType] = useState('essay');
  const [baselineSamples, setBaselineSamples] = useState([]);

  // Undo stack for deleted samples
  const undoStackRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);

  const addBaselineSample = useCallback(() => {
    if (!baselineInput.trim()) return;

    const analysis = runFullAnalysis(baselineInput);

    if (analysis.vocabulary.totalWords < THRESHOLDS.MIN_WORDS) {
      if (!window.confirm(
        'This sample is very short (<100 words) and might skew your baseline data. Add it anyway?'
      )) {
        return;
      }
    }

    const newSample = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      fullText: baselineInput,
      preview: baselineInput.slice(0, 50) + '...',
      data: analysis,
      metadata: {
        wordCount: analysis.vocabulary.totalWords,
        dateAdded: new Date().toISOString(),
        assignmentType: assignmentType,
        isOutlier: false
      }
    };

    setBaselineSamples(prev => [...prev, newSample]);
    setBaselineInput('');
  }, [baselineInput, assignmentType]);

  const removeBaseline = useCallback((id) => {
    setBaselineSamples(prev => {
      const sampleToRemove = prev.find(s => s.id === id);
      if (sampleToRemove) {
        // Add to undo stack
        undoStackRef.current = [
          { sample: sampleToRemove, removedAt: Date.now() },
          ...undoStackRef.current
        ].slice(0, MAX_UNDO_STACK_SIZE);
        setCanUndo(true);
      }
      return prev.filter(s => s.id !== id);
    });
  }, []);

  const undoRemove = useCallback(() => {
    if (undoStackRef.current.length === 0) return;

    const [lastRemoved, ...rest] = undoStackRef.current;
    undoStackRef.current = rest;

    setBaselineSamples(prev => {
      // Insert at original position based on timestamp
      const newSamples = [...prev, lastRemoved.sample];
      return newSamples.sort((a, b) => a.timestamp - b.timestamp);
    });

    setCanUndo(rest.length > 0);
  }, []);

  const clearUndoStack = useCallback(() => {
    undoStackRef.current = [];
    setCanUndo(false);
  }, []);

  const clearAllSamples = useCallback(() => {
    // Store all current samples in undo stack before clearing
    const currentSamples = baselineSamples.map(sample => ({
      sample,
      removedAt: Date.now()
    }));
    undoStackRef.current = [...currentSamples, ...undoStackRef.current].slice(0, MAX_UNDO_STACK_SIZE);
    if (currentSamples.length > 0) {
      setCanUndo(true);
    }
    setBaselineSamples([]);
  }, [baselineSamples]);

  return {
    // State
    baselineInput,
    assignmentType,
    baselineSamples,
    canUndo,

    // Setters
    setBaselineInput,
    setAssignmentType,

    // Actions
    addBaselineSample,
    removeBaseline,
    undoRemove,
    clearUndoStack,
    clearAllSamples
  };
}

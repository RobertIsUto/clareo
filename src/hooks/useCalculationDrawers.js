import { useState, useCallback } from 'react';

/**
 * Custom hook for managing calculation drawer state
 * Handles both comparison and analysis drawer modes
 */
export function useCalculationDrawers() {
  // Comparison drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMetric, setDrawerMetric] = useState(null); // null = composite, string = metric key

  // Analysis drawer state
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [analysisDrawerMetric, setAnalysisDrawerMetric] = useState(null);

  // Comparison drawer handlers
  const handleMetricClick = useCallback((metricKey) => {
    setDrawerMetric(metricKey);
    setDrawerOpen(true);
  }, []);

  const handleCompositeClick = useCallback(() => {
    setDrawerMetric(null); // null indicates composite score
    setDrawerOpen(true);
  }, []);

  // Analysis drawer handlers
  const handleAnalysisMetricClick = useCallback((metricKey) => {
    setAnalysisDrawerMetric(metricKey);
    setAnalysisDrawerOpen(true);
  }, []);

  // Close handlers
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setAnalysisDrawerOpen(false);
  }, []);

  const closeComparisonDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const closeAnalysisDrawer = useCallback(() => {
    setAnalysisDrawerOpen(false);
  }, []);

  return {
    // Comparison drawer
    drawerOpen,
    drawerMetric,
    handleMetricClick,
    handleCompositeClick,
    closeComparisonDrawer,

    // Analysis drawer
    analysisDrawerOpen,
    analysisDrawerMetric,
    handleAnalysisMetricClick,
    closeAnalysisDrawer,

    // Combined close
    handleDrawerClose
  };
}

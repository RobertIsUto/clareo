import React from 'react';

export const PhraseSuggestions = ({ phrases }) => {
  if (!phrases || phrases.length === 0) return null;

  return (
    <div className="phrase-suggestion">
      <h4>Suggested Alternatives</h4>
      <div className="suggestion-list">
        {phrases.slice(0, 8).map((p, i) => (
          <div key={i} className="suggestion-item">
            <span className="suggestion-found">{p.phrase}</span>
            <span className="suggestion-arrow">→</span>
            <span className="suggestion-try">{p.suggestion}</span>
            <span className="suggestion-count">×{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

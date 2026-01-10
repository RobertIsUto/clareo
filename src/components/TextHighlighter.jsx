import React, { useMemo, memo } from 'react';
import { FORMAL_REGISTER_PHRASES, CONNECTIVES, FORMULAIC_NGRAMS } from '../constants/phrases.js';

export const TextHighlighter = memo(function TextHighlighter({ text, mode }) {
  const highlightedText = useMemo(() => {
    if (mode === "none") return <div className="text-content">{text}</div>;

    let regex;
    let className = "";

    if (mode === "formal") {
      const phrases = FORMAL_REGISTER_PHRASES.map((p) => p.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
      regex = new RegExp(`(${phrases})`, "gi");
      className = "highlight-formal";
    } else if (mode === "passive") {
      regex = /\b((?:is|are|was|were|been|being|be)\s+(?:\w+ed|written|spoken|taken|given|made|done|seen|known|found|thought|begun|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|grown|hidden|ridden|risen|shaken|stolen|thrown|worn))\b/gi;
      className = "highlight-passive";
    } else if (mode === "connectives") {
      const allConnectives = Object.values(CONNECTIVES).flat();
      const pattern = allConnectives.map((w) => `\\b${w}\\b`).join("|");
      regex = new RegExp(`(${pattern})`, "gi");
      className = "highlight-connective";
    } else if (mode === "ngrams") {
      const allNgrams = [...FORMULAIC_NGRAMS.trigrams, ...FORMULAIC_NGRAMS.bigrams];
      const pattern = allNgrams.map(ng => ng.replace(/\s+/g, "\\s+")).join("|");
      regex = new RegExp(`(${pattern})`, "gi");
      className = "highlight-ngram";
    }

    const split = text.split(regex);
    return (
      <div className="text-content">
        {split.map((part, i) => {
          if (regex && part.match(regex)) {
            return (
              <span key={i} className={className}>
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  }, [text, mode]);

  return <div className="highlighter-container">{highlightedText}</div>;
});

'use client';

import { useEffect, useCallback } from 'react';
import { useSuggestion, Document } from '../suggestion-provider';
import { useApplication } from '../context-provider';

export function Autocomplete() {
    const {
        results, showResults, setShowResults, setQuery,
        searchResultsRef, searchInputRef, isSelectingRef
    } = useSuggestion();
    const application = useApplication();

    // Handle color selection
    const handleColorSelect = (doc: Document) => {
        isSelectingRef.current = true;
        application.setTargetColor(doc.hex);
        setQuery('');
        setShowResults(false);
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(e.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [searchResultsRef, searchInputRef, setShowResults]);

    // Handle escape key
    const escFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setShowResults(false);
        }
    }, [setShowResults]);

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [escFunction]);

    if (!showResults || results.length === 0) return null;

    return (
        <>
            <div
                ref={searchResultsRef}
                id="searchResults"
                className="search-results active"
            >
                {results.map((doc, i) => (
                    <div
                        key={doc.hex + i}
                        className="search-result-item"
                        onClick={() => handleColorSelect(doc)}
                    >
                        <div
                            className="result-swatch"
                            style={{ '--swatch-color': doc.hex } as React.CSSProperties}
                        />
                        <div
                            className="result-swatch"
                            style={{ opacity: 0.5, marginLeft: '-20px', '--swatch-color': doc.hex } as React.CSSProperties}
                        />
                        <div className="result-info">
                            <span className="result-name">{doc.name}</span>
                            <span className="result-brand">{doc.brand || 'color-name-list (MIT)'}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ position: "absolute" }}>
                <button
                    style={{ position: "absolute", top: '390px', left: '150px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' }}
                    onClick={() => setShowResults(false)}
                >
                    Close
                </button>
            </div>
        </>
    );
}

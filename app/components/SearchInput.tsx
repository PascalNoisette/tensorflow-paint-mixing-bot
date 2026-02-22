'use client';

import { colornames } from 'color-name-list/short';
import { useSuggestion, Document } from '../suggestion-provider';

export function SearchInput() {
    const { query, setQuery, setResults, setShowResults, searchInputRef, customColors } = useSuggestion();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const idx = (window as any).__lunrIndex;
        if (!idx) return;

        const searchResults = idx.search(value.split(' ').filter(s => s.trim().length > 0).map(s => '+' + s.trim()).join(' '));
        const allColors = [...colornames, ...customColors];

        if (searchResults.length > 0) {
            const matchedDocs = searchResults
                .slice(0, 40)
                .map((result: any) => allColors[parseInt(result.ref)])
                .filter((doc: any): doc is Document => doc !== undefined);

            setResults(matchedDocs);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    return (
        <input
            ref={searchInputRef}
            type="text"
            id="searchInput"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputChange}
            placeholder="Search colors..."
            className="search-input"
            autoComplete="off"
        />
    );
}

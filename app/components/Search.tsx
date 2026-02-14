'use client';

import { useState, useEffect, useRef } from 'react';
import lunr from 'lunr';
import { useApplication } from '../context-provider';
import { colornames } from 'color-name-list/short'

interface Document {
  name: string;
  hex: string;
  index?: number;
  brand?: string;
}



export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [customColors, setCustomColors] = useState<Document[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const application = useApplication();

  // Load custom colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('colornames');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomColors(parsed);
        }
      } catch (e) {
        console.error('Failed to parse custom colors', e);
      }
    }
  }, []);

  // Initialize lunr index
  useEffect(() => {

    const idx = lunr(function (this: lunr.Builder) {
      this.ref('index')
      this.field('name');
      this.field('brand');

      let idxCounter = 0;

      const builder = this;

      colornames.forEach(function (doc) {
        builder.add({ ...doc, index: idxCounter++ });
      });

      customColors.forEach(function (doc) {
        builder.add({ ...doc, index: idxCounter++ });
      });
    });

    // Store index in window for access in event handlers
    (window as any).__lunrIndex = idx;
  }, [customColors]);

  // Handle search input
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


    // Perform search with wildcard for partial matches
    const searchResults = idx.search(value.split(' ').filter(s => s.trim().length > 0).map(s => '+' + s.trim()).join(' '));

    // Combine sources for lookup
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

  // Handle click outside to close results
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
  }, []);

  // Handle color selection
  const handleColorSelect = (doc: Document) => {
    application.setTargetColor(doc.hex);
    setQuery('');
    setShowResults(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Get existing
          const existing = localStorage.getItem('colornames');
          let current: Document[] = [];
          if (existing) {
            try {
              current = JSON.parse(existing);
            } catch { }
          }

          const newData = [...current, ...json];
          localStorage.setItem('colornames', JSON.stringify(newData));
          setCustomColors(newData);
          alert(`Imported ${json.length} colors!`);
        } else {
          alert('Invalid JSON format. Expected an array.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="search" className="search-container">
      <div className="search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          id="searchInput"
          value={query}
          onChange={handleInputChange}
          placeholder="Search colors..."
          className="search-input"
        />
        <button
          className="upload-btn"
          onClick={triggerFileUpload}
          title="Upload more custom colors (JSON)"
          style={{ position: 'relative', top: '-2.6em', right: '2px', float: 'right', cursor: 'pointer', padding: '4px 12px;', backgroundColor: "#fff", border: "1px solid lightgray", color: 'gray' }}
        >
          Upload
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileUpload}
        />
      </div>

      {showResults && results.length > 0 && (
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
                style={{ backgroundColor: doc.hex }}
              />
              <div className="result-info">
                <span className="result-name">{doc.name}</span>
                <span className="result-brand">{doc.brand || 'from npm package color-name-list (MIT)'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
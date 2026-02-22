'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import lunr from 'lunr';
import { colornames } from 'color-name-list/short';
import { kdTree as KDTree } from 'kd-tree-javascript';
import { hexToRgb } from './lib/convertion';

export interface Document {
    name: string;
    hex: string;
    index?: number;
    brand?: string;
}

interface SuggestionContextType {
    query: string;
    setQuery: (query: string) => void;
    results: Document[];
    setResults: (results: Document[]) => void;
    showResults: boolean;
    setShowResults: (show: boolean) => void;
    customColors: Document[];
    setCustomColors: (colors: Document[]) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    searchResultsRef: React.RefObject<HTMLDivElement | null>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isSelectingRef: React.MutableRefObject<boolean>;
    isInitialMountRef: React.MutableRefObject<boolean>;
    moreLikeThis: (color: string | { r: number, g: number, b: number } | [number, number, number], event?: React.SyntheticEvent | Event) => void;
}

const SuggestionContext = createContext<SuggestionContextType | undefined>(undefined);

export function SuggestionProvider({ children }: { children: ReactNode }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Document[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [customColors, setCustomColors] = useState<Document[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchResultsRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isSelectingRef = useRef(false);
    const isInitialMountRef = useRef(true);

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

    // Initialize lunr index and KDTree
    useEffect(() => {
        const idx = lunr(function (this: lunr.Builder) {
            this.ref('index');
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

        (window as any).__lunrIndex = idx;

        const allColors = [...colornames, ...customColors].map(c => ({
            ...c,
            ...hexToRgb(c.hex)
        }));

        const distance = (a: any, b: any) => {
            return Math.sqrt(
                Math.pow(a.r - b.r, 2) +
                Math.pow(a.g - b.g, 2) +
                Math.pow(a.b - b.b, 2)
            );
        }

        const tree = new (KDTree as any)(allColors, distance, ['r', 'g', 'b']);
        (window as any).__kdTree = tree;
    }, [customColors]);


    const moreLikeThis = useCallback((
        color: string | { r: number; g: number; b: number } | [number, number, number],
        event?: React.SyntheticEvent | Event
    ) => {
        if (event) {
            event.stopPropagation();
            if ('nativeEvent' in event) {
                event.nativeEvent.stopImmediatePropagation();
            }
        }

        let rgb: { r: number; g: number; b: number };

        if (typeof color === 'string') {
            rgb = hexToRgb(color);
        } else if (Array.isArray(color)) {
            rgb = { r: color[0], g: color[1], b: color[2] };
        } else {
            rgb = color;
        }

        const tree = (window as any).__kdTree;
        if (!tree) return;
        const nearest = tree.nearest(rgb, 8);
        setResults(nearest.reverse().map((n: any) => n[0]));
        setShowResults(true);
    }, []);

    return (
        <SuggestionContext.Provider value={{
            query, setQuery, results, setResults, showResults, setShowResults,
            customColors, setCustomColors,
            searchInputRef, searchResultsRef, fileInputRef,
            isSelectingRef, isInitialMountRef, moreLikeThis
        }}>
            {children}
        </SuggestionContext.Provider>
    );
}

export function useSuggestion() {
    const context = useContext(SuggestionContext);
    if (context === undefined) {
        throw new Error('useSuggestion must be used within a SuggestionProvider');
    }
    return context;
}

'use client';

import { useState, useEffect } from "react";
import { useApplication } from "../context-provider";
import { useSuggestion } from "../suggestion-provider";


export default function Colorpicker() {
    const { targetColor, setTargetColor } = useApplication();
    const [localColor, setLocalColor] = useState(targetColor);
    const { moreLikeThis, searchInputRef, isInitialMountRef, isSelectingRef } = useSuggestion();

    // Sync local color if target color is changed elsewhere (e.g., search selection)
    useEffect(() => {
        setLocalColor(targetColor);
    }, [targetColor]);

    // Throttle/Debounce the global state update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localColor !== targetColor) {
                setTargetColor(localColor);
            }
        }, 150); // 150ms debounce

        return () => clearTimeout(timer);
    }, [localColor, targetColor, setTargetColor]);

    // Effect to handle colorpicker changes for suggestions
    useEffect(() => {
        // Only trigger if we are not currently typing in the search box
        if (document.activeElement === searchInputRef.current) return;

        const tree = (window as any).__kdTree;
        if (!tree) return;

        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }

        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }
        moreLikeThis(targetColor);
    }, [targetColor, searchInputRef, isInitialMountRef, isSelectingRef]);

    return (
        <div className="color-Input-group">
            <label htmlFor="colorPicker">Target Color:</label>
            <input
                type="color"
                id="colorPicker"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
                onClick={(e) => moreLikeThis(localColor, e)}
            />
            <span id="rgbValue">{localColor}</span>
        </div>
    );
}
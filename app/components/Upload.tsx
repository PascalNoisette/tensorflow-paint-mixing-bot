'use client';

import { useSuggestion, Document } from '../suggestion-provider';

export function Upload() {
    const { setCustomColors, fileInputRef } = useSuggestion();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
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

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <button
                className="upload-btn"
                onClick={triggerFileUpload}
                title="Upload more custom colors (JSON)"
                style={{ position: 'relative', top: '-2.6em', right: '2px', float: 'right', cursor: 'pointer', padding: '4px 12px', backgroundColor: "#fff", border: "1px solid lightgray", color: 'gray' }}
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
        </>
    );
}

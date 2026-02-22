import { calculateMix, handleWeightChange } from '../mixing';
import { ApplicationColor } from '../types';
import { useApplication } from '../context-provider';
import { useSuggestion } from '../suggestion-provider';

export function ReceipeSteps({ rIndex, colors, weights }: { rIndex: number, colors: ApplicationColor[], weights: number[] }) {
    const application = useApplication();
    const { moreLikeThis } = useSuggestion();


    return colors.map((_, index: number) => <div key={index} className="step-item">
        <div className="palette-swatch" style={{ '--swatch-color': colors[index].css, borderRadius: "0%" } as React.CSSProperties} onClick={(e) => colors[index].rgb && moreLikeThis(colors[index].rgb, e)}></div>
        <div className="step-details" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input type="number" className="step-weight" value={weights[index]} min="0" onChange={(e) => handleWeightChange(application, rIndex, index, parseFloat(e.target.value) || 0)} autoComplete='off' />
            <span className="action-suffix">{colors[index].colorName}</span>
        </div>
        <div className="step-swatch" onClick={(e) => moreLikeThis(calculateMix(colors.slice(0, index + 1), weights.slice(0, index + 1)), e)} style={{ '--swatch-color': `rgb(${calculateMix(colors.slice(0, index + 1), weights.slice(0, index + 1)).join(',')})`, width: "30px", borderRadius: "50%" } as React.CSSProperties}>
        </div></div>);
}
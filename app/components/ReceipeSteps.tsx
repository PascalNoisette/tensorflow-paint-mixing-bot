import { calculateMix } from '../mixing';
import { ApplicationColor } from '../types';
export function ReceipeSteps({ colors, weights }: { colors: ApplicationColor[], weights: number[] }) {

    return colors.map((_, index: number) => <div key={index} className="step-item">
        <div className="step-swatch" style={{ backgroundColor: `${colors[index].css}` }}></div>
        <div className="step-details" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input type="number" className="step-weight" value={weights[index]} min="0" onChange={() => console.log("not implemented")} />
            <span className="action-suffix">{colors[index].colorName}</span>
        </div>
        <div className="step-swatch" style={{ backgroundColor: `rgb(${calculateMix(colors.slice(0, index + 1), weights.slice(0, index + 1)).join(',')})`, width: "30px", borderRadius: "50%" }}>
        </div></div>);
}
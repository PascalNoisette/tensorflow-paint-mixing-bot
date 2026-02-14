import { useApplication } from "../context-provider";
import { ReceipeSteps } from "./ReceipeSteps";

export function ReceipeList() {
    const application = useApplication();
    return application.recipes.map((recipe, rIndex)=><section key={rIndex + 1} className="results" >
            <h3>Option {rIndex + 1}:  <span style={{fontSize:'0.8em', fontWeight:'normal'}}>(Visual: {Math.max(0, 100 - (recipe.finalDist * 100)).toFixed(1)}%, Mixing: {Math.max(0, 100 - (recipe.finalDistCmyk * 100)).toFixed(1)}%, Pigment: {Math.max(0, 100 - (recipe.finalDistKm * 20)).toFixed(1)}%)</span></h3>
                <div className="comparison" style={{marginBottom: "10px"}}>
                    <div className="swatch-container">
                        <div className="swatch" style={{backgroundColor: `${application.targetColor}`}}></div>
                        <span>Target</span>
                    </div>
                    <div className="swatch-container">
                        <div className="swatch" style={{backgroundColor: `${recipe.finalMix.css}`}}></div>
                        <span>Result</span>
                    </div>
                </div>
                <div className="steps-list" >
                    <ReceipeSteps colors={recipe.colors} weights={recipe.weights}/>
                </div>
        </section>);
}
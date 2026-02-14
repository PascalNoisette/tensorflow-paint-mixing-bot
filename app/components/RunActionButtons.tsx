import { useApplication } from "../context-provider";
import { solveMixing } from "../mixing";

export function RunActionButtons() {
    const application = useApplication();
    return <div className="action-buttons">
        <div className="action-button-container">
            <button onClick={() => solveMixing(application)}>
                Find Mix Recipe
            </button>
            <span className="button-subtitle">Color mixed by Mixbox CC BY-NC 4.0 https://github.com/scrtwpns/mixbox/</span>
        </div>
    </div>;
}
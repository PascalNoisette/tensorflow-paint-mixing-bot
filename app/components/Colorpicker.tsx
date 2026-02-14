import { useApplication } from "../context-provider";

export default function Colorpicker() {
    const application = useApplication();
    return <div className="color-Input-group">
                <label htmlFor="colorPicker">Target Color:</label>
                <input type="color" id="colorPicker" value={application.targetColor} onChange={x=>application.setTargetColor(x.target.value)}/>
                <span id="rgbValue">{application.targetColor}</span>
            </div>;
}
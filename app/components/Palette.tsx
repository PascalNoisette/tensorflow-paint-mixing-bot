import { useApplication } from "../context-provider";

export function Palette() {
    const application = useApplication();
    function update(e: React.ChangeEvent<HTMLInputElement>, index: number) {
        const primaries = application.allowedPrimaries;
        const updatedPrimaries = [...primaries];
        updatedPrimaries[index].checked = e.target.checked;
        application.setAllowedPrimaries(updatedPrimaries)
    }
    return <div className="palette"><span>Palette:</span>
        {application.allowedPrimaries.map((color, index: number) => <input title={color.colorName} type="checkbox" key={index} style={{backgroundColor:color.css, appearance:"none", width:"1em", height:"1em"}} checked={color.checked} onChange={(e) => update(e, index)}/>)}
    </div>
}
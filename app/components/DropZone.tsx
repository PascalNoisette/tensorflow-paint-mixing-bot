import { useApplication } from "../context-provider";
import { handleDrop } from "../mixing";

export function DropZone({ children }: { children: React.ReactNode }) {
    const application = useApplication();

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const colorData = e.dataTransfer.getData("application/json");
        if (!colorData) return;
        handleDrop(application, JSON.parse(colorData));

    };

    return (
        <div
            className="receipe-list-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            style={{ minHeight: application.recipes.length === 0 ? "100px" : "auto", border: application.recipes.length === 0 ? "2px dashed #ccc" : "none", borderRadius: "8px", marginTop: "10px", padding: "10px" }}
        >
            {children}
        </div>
    );
}
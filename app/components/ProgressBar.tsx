import { useState, useEffect } from "react";
import { useApplication } from "../context-provider";

export function ProgressBar() {
    const application = useApplication();
    const [message, setMessage] = useState("");
    useEffect(() => {
        const jokes = [
            "",
            "Projecting RGB to higher-dimensional space (7D Latent)",
            "Select Gradient Descent",
            "Optimizing paint ratios",
            "The optimizer currently works in Latent Space",
            "Machine is learning : max epoch 150, lr 0.01",
            ""
        ];
        setMessage(jokes[Math.min(Math.floor(application.computation / 10), jokes.length - 1)]);
    }, [application.computation]);
    return <div>{message}&nbsp;<br /> &nbsp;{application.computation ? "Computation : " + application.computation : ""}</div>;
}
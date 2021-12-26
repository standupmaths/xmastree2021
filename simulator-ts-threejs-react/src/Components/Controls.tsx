import * as React from "react";
import { useExamplesContext } from "./ExamplesContext";

export const Controls: React.FC = () => {
    const { frames } = useExamplesContext();
    if (!frames) {
        return <UploadControls />;
    }
    return <div></div>;
};
export const UploadControls: React.FC = () => {
    return <div></div>;
};

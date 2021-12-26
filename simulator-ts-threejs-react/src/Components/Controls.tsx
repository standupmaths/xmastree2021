import * as React from "react";
import { useExamplesContext } from "./ExamplesContext";

export const Controls: React.FC = () => {
    const { frames } = useExamplesContext();
    if (!frames) {
        return <UploadControls />;
    }
    return <UploadControls />;
};
export const UploadControls: React.FC = () => {
    return (
        <div>
            <FromUrl />
            <span>or</span>
            <FromFile />
        </div>
    );
};
const FormError: React.FC<{ text: string }> = ({ text }) => {
    if (!text) {
        return null;
    }
    return <p style={{ color: "red" }}>{text}</p>;
};
const FromUrl = () => {
    const onSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }, []);
    return (
        <form onSubmit={onSubmit}>
            <FormError text="asd" />
            <input type="text" placeholder="Enter URL" />
            <input type="submit" />
        </form>
    );
};

const FromFile = () => {
    const onSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }, []);
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            console.log(e.target.files);
        }
    }, []);
    return (
        <form onSubmit={onSubmit}>
            <input onChange={onChange} type="file" placeholder="Upload" accept=".csv" multiple={false} />
            <input type="submit" />
        </form>
    );
};

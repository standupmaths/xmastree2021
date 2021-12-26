import * as React from "react";
import * as ReactDOM from "react-dom";
import { Controls } from "../Components/Controls";
import { ExamplesContextProvider } from "../Components/ExamplesContext";
import { Canvas } from "../Scene/Canvas";
import { Tree } from "../Scene/Tree";

export const App: React.FC = () => {
    return (
        <div>
            <ExamplesContextProvider>
                <Controls />
                <Canvas>
                    <Tree />
                </Canvas>
            </ExamplesContextProvider>
        </div>
    );
};
export const render = (container: HTMLElement) => {
    ReactDOM.render(<App />, container);
};

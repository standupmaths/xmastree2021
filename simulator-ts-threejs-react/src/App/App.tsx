import * as React from "react";
import * as ReactDOM from "react-dom";
import { Controls } from "../Components/Controls";
import { ExamplesContextProvider } from "../Components/ExamplesContext";
import { Canvas } from "../Scene/Canvas";
import { Tree } from "../Scene/Tree";

export const App: React.FC = () => {
    return (
        <>
            <ExamplesContextProvider>
                <div className="section">
                    <Controls />
                </div>
                <div className="section">
                    <div className="columns">
                        <div className="column">
                            <Canvas>
                                <Tree />
                            </Canvas>
                        </div>
                        <div className="column">
                            <h1 className="title">TreeSim by LeQwasd</h1>
                        </div>
                    </div>
                </div>
            </ExamplesContextProvider>
        </>
    );
};
export const render = (container: HTMLElement) => {
    ReactDOM.render(<App />, container);
};

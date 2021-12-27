import * as React from "react";

export interface IAnimation {
    name: string;
    frames: number[][];
}
export interface IExamplesContext {
    animation: IAnimation;
    setAnimation: React.Dispatch<React.SetStateAction<IAnimation>>;
    currentFrame: number;
    setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
    currentFrameRef: React.MutableRefObject<number>;
}
const ExamplesContext = React.createContext<IExamplesContext>(null);
export const ExamplesContextProvider: React.FC = ({ children }) => {
    const [animation, setAnimation] = React.useState<IAnimation>(null);
    const [currentFrame, setCurrentFrame] = React.useState<number>(0);
    const currentFrameRef = React.useRef<number>(0);

    return (
        <ExamplesContext.Provider value={{ animation, setAnimation, currentFrame, setCurrentFrame, currentFrameRef }}>
            {children}
        </ExamplesContext.Provider>
    );
};
export const useExamplesContext = () => React.useContext(ExamplesContext);

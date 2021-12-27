import * as React from "react";
import { getFramesFromUrlForm } from "./Controls";

export interface IAnimation {
    name: string;
    frames: number[][];
}
export interface IExamplesContext {
    animation: IAnimation;
    setAnimation: React.Dispatch<React.SetStateAction<IAnimation>>;
    loadedUrl: string;
    setLoadedUrl: React.Dispatch<React.SetStateAction<string>>;
    currentFrame: number;
    setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
    currentFrameRef: React.MutableRefObject<number>;
}
const ExamplesContext = React.createContext<IExamplesContext>(null);
export const ExamplesContextProvider: React.FC = ({ children }) => {
    const [animation, setAnimation] = React.useState<IAnimation>(null);
    const [loadedUrl, setLoadedUrl] = React.useState<string>(null);
    const [currentFrame, setCurrentFrame] = React.useState<number>(0);
    const currentFrameRef = React.useRef<number>(0);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const url = urlParams.get("url");
        if (url) {
            const params = new FormData();
            params.set("url", url);
            getFramesFromUrlForm(params)
                .then((animation) => {
                    setLoadedUrl(url);
                    setAnimation(animation);
                })
                .catch((e) => {
                    alert(e.message);
                });
        }
    }, []);
    return (
        <ExamplesContext.Provider
            value={{ animation, setAnimation, currentFrame, setCurrentFrame, currentFrameRef, loadedUrl, setLoadedUrl }}
        >
            {children}
        </ExamplesContext.Provider>
    );
};
export const useExamplesContext = () => React.useContext(ExamplesContext);

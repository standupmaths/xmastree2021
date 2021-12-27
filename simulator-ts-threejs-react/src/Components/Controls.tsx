import * as React from "react";
import { IAnimation, useExamplesContext } from "./ExamplesContext";

export const Controls: React.FC = () => {
    const { animation } = useExamplesContext();
    if (!animation) {
        return <UploadControls />;
    }
    return <PlayControls />;
};
export const UploadControls: React.FC = () => {
    return (
        <div className="upload-controls">
            <FromUrl />
            <div>
                <span>or</span>
            </div>
            <FromFile />
            <div>
                <span>or</span>
            </div>
            <KnownAnimations />
        </div>
    );
};
const FormError: React.FC<{ text: string }> = ({ text }) => {
    if (!text) {
        return null;
    }
    return <p style={{ color: "red" }}>{text}</p>;
};
const FromUrl: React.FC = () => {
    const { setAnimation } = useExamplesContext();
    const [error, setError] = React.useState<string>();
    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const data = new FormData(e.target as HTMLFormElement);
            getFramesFromUrlForm(data)
                .then((frames) => {
                    setAnimation(frames);
                })
                .catch((e) => {
                    setError(e.message);
                });
        },
        [setAnimation]
    );
    return (
        <form onSubmit={onSubmit}>
            <FormError text={error} />
            <input name="url" type="text" placeholder="Enter URL" />
            <input type="submit" />
        </form>
    );
};

const FromFile: React.FC = () => {
    const { setAnimation } = useExamplesContext();
    const [error, setError] = React.useState<string>();
    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const data = new FormData(e.target as HTMLFormElement);
            getFramesFromFileForm(data)
                .then((frames) => {
                    setAnimation(frames);
                })
                .catch((e) => {
                    setError(e.message);
                });
        },
        [setAnimation]
    );
    return (
        <form onSubmit={onSubmit}>
            <FormError text={error} />
            <input name="file" type="file" placeholder="Upload" accept=".csv" multiple={false} />
            <input type="submit" />
        </form>
    );
};
const KnownAnimations: React.FC = () => {
    const { setAnimation } = useExamplesContext();
    const [options, setOptions] = React.useState<[string, string][]>([]);
    const [error, setError] = React.useState<string>();
    React.useEffect(() => {
        getKnownAnimations()
            .then((options) => {
                setOptions(options);
            })
            .catch((e) => {
                setError(e.message);
            });
    }, []);
    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const data = new FormData(e.target as HTMLFormElement);
            getFramesFromUrlForm(data)
                .then((frames) => {
                    setAnimation(frames);
                })
                .catch((e) => {
                    setError(e.message);
                });
        },
        [setAnimation]
    );
    return (
        <form onSubmit={onSubmit}>
            <FormError text={error} />
            <select name="url">
                <option />
                {options.map((option) => (
                    <option key={option[1]} value={option[1]}>
                        {option[0]}
                    </option>
                ))}
            </select>
            <input type="submit" />
        </form>
    );
};

const getFramesFromFileForm = async (formData: FormData): Promise<IAnimation> => {
    const file = formData.get("file");
    if (!file) {
        throw new Error("No file selected");
    }
    if (!(file instanceof File)) {
        throw new Error("Not a file...");
    }
    const text = await file.text();
    const frames = parseTextToFrames(text);
    return {
        frames,
        name: file.name
    };
};
const getFramesFromUrlForm = async (formData: FormData): Promise<IAnimation> => {
    const url = formData.get("url") as string;
    const animation = await fetchFromUrl(url);
    return animation;
};

const fetchFromUrl = async (url: string): Promise<IAnimation> => {
    if (!url || !url.startsWith("https://")) {
        throw new Error("Not a correct URL");
    }
    const resp = await fetch(url);
    const text = await resp.text();
    const parts = url.split("/");
    const name = parts[parts.length - 1];
    return {
        name,
        frames: parseTextToFrames(text)
    };
};

const parseTextToFrames = (text: string): number[][] => {
    try {
        const [, ...rows] = text.trim().split("\n");
        return rows.map((row) => {
            const [, ...values] = row.split(",").map(parseFloat);
            return values;
        });
    } catch (e) {
        throw new Error("Error while parsing text. " + e.message);
    }
};

const PlayControls: React.FC = () => {
    const { animation, setAnimation, currentFrame, currentFrameRef, setCurrentFrame } = useExamplesContext();
    const { frames } = animation;
    const [playing, setPlaying] = React.useState<boolean>(false);
    const now = React.useRef<number>(new Date().valueOf());
    const onChangeFrame = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.valueAsNumber;
            currentFrameRef.current = value;
            console.log(value);
            setCurrentFrame(value);
        },
        [setCurrentFrame, currentFrameRef]
    );
    React.useEffect(() => {
        if (!playing) {
            return;
        }
        let animationFrame = 0;
        const animate = () => {
            const frameTime = new Date().valueOf();
            if (frameTime - now.current > 1000 / 60) {
                now.current = frameTime;
                let nextFrame = currentFrameRef.current + 1;
                if (nextFrame === frames.length) {
                    nextFrame = 0;
                }
                currentFrameRef.current = nextFrame;
                setCurrentFrame(nextFrame);
            }
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [frames, setCurrentFrame, currentFrameRef, playing]);
    const togglePlaying = React.useCallback(() => {
        setPlaying((playing) => !playing);
    }, []);
    const stopPlaying = React.useCallback(() => {
        setPlaying(false);
        currentFrameRef.current = 0;
        setCurrentFrame(0);
    }, [setCurrentFrame, currentFrameRef]);
    const onCloseClick = React.useCallback(() => {
        setAnimation(null);
        setCurrentFrame(0);
        currentFrameRef.current = 0;
    }, [setAnimation, setCurrentFrame, currentFrameRef]);
    React.useEffect(() => {
        setPlaying(true);
    }, []);

    return (
        <div>
            <h4>{animation.name}</h4>
            <div>
                <div>
                    <input
                        type="range"
                        min={0}
                        max={animation.frames.length - 1}
                        step={1}
                        value={currentFrame}
                        onChange={onChangeFrame}
                    />
                </div>
                <div>
                    <button onClick={togglePlaying}>{playing ? "\u23f8" : "\u23f5"}</button>
                    {playing && <button onClick={stopPlaying}>{"\u23f9"}</button>}
                </div>
                <div>
                    <button onClick={onCloseClick}>Close</button>
                </div>
            </div>
        </div>
    );
};

const getKnownAnimations = async (): Promise<[string, string][]> => {
    const resp = await fetch("known-frames.json");
    const data: string[] = await resp.json();
    return data.map((url) => {
        const parts = url.split("/");
        const name = parts[parts.length - 1];
        return [name, url];
    });
};

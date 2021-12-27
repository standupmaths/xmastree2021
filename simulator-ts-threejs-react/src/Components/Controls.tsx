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
        <div>
            <FromUrl />
            <div className="has-text-centered">
                <span>or</span>
            </div>
            <FromFile />
            <div className="has-text-centered">
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
    return <p className="help is-danger">{text}</p>;
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
            <div className="field has-addons">
                <div className="control is-expanded">
                    <input className="input is-fullwidth" name="url" type="text" placeholder="Enter URL" />
                </div>
                <div className="control">
                    <input type="submit" className="button is-primary" />
                </div>
            </div>
            <FormError text={error} />
        </form>
    );
};

const FromFile: React.FC = () => {
    const { setAnimation } = useExamplesContext();
    const [error, setError] = React.useState<string>();
    const [fileName, setFileName] = React.useState<string>();
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
        <>
            <form onSubmit={onSubmit}>
                <div className="file has-name is-fullwidth field has-addons">
                    <label className="file-label">
                        <input
                            onChange={(e) => setFileName(e.target.files.item(0)?.name)}
                            className="file-input"
                            type="file"
                            name="file"
                            accept=".csv"
                            multiple={false}
                        />
                        <span className="file-cta">
                            {/* <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span> */}
                            <span className="file-label">Choose a file…</span>
                        </span>
                        <span className="file-name" style={{ borderRadius: 0 }}>
                            {fileName}
                        </span>
                    </label>
                    <div className="control">
                        <input type="submit" className="button is-primary" />
                    </div>
                </div>
                <FormError text={error} />
            </form>
        </>
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
            <div className="field has-addons">
                <div className="control is-expanded">
                    <div className="select is-fullwidth">
                        <select name="url">
                            <option />
                            {options.map((option) => (
                                <option key={option[1]} value={option[1]}>
                                    {option[0]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="control">
                    <input type="submit" className="button is-primary" />
                </div>
            </div>
            <FormError text={error} />
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
export const getFramesFromUrlForm = async (formData: FormData): Promise<IAnimation> => {
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
            const [, ...values] = row.split(",").map((value) => {
                const numberValue = parseFloat(value);
                if (isNaN(numberValue)) {
                    throw new Error("Value in the animation is not a number!");
                }
                return numberValue;
            });
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
    const requestRef = React.useRef<number>(null);
    const refPlaying = React.useRef<boolean>(false);
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
        if (!playing || !refPlaying.current) {
            cancelAnimationFrame(requestRef.current);
            return;
        }
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
            if (refPlaying.current) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [frames, setCurrentFrame, currentFrameRef, playing]);
    const togglePlaying = React.useCallback(() => {
        setPlaying((playing) => {
            refPlaying.current = !playing;
            return !playing;
        });
    }, []);
    const stopPlaying = React.useCallback(() => {
        setPlaying(() => {
            refPlaying.current = false;
            return false;
        });
        currentFrameRef.current = 0;
        setCurrentFrame(0);
    }, [setCurrentFrame, currentFrameRef]);
    const onCloseClick = React.useCallback(() => {
        setAnimation(null);
        setCurrentFrame(0);
        currentFrameRef.current = 0;
    }, [setAnimation, setCurrentFrame, currentFrameRef]);
    React.useEffect(() => {
        setPlaying(() => {
            refPlaying.current = true;
            return true;
        });
        return () => {
            refPlaying.current = false;
        };
    }, []);

    return (
        <div>
            <h4 className="subtitle">{animation.name}</h4>
            <div>
                <div className="field">
                    <label htmlFor="frame" className="label">
                        {currentFrame}/{animation.frames.length - 1}
                    </label>
                    <input
                        className="slider is-fullwidth"
                        type="range"
                        name="frame"
                        min={0}
                        max={animation.frames.length - 1}
                        step={1}
                        value={currentFrame}
                        onChange={onChangeFrame}
                    />
                </div>
                <div className="buttons">
                    <button className="button" onClick={togglePlaying}>
                        {playing ? "\u23f8" : "\u23f5"}
                    </button>
                    {playing && (
                        <button className="button" onClick={stopPlaying}>
                            {"\u23f9"}
                        </button>
                    )}
                    <button className="button is-danger" onClick={onCloseClick}>
                        Close
                    </button>
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

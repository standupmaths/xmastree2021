import * as React from "react";
export interface IExamplesContext {
    frames: number[][];
}
const ExamplesContext = React.createContext<IExamplesContext>(null);
export const ExamplesContextProvider: React.FC = ({ children }) => {
    const [frames, setFrames] = React.useState(null);
    React.useEffect(() => {
        getFrames().then((values) => {
            setFrames(values);
            const maxRowValues = values.map((row) => Math.max(...row));
            const minRowValues = values.map((row) => Math.min(...row));
            console.log(Math.max(...maxRowValues));
            console.log(Math.min(...minRowValues));
        });
    }, []);
    return <ExamplesContext.Provider value={{ frames }}>{children}</ExamplesContext.Provider>;
};
export const useExamplesContext = () => React.useContext(ExamplesContext);

const getFrames = async (): Promise<number[][]> => {
    const resp = await fetch(
        "https://raw.githubusercontent.com/BoostCookie/xmastree2021/main/examples/bouncy-ball.csv"
    );

    const text = await resp.text();
    const [titles, ...rows] = text.split("\n");
    return rows.map((row) => {
        const [index, ...values] = row.split(",").map(parseFloat);
        return values;
    });
};

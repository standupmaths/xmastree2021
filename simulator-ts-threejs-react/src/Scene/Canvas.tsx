import * as React from "react";
import { Scene, PerspectiveCamera, WebGLRenderer, AxesHelper } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const WIDTH = 600;
const HEIGHT = 600;
export const Canvas: React.FC = ({ children }) => {
    const [isInit, setIsInit] = React.useState(false);
    const refCanvasDomNode = React.useRef<HTMLCanvasElement>();
    const refScene = React.useRef<Scene>();
    const refRenderer = React.useRef<WebGLRenderer>();
    const refCamera = React.useRef<PerspectiveCamera>();
    const refControls = React.useRef<OrbitControls>();
    React.useEffect(() => {
        const scene = new Scene();
        const renderer = new WebGLRenderer({ canvas: refCanvasDomNode.current });

        const camera = new PerspectiveCamera();
        camera.up.set(0, 0, 1);
        camera.position.x = 0;
        camera.position.y = 5;
        camera.position.z = 0;

        const controls = new OrbitControls(camera, renderer.domElement);

        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const axisHelper = new AxesHelper(5);
        scene.add(axisHelper);

        const animate = () => {
            requestAnimationFrame(animate);

            // required if controls.enableDamping or controls.autoRotate are set to true
            controls.update();

            renderer.render(scene, camera);
        };
        animate();
        refScene.current = scene;
        refRenderer.current = renderer;
        refCamera.current = camera;
        refControls.current = controls;
        setIsInit(true);
    }, []);

    const sceneContext = React.useMemo<IScene>(() => {
        let sceneContext: IScene = null;
        if (isInit) {
            sceneContext = {
                camera: refCamera.current,
                scene: refScene.current,
                controls: refControls.current
            };
        }
        // @ts-ignore
        window.sceneContext = sceneContext;
        return sceneContext;
    }, [isInit]);

    return (
        <SceneContext.Provider value={sceneContext}>
            <canvas width={WIDTH} height={HEIGHT} ref={refCanvasDomNode} />
            {isInit && children}
        </SceneContext.Provider>
    );
};

export interface IScene {
    scene: Scene;
    camera: PerspectiveCamera;
    controls: OrbitControls;
}
const SceneContext = React.createContext<IScene>(null);
export const useSceneContext = () => React.useContext(SceneContext);

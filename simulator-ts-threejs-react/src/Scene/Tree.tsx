import * as React from "react";
import { BufferAttribute, BufferGeometry, CanvasTexture, Points, PointsMaterial, TextureLoader } from "three";
import { useExamplesContext } from "../Components/ExamplesContext";
import { useSceneContext } from "./Canvas";

export const Tree: React.FC = () => {
    const { scene, camera, controls } = useSceneContext();
    const { animation, currentFrame } = useExamplesContext();
    const [points, setPoints] = React.useState<Points>();
    React.useEffect(() => {
        getTreeMesh().then((tree) => {
            tree.geometry.computeBoundingSphere();
            const { x, y, z } = tree.geometry.boundingSphere.center;
            controls.target.set(x, y, z);
            camera.position.x = 0;
            camera.position.y = tree.geometry.boundingSphere.radius * 3;
            camera.position.z = z;
            scene.add(tree);
            setPoints(tree);
        });
    }, [scene, camera, controls]);
    const colorAttributes = React.useMemo(() => {
        if (!animation) {
            return null;
        }
        return animation.frames.map((frame) => new BufferAttribute(new Float32Array(frame.map((c) => c / 255)), 3));
    }, [animation]);
    React.useEffect(() => {
        if (!points) {
            return;
        }
        if (!colorAttributes) {
            points.geometry.setAttribute("color", getWhiteColors(points.geometry.getAttribute("position").count));
            return;
        }
        points.geometry.setAttribute("color", colorAttributes[currentFrame]);
    }, [colorAttributes, points, currentFrame]);

    return null;
};

const getCoordinates = async (): Promise<BufferAttribute> => {
    const resp = await fetch("https://raw.githubusercontent.com/standupmaths/xmastree2021/main/coords_2021.csv");
    const text = await resp.text();

    const rows = text.split("\n");
    const coordinates: number[] = [];
    for (const row of rows) {
        const [x, y, z] = row.split(",").map(parseFloat);
        coordinates.push(x, y, z);
    }
    return new BufferAttribute(new Float32Array(coordinates), 3);
};
export const getTreeMesh = async (): Promise<Points> => {
    const coordinates = await getCoordinates();
    const geometry = new BufferGeometry();
    const sprite = getCanvasTexture();

    geometry.setAttribute("position", coordinates);
    geometry.setDrawRange(0, 1000);
    const material = new PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        sizeAttenuation: true,
        map: sprite,
        alphaTest: 0.5,
        vertexColors: true,
        transparent: false
    });
    const pointCloud = new Points(geometry, material);
    return pointCloud;
};

const getCanvasTexture = (): CanvasTexture => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, 2 * Math.PI);
    ctx.fill();

    return new CanvasTexture(c);
};

const getWhiteColors = (count: number) => {
    const components: number[] = [];
    for (let i = 0; i < count; i++) {
        components.push(1, 1, 1);
    }
    return new BufferAttribute(new Float32Array(components), 3);
};

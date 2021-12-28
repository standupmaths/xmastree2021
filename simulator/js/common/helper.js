const setLayer = (object, layer) => {
    object.layers.set(layer);
    object.traverse((o) => { o.layers.set(layer); });
};

const onLayer = (object, layer) => {
    const testLayer = new THREE.Layers();
    testLayer.set(layer);
    return object.isMesh ? testLayer.test(object.layers) : null;
};

const createFloatAttribute = (array, itemSize) => {
    const typedArray = new Float32Array(flattenArray(array));
    return new THREE.BufferAttribute(typedArray, itemSize);
};

const createIntAttribute = (array, itemSize) => {
    const typedArray = new Uint16Array(flattenArray(array));
    return new THREE.BufferAttribute(typedArray, itemSize);
};

const normalizeAttribute = (attribute) => {
    const v = new THREE.Vector3();
    for (let i = 0; i < attribute.count; i++) {
        v.set(attribute.getX(i), attribute.getY(i), attribute.getZ(i));
        v.normalize();
        attribute.setXYZ(i, v.x, v.y, v.z);
    }
    return attribute;
};

const flattenArray = (input) => {
    const result = [];
    for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < input[i].length; j++) {
            result.push(input[i][j]);
        }
    }
    return result;
};

const splitArray = (items, chunks) => {
    const result = [];
    const length = Math.ceil(items.length / chunks);
    for (let j = 0; j < chunks; j++) {
        result.push([]);
        for (let i = 0; i < length; i++) {
            let v = items[i + j * length];
            if (v == undefined) {
                continue;
            }
            result[j].push(v);
        }
    }
    return result;
};

const doubleClick = (callback) => {
    let states = ['pointerdown', 'pointerup', 'pointerdown', 'pointerup'];
    let click, which, state;
    let reset = () => {
        click = false;
        which = -1;
        state = 0;
    };
    reset();
    return (e) => {
        if (state === 0) {
            which = e.which;
        }
        if (e.type === states[state] && which === e.which) {
            state = state < 3 ? state + 1 : 0;
        }
        else {
            reset();
        }
        if (states[state] === 'pointerup') {
            if (!click) {
                click = true;
                setTimeout(reset, 300);
            }
            else {
                reset();
                callback(e);
            }
        }
    };
};

const getCenter = (mesh) => {
    const center = new THREE.Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center);
    return center;
};

const getPoints = (mesh) => {
    const points = [];
    const vector = new THREE.Vector3();
    const position = mesh.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
        vector.fromBufferAttribute(position, i);
        mesh.localToWorld(vector);
        points.push(new THREE.Vector3().copy(vector));
    }
    return points;
};

const getType = (value) => {
    const str = Object.prototype.toString.call(value);
    return str.slice(8, -1).toLowerCase();
};

const setProperty = (object, path, value) => {
    if (path.length === 1) {
        object[path[0]] = value;
    }
    else if (path.length === 0) {
        throw error;
    }
    else {
        if (object[path[0]]) {
            return setProperty(object[path[0]], path.slice(1), value);
        }
        else {
            object[path[0]] = {};
            return setProperty(object[path[0]], path.slice(1), value);
        }
    }
};

const jsonParse = (value) => {
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};

const objectEquals = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const hexColor = (color) => {
    return '#' + color.toString(16).padStart(6, '0');
};

const intColor = (color) => {
    if (getType(color) === 'string') {
        return parseInt(color.replace('#', '0x'), 16);
    }
    else if (getType(color) === 'array') {
        return ((color[0] & 0x0ff) << 16) | ((color[1] & 0x0ff) << 8) | (color[2] & 0x0ff);
    }
    else if (getType(color) === 'object') {
        return ((color.r & 0x0ff) << 16) | ((color.g & 0x0ff) << 8) | (color.b & 0x0ff);
    }
    return parseInt(color);
};

const rgbColor = (color) => {
    return {
        r: (color & 0xff0000) >> 16,
        g: (color & 0x00ff00) >> 8,
        b: (color & 0x0000ff)
    };
};

const shadeColor = (color, percent) => {
    const rgb = rgbColor(color);
    rgb.r = parseInt(clamp(rgb.r * percent, 0, 255));
    rgb.g = parseInt(clamp(rgb.g * percent, 0, 255));
    rgb.b = parseInt(clamp(rgb.b * percent, 0, 255));
    return intColor(rgb);
};

const colorMatch = (c1, c2, delta) => {
    const r = Math.abs(c1.r - c2.r);
    const g = Math.abs(c1.g - c2.g);
    const b = Math.abs(c1.b - c2.b);
    return (r + g + b) <= delta;
};

const cloneObject = (obj) => {
    return jsonParse(JSON.stringify(obj));
};

const cloneCanvas = (canvas, options) => {
    let { canvas: cloneCanvas, ctx: cloneCtx } = getCanvas(canvas.width, canvas.height);
    cloneCtx.filter = options.grayscale ? 'grayscale(1)' : 'none';
    cloneCtx.drawImage(canvas, 0, 0);
    if (getType(options.transparent) === 'number') {
        cloneCanvas = transparentCanvas(canvas, options.transparent);
    }
    return cloneCanvas;
};

const getCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d')
    };
};

const canvasImage = (canvas) => {
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.substr(dataUrl.indexOf(',') + 1);
};

const transparentCanvas = (canvas, color) => {
    const ctx = canvas.getContext('2d');
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = img.data;
    const replaceColor = rgbColor(color);
    for (let i = 0, n = data.length; i < n; i += 4) {
        const currentColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
        if (colorMatch(currentColor, replaceColor, 3)) {
            data[i + 3] = 0;
        }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
};

const truncatedMean = (values, percent) => {
    const outliers = Math.ceil(values.length * percent);
    const sorted = values.slice().sort((a, b) => a - b).slice(outliers, -outliers);
    const results = sorted.length ? sorted : values.slice();
    return results.reduce((a, b) => a + b) / results.length;
}

const randomGenerator = (seed) => {
    return seed === void (0) ? Math.random : new Math.seedrandom(seed);
};

const randomFloat = (min, max, seed) => {
    const rng = randomGenerator(seed);
    return rng() * (max - min) + min;
};

const randomInt = (min, max, seed) => {
    const rng = randomGenerator(seed);
    return Math.floor(rng() * (1 + max - min) + min);
};

const shuffle = (array, seed) => {
    const rng = randomGenerator(seed);
    return array.sort(() => rng() - 0.5);
};

const rad = (deg) => {
    return deg * Math.PI / 180;
};

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const log = (...args) => {
    let level = 'log';
    let entries = Array.from(args);
    if (entries.length > 0 && getType(entries[0]) === 'string') {
        if (['debug', 'info', 'warn', 'error'].includes(entries[0])) {
            level = entries.shift();
        }
    }
    switch (level) {
        case 'debug':
            console.debug.apply(console, entries);
            break;
        case 'info':
            console.info.apply(console, entries);
            break;
        case 'warn':
            console.warn.apply(console, entries);
            break;
        case 'error':
            console.error.apply(console, entries);
            break;
        default:
            console.log.apply(console, entries);
    }
};

Array.prototype.chunk = function (size) {
    let result = [];
    while (this.length) {
        result.push(this.splice(0, size));
    }
    return result;
};

Date.prototype.yyyymmddhhmmss = function () {
    const yyyy = this.getFullYear();
    const mm = this.getMonth() < 9 ? '0' + (this.getMonth() + 1) : (this.getMonth() + 1);
    const dd = this.getDate() < 10 ? '0' + this.getDate() : this.getDate();
    const hh = this.getHours() < 10 ? '0' + this.getHours() : this.getHours();
    const min = this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes();
    const sec = this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds();
    return yyyy + '-' + mm + '-' + dd + '-' + hh + '-' + min + '-' + sec;
};
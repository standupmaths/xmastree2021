class Loader {
    constructor() {
        this.cache = {};
        this.loader = {
            font: new THREE.FontLoader(),
            texture: new THREE.TextureLoader()
        };
    }

    async load(type, path) {
        if (path in this.cache) {
            return this.cache[path];
        }

        return new Promise(function (resolve) {
            this.loader[type].load(path, (data) => {
                this.cache[path] = data;
                resolve(data);
            });
        }.bind(this));
    }
}
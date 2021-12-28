class Led {
    constructor(stage, position) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.position = position;

        this.scale = 0.6;

        this.material = new THREE.MeshPhongMaterial({
            color: 0x666666,
            shininess: 0.9
        });

        this.loaded = new Promise(async function (resolve) {
            await this.addLed();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addLed() {
        const sphereGeometry = new THREE.SphereGeometry(this.scale / 100, 32, 32);
        this.sphere = new THREE.Mesh(sphereGeometry, this.material.clone());

        // add to scene
        this.scene.add(this.sphere);
        setLayer(this.sphere, this.stage.layer.lightsOff);
    }

    async setColor(color) {
        if (!color) {
            this.turnOff();
            return;
        }
        this.turnOn(color);
    }

    async turnOn(color) {
        this.sphere.material.color.setHex(color);
        this.sphere.material.emissive.setHex(color);

        // move to boom layer
        setLayer(this.sphere, this.stage.layer.lightsOn);
    }

    async turnOff() {
        this.sphere.material.color.setHex(this.material.color.getHex());
        this.sphere.material.emissive.setHex(this.material.emissive.getHex());

        // move to shader layer
        setLayer(this.sphere, this.stage.layer.lightsOff);
    }

    async update() {
        if (!this.sphere) {
            return;
        }

        // update position
        this.sphere.position.copy(this.position);
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // turn led off
        await this.turnOff();

        // update led
        await this.update();
        await sleep(100);
    }
}
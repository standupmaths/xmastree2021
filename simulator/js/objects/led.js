class Led {
    constructor(stage, position) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.position = position;

        this.ledScale = 0.6;
        this.glowScale = 1.6;

        this.lightDistance = 0.5;
        this.lightIntensity = 3;

        this.materialLed = new THREE.MeshStandardMaterial({
            color: 0xc9e8ff,
            metalness: 0.4
        });

        this.materialGlow = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            depthWrite: false,
            transparent: true,
            metalness: 0.8,
            opacity: 0.0
        });

        this.loaded = new Promise(async function (resolve) {
            await this.addLed();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addLed() {
        this.group = new THREE.Group();
        this.group.position.copy(this.position);

        // add led
        const ledGeometry = new THREE.SphereGeometry(this.ledScale / 100, 32, 32);
        this.led = new THREE.Mesh(ledGeometry, this.materialLed.clone());
        this.group.add(this.led)

        // add led glow
        const glowGeometry = new THREE.SphereGeometry(this.glowScale / 100, 32, 32);
        this.glow = new THREE.Mesh(glowGeometry, this.materialGlow.clone());
        this.group.add(this.glow)

        // add led light
        this.light = new THREE.PointLight(0x000000, 0.0, this.lightDistance);
        this.light.castShadow = false;
        // this.group.add(this.light) // TODO

        // add to scene
        this.scene.add(this.group);
        setLayer(this.group, this.stage.layer.light);
    }

    async setColor(color) {
        if (color) {
            this.turnOn(color);
        } else {
            this.turnOff();
        }
    }

    async turnOn(color) {
        // led color
        this.led.material.color.setHex(color);

        // glow visibility and color
        this.glow.material.opacity = 0.4;
        this.glow.material.color.setHex(color);

        // light intensity and color
        this.light.intensity = this.lightIntensity;
        this.light.color.setHex(color);
    }

    async turnOff() {
        // led color
        this.led.material.color.setHex(this.materialLed.color.getHex());

        // glow visibility and color
        this.glow.material.opacity = 0.0;
        this.glow.material.color.setHex(this.materialGlow.color.getHex());

        // light intensity and color
        this.light.intensity = 0.0;
        this.light.color.setHex(this.materialGlow.color.getHex());
    }

    async update() {
        if (!this.group) {
            return;
        }

        // update position
        this.group.position.copy(this.position);
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
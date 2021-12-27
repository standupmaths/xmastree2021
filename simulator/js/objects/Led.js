class Led {
    constructor(stage, position) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.position = position;

        this.ledScale = 0.6;
        this.glowScale = 1.0;
        this.lightDistance = 0.2;

        this.materialLed = new THREE.MeshPhongMaterial({
            color: 0x666666,
            shininess: 0.8
        });

        this.materialGlow = new THREE.MeshPhongMaterial({
            color: 0x666666,
            emissive: 0x666666,
            depthWrite: false,
            transparent: true,
            shininess: 0.8,
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
        this.light = new THREE.PointLight(0, 0.0, this.lightDistance);
        this.light.visible = false;
        this.group.add(this.light)

        // add to scene
        this.scene.add(this.group);
        setLayer(this.group, this.stage.layer.light);
    }

    async setColor(color, intensity) {
        if (!color) {
            this.turnOff();
            return;
        }
        this.turnOn(color, intensity);
    }

    async turnOn(color, intensity) {
        // led color
        this.led.material.color.setHex(color);

        // glow visibility and color
        this.glow.material.opacity = 0.4;
        this.glow.material.color.setHex(color);
        this.glow.material.emissive.setHex(color);

        // light intensity and color
        this.light.visible = !!intensity;
        this.light.intensity = intensity;
        this.light.color.setHex(color);
    }

    async turnOff() {
        // led color
        this.led.material.color.setHex(this.materialLed.color.getHex());

        // glow visibility and color
        this.glow.material.opacity = 0.0;
        this.glow.material.color.setHex(this.materialGlow.color.getHex());
        this.glow.material.emissive.setHex(this.materialGlow.emissive.getHex());

        // light intensity and color
        this.light.visible = false;
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
class Led {
    constructor(stage, position) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.position = position;

        this.ledScale = 0.03;
        this.glowScale = 0.04;
        this.lightIntensity = 3;

        this.loaded = new Promise(async function (resolve) {
            this.materialGlow = new THREE.SpriteMaterial({
                map: await this.loader.load('texture', 'img/led/glow.png'),
                color: 0xffffff,
                alphaTest: 0.4
            });

            this.materialOn = new THREE.SpriteMaterial({
                map: await this.loader.load('texture', 'img/led/on.png'),
                color: 0xffffff,
                alphaTest: 0.4
            });

            this.materialOff = new THREE.SpriteMaterial({
                map: await this.loader.load('texture', 'img/led/off.png'),
                color: 0xffffff,
                alphaTest: 0.4
            });

            await this.addLed();
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addLed() {
        this.group = new THREE.Group();
        this.group.position.copy(this.position);

        // add led
        this.led = new THREE.Sprite(this.materialOff.clone());
        this.led.scale.set(this.ledScale, this.ledScale, this.ledScale);
        this.group.add(this.led)

        // add led glow
        this.glow = new THREE.Sprite(this.materialGlow.clone());
        this.glow.scale.set(this.glowScale, this.glowScale, this.glowScale);
        this.group.add(this.glow)

        // add led light
        this.light = new THREE.PointLight(0x000000, 0.0, 3);
        this.light.castShadow = false;
        // this.group.add(this.light)

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
        //this.led.material = this.materialOn.clone();
        this.led.material.color.setHex(color);

        // glow visibility and color
        // this.glow.material.opacity = 1.0;
        // this.glow.material.alphaTest = 0.1;
        this.glow.material.color.setHex(color);

        // light intensity and color
        this.light.intensity = this.lightIntensity;
        this.light.color.setHex(color);
    }

    async turnOff() {
        // led color
        //this.led.material = this.materialOff.clone();
        this.led.material.color.setHex(this.materialOff.color.getHex());

        // glow visibility and color
        // this.glow.material.opacity = 0.0;
        // this.glow.material.alphaTest = 1.0;
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
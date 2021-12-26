class Light {
    constructor(stage, index) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.index = index;

        this.leds = [];

        this.loaded = new Promise(async function (resolve) {
            await this.update();

            resolve(this);
        }.bind(this));
    }

    async addLed(position) {
        const led = new Led(this.stage, position);
        this.leds.push(led);
        return led.loaded;
    }

    async addLeds(positions) {
        log('debug', `add ${positions.length} positions`);

        for (const position of positions) {

            // swap z and y coordinates
            const [x, z, y] = position;

            // adjust offset
            const [x_offset, y_offset, z_offset] = [0.0, 0.0, 0.0];

            // add led to stage
            await this.addLed(new THREE.Vector3(x + x_offset, y + y_offset, z + z_offset));
        }

        // update center position
        await this.update();
    }

    async setFrame(colors) {
        colors.forEach((color, i) => {
            const led = this.leds[i];
            led.setColor(intColor(color));
        });
    }

    async animateFrames(frames) {
        log('debug', `animate ${frames.length} frames`);

        // TODO
        const speed = 50;

        for (const frame of frames) {
            const colors = frame.chunk(3);
            if (colors.length != this.leds.length) {
                log('warn', `colors length ${frames.length} != leds length ${this.leds.length}`)
                break;
            }

            await this.setFrame(colors);
            await sleep(speed);
        }

        this.leds.forEach((led) => led.off);
    }

    async update() {
        if (!this.leds.length) {
            return;
        }

        // calculate center of all leds
        const center = new THREE.Vector3(
            truncatedMean(this.leds.map((led) => led.position.x), 0.05),
            -0.3,
            truncatedMean(this.leds.map((led) => led.position.z), 0.05)
        );

        // re-center each led
        this.leds.forEach((led) => {
            led.position.sub(center);
            led.update();
        });
    }

    async export(zip) {
        // TODO
    }

    async reset() {
        // remove leds
        this.leds.forEach((led) => {
            this.scene.remove(led.group);
        });
        this.leds = [];

        // update light
        await this.update();
        await sleep(100);
    }
}
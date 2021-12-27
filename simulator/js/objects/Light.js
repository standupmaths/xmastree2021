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
            const [x_offset, y_offset, z_offset] = [0.0, 0.3, 0.0];

            // add led to stage
            await this.addLed(new THREE.Vector3(x + x_offset, y + y_offset, z + z_offset));
        }

        // update center position
        await this.update();
    }

    async setFrame(colors) {
        const indices = [...Array(colors.length).keys()];

        const prevColors = this.leds.map((led) => led.glow.material.color.getHex());
        const nextColors = colors.map((color) => intColor(color));

        // TODO
        if (!this.intensities) {
            this.intensities = [...Array(colors.length)];
        }
        let intensities = indices.map((i) => prevColors[i] != nextColors[i] || this.intensities[i] ? 10.0 : 0.0);
        let count = 0;
        indices.slice().reverse().forEach((i) => {
            if (intensities[i] && count < 100) {
                count++;
            }
            else {
                intensities[i] = 0.0;
            }
            intensities[i] = 0.0;
        });

        // set color and intensity
        for (let i = 0; i < colors.length; i++) {
            const led = this.leds[i];
            led.setColor(nextColors[i], intensities[i]);
        }

        this.intensities = intensities;
    }

    async animateFrames(frames) {
        log('debug', `animate ${frames.length} frames (${this.config.fps} FPS)`);

        do {
            for (const frame of frames) {
                const colors = frame.slice().chunk(3);
                if (colors.length != this.leds.length) {
                    log('warn', `colors length ${colors.length} != leds length ${this.leds.length}`)
                    return;
                }

                await this.setFrame(colors);
                await sleep(1000 / this.config.fps);
            }
        } while (this.config.loop);

        // reset leds
        this.leds.forEach((led) => {
            led.reset();
        });
    }

    async update() {
        if (!this.leds.length) {
            return;
        }

        // calculate center of all leds
        const center = new THREE.Vector3(
            truncatedMean(this.leds.map((led) => led.position.x), 0.05),
            0,
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
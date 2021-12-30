class Light {
    constructor(stage, index) {
        this.root = stage.root;
        this.config = stage.config;
        this.loader = stage.loader;
        this.scene = stage.scene;
        this.stage = stage;
        this.index = index;

        this.leds = [];
        this.paused = false;
        this.stopped = false;

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
        for (let i = 0; i < colors.length; i++) {
            const led = this.leds[i];

            // set led color
            led.setColor(intColor(colors[i]));
        }
    }

    async animateFrames(frames) {
        log('debug', `animate ${frames.length} frames (${this.config.fps} FPS)`);

        this.paused = false;
        this.stopped = frames.length == 0;

        do {
            for (const frame of frames) {
                const colors = frame.slice().chunk(3);
                if (colors.length != this.leds.length) {
                    log('warn', `colors length ${colors.length} != leds length ${this.leds.length}`)
                    return;
                }

                // set colors
                await this.setFrame(colors);

                // aim framerate
                await sleep(1000 / this.config.fps);

                // pause execution
                while (!this.stopped && this.paused) {
                    await sleep(100);
                }

                // abort execution
                if (this.stopped) {
                    break;
                }
            }
        } while (!this.stopped && this.config.loop);

        // reset leds
        this.leds.forEach((led) => {
            led.reset();
        });
        this.paused = false;
        this.stopped = false;
    }

    async update() {
        if (!this.leds.length) {
            return;
        }

        // calculate center of cone
        const center = new THREE.Vector3(
            truncatedMean(this.leds.map((led) => led.position.x), 0.05),
            0,
            truncatedMean(this.leds.map((led) => led.position.z), 0.05)
        );

        // move each led towards center
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
            this.scene.remove(led.sphere);
        });
        this.leds = [];

        // update light
        await this.update();
        await sleep(100);
    }
}
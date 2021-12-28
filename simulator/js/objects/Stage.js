class Stage {
    constructor(view) {
        this.root = view.root;
        this.config = view.config;
        this.view = view;

        this.name = document.title;
        this.layer = {
            ground: 1,
            trees: 2,
            lightsOn: 3,
            lightsOff: 4
        };
        this.scene = new THREE.Scene();
        this.loader = new LoaderUtils();

        this.fov = 60;
        this.glow = this.config.light.glow;
        this.fps = [Math.max(30, this.config.fps)];

        this.clock = new THREE.Clock();
        this.delta = 0;

        this.status('Loading', 0);
        this.loaded = new Promise(async function (resolve) {

            // load font
            this.font = await this.loader.load('font', 'font/opensans.json');
            this.status('Loading', 25);

            // stage directional light
            this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
            this.directionalLight.position.set(100, 100, 100);

            // stage ambient light
            this.ambientLight = new THREE.AmbientLight(0xffffff, this.config.light.ambient / 10);

            // stage camera
            this.camera = new THREE.PerspectiveCamera(this.fov, this.root.clientWidth / this.root.clientHeight, 0.1, 1000);
            this.camera.add(this.directionalLight);
            this.camera.add(this.ambientLight);
            this.scene.add(this.camera);

            // stage camera layers
            Object.values(this.layer).forEach((layer) => {
                this.camera.layers.enable(layer);
            });

            // renderer
            this.renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, preserveDrawingBuffer: true, antialias: true, alpha: true });
            this.renderer.toneMapping = THREE.ReinhardToneMapping;
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // render pass for bloom and shader
            this.renderPass = new THREE.RenderPass(this.scene, this.camera);

            // bloom pass for composer
            this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.root.clientWidth, this.root.clientHeight));
            this.bloomPass.strength = this.config.light.led;
            this.bloomPass.radius = 1;

            // bloom effect composer
            this.bloomComposer = new THREE.EffectComposer(this.renderer);
            this.bloomComposer.renderToScreen = false;
            this.bloomComposer.addPass(this.renderPass);
            this.bloomComposer.addPass(this.bloomPass);

            // shader pass for composer
            this.shaderPass = new THREE.ShaderPass(
                new THREE.ShaderMaterial({
                    uniforms: {
                        baseTexture: { value: null },
                        bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                    },
                    vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }`,
                    fragmentShader: `
                    uniform sampler2D baseTexture;
                    uniform sampler2D bloomTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);
                    }`
                }), 'baseTexture');
            this.shaderPass.needsSwap = true;

            // shader effect composer
            this.shaderComposer = new THREE.EffectComposer(this.renderer);
            this.shaderComposer.addPass(this.renderPass);
            this.shaderComposer.addPass(this.shaderPass);

            // orbiter controls
            this.controls = new THREE.MapControls(this.camera, this.renderer.domElement);
            this.controls.autoRotateSpeed = this.config.rotation;
            this.controls.autoRotate = !!this.config.rotation;
            this.controls.minDistance = 0.1;
            this.controls.maxDistance = 500;
            this.controls.enablePan = true;

            // user interface
            this.stats = new Stats();
            this.root.querySelector('#info').append(this.stats.dom);
            this.root.querySelector('#stage').append(this.renderer.domElement);
            this.renderer.setClearColor(this.config.material.background);
            document.body.style.backgroundColor = hexColor(this.config.material.background);

            // reset stage
            this.reset();

            // animations
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);

            // events
            this.update = this.update.bind(this);
            window.addEventListener('resize', this.update);

            resolve(this);
        }.bind(this));
    }

    status(message, percent) {
        const numeric = getType(percent) === 'number';

        // set status
        let status = this.name;
        if (message) {
            status = numeric ? `${message} (${percent}%)` : message;
        }
        document.title = status;

        // reset status
        if (numeric && percent >= 100) {
            sleep(100).then(() => { this.status() });
        }
    }

    async animate() {
        requestAnimationFrame(this.animate);

        // update clock delta
        this.delta += this.clock.getDelta();

        // desired fps and delta
        const fps = Math.max(30, this.config.fps);
        const delta = 1 / fps;

        // check clock delta
        if (this.delta >= delta) {
            await this.render();

            // append current fps
            this.fps.push(1 / this.delta);
            this.fps = this.fps.slice(-30);

            // update clock delta
            this.delta = this.delta % delta;

            // adjust rotation speed
            const rotation = this.config.rotation * (30 / truncatedMean(this.fps, 0.0))
            this.controls.autoRotate = !!this.config.rotation;
            this.controls.autoRotateSpeed = rotation;
        }
    }

    async render() {

        // start stats
        this.stats.begin();

        // update controls
        this.controls.update();

        // darken materials before composing
        const materials = {};
        this.scene.traverse((o) => {
            if (onLayer(o, this.layer.lightsOn) === false) {
                const darkMaterial = o.material.clone();
                darkMaterial.color.setHex(0x000000);
                materials[o.uuid] = o.material;
                o.material = darkMaterial;
            }
        });
        this.renderer.setClearColor(0x000000);

        // render bloom
        if (this.glow) {
            this.bloomComposer.render();
        }

        // restore original materials
        this.scene.traverse((o) => {
            if (materials[o.uuid]) {
                o.material = materials[o.uuid];
                delete materials[o.uuid];
            }
        });
        this.renderer.setClearColor(this.config.material.background);

        // render shader
        this.shaderComposer.render();

        // end stats
        this.stats.end();
    }

    async update() {

        // update light intensities
        this.glow = this.config.light.glow;
        this.bloomPass.strength = this.config.light.led;
        this.ambientLight.intensity = this.config.light.ambient / 10;

        // update renderer  size
        this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
        this.bloomComposer.setSize(this.root.clientWidth, this.root.clientHeight);
        this.shaderComposer.setSize(this.root.clientWidth, this.root.clientHeight);

        // update camera projection
        this.camera.aspect = this.root.clientWidth / this.root.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    async export(zip) {
        const stage = zip.folder('stage');

        // navigator
        const navigator = {};
        for (let key in window.navigator) {
            if (['string', 'array', 'number'].includes(getType(window.navigator[key]))) {
                navigator[key] = window.navigator[key];
            }
        }

        // client
        const client = {
            stage: {
                clientWidth: this.root.clientWidth,
                clientHeight: this.root.clientHeight
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            intl: {
                dateTimeFormat: Intl.DateTimeFormat().resolvedOptions(),
                numberFormat: Intl.NumberFormat().resolvedOptions()
            },
            location: window.location,
            navigator: navigator
        };

        // export config
        stage.file('client.json', JSON.stringify(client, null, 4));

        // export image
        const image = canvasImage(this.renderer.domElement);
        stage.file('image.png', image, { base64: true });
    }

    async reset() {

        // reset camera position
        this.camera.setRotationFromEuler(new THREE.Euler(0.0, 0.0, 0.0));
        this.camera.position.set(6.0, 3.0, 0.0);
        this.controls.target.set(0.0, 1.0, 0.0);

        // update camera
        await this.update();
        await this.render();
        await sleep(100);
    }
}
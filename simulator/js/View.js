class View {
    constructor(root, config, presets) {
        this.root = root;
        this.config = config;
        this.presets = presets;
        this.loader = new LoaderUtils();

        // init stage
        this.stage = new Stage(this.root, this.config, this.loader);
        this.stage.loaded.then(() => {

            // init room
            this.room = new Room(this.stage, 0);
            this.room.loaded.then(() => {

                // init controls
                this.controls(this.root.querySelector('#controls'));

                // init events
                window.addEventListener('hashchange', async (event) => {
                    this.update(event);
                });
            });
        });
    }

    async controls(root) {

        // gui root
        this.gui = new lil.GUI({ autoPlace: false, width: 320 });
        root.append(this.gui.domElement);

        // config folder
        const configFolder = this.gui.addFolder('Config').open();
        configFolder.add(this.config, 'preset', this.presets).onChange((preset) => {
            this.gui.load.preset = preset;
            window.location.reload();
        });
        configFolder.add(this.config, 'coordinates', this.config.coordinates_).onChange(async (v) => {
            if (!v) {
                return;
            }

            // load local file
            if (v === 'local') {
                this.room.input.coords.click();
                this.config.coordinates = '';
                return
            }

            // load remote file
            const positions = await this.room.input.loadCoords(v);
            this.room.lights.forEach((light) => {
                light.reset().then(() => {
                    light.addLeds(positions);
                });
            });
        }).listen();
        configFolder.add(this.config, 'animations', this.config.animations_).onChange(async (v) => {
            if (!v) {
                return;
            }

            // load local file
            if (v === 'local') {
                this.room.input.frames.click();
                this.config.animation = '';
                return
            }

            // load remote file
            const frames = await this.room.input.loadFrames(v);
            this.room.lights.forEach((light) => {
                light.animateFrames(frames);
            });
        }).listen();
        configFolder.add(this.config, 'fps', 1, 120, 1).onChange((v) => {
            this.stage.update();
        });
        configFolder.add(this.config, 'loop');

        // tree folder
        const treeFolder = this.gui.addFolder('Tree').close();
        const treesFolders = [
            treeFolder.add(this.config.tree, 'visible'),
            treeFolder.add(this.config.tree, 'scale', 10, 100, 1),
            treeFolder.add(this.config.tree, 'levels', 0, 9, 1),
            treeFolder.add(this.config.tree, 'twigScale', 0.0, 0.2, 0.05)
        ];

        // tree branching folder
        const branchingFolder = treeFolder.addFolder('Branching').close();
        const branchingFolders = [
            branchingFolder.add(this.config.tree.branching, 'initialBranchLength', 0.1, 1.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'lengthFalloffFactor', 0.1, 1.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'lengthFalloffPower', 0.1, 1.5, 0.05),
            branchingFolder.add(this.config.tree.branching, 'clumpMax', 0.0, 1.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'clumpMin', 0.0, 1.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'branchFactor', 2.0, 5.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'dropAmount', -1.0, 1.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'growAmount', -1.0, 1.0, 0.05),
            branchingFolder.add(this.config.tree.branching, 'sweepAmount', -1.0, 1.0, 0.05)
        ];

        // tree trunk folder
        const trunkFolder = treeFolder.addFolder('Trunk').close();
        const trunkFolders = [
            trunkFolder.add(this.config.tree.trunk, 'maxRadius', 0.05, 0.2, 0.05),
            trunkFolder.add(this.config.tree.trunk, 'climbRate', 0.05, 2.0, 0.05),
            trunkFolder.add(this.config.tree.trunk, 'trunkKink', 0.0, 0.5, 0.05),
            trunkFolder.add(this.config.tree.trunk, 'treeSteps', 0.0, 20.0, 0.05),
            trunkFolder.add(this.config.tree.trunk, 'taperRate', 0.7, 1.0, 0.05),
            trunkFolder.add(this.config.tree.trunk, 'radiusFalloffRate', 0.5, 0.9, 0.05),
            trunkFolder.add(this.config.tree.trunk, 'twistRate', 0.0, 20.0, 1),
            trunkFolder.add(this.config.tree.trunk, 'trunkLength', 0.1, 2.0, 0.05)
        ];

        // trees folders
        [treesFolders, branchingFolders, trunkFolders].forEach((folders) => {
            folders.forEach((folder) => {
                folder.onChange(async () => {
                    await this.room.removeTrees();
                    await this.room.addTree();
                    await this.room.update();
                });
            });
        });

        // light folder
        const lightFolder = this.gui.addFolder('Light').close();
        lightFolder.add(this.config.light, 'directional', 0.0, 3.0, 0.05).onChange((v) => {
            this.stage.update();
        });
        lightFolder.add(this.config.light, 'ambient', 0.0, 3.0, 0.05).onChange((v) => {
            this.stage.update();
        });
        lightFolder.add(this.config.light, 'led', 0.0, 3.0, 0.05).onChange((v) => {
            this.stage.update();
        });

        // material folder
        const materialFolder = this.gui.addFolder('Material').close();
        materialFolder.addColor(this.config.material, 'tree').onChange((v) => {
            this.room.treeMaterial.color.setHex(v);
        });
        materialFolder.addColor(this.config.material, 'leaf').onChange((v) => {
            this.room.leafMaterial.color.setHex(v);
        });
        materialFolder.addColor(this.config.material, 'ground').onChange((v) => {
            this.room.groundMaterial.color.setHex(v);
        });
        materialFolder.addColor(this.config.material, 'background').onChange((v) => {
            this.stage.renderer.setClearColor(v);
            document.body.style.backgroundColor = hexColor(v);
        });

        // stage actions
        this.gui.add(this.config, 'rotation', 0.0, 20.0, 0.05).onChange((v) => {
            this.stage.update();
        });
        this.gui.add(this, 'export');
        this.gui.add(this, 'reset');
    }

    async update(event) {

        // get config from hash
        const hash = getHash();

        // set config from hash
        const changed = await setConfig(this.config, hash);

        // check event type
        const loadEvent = event.type === 'loaded';
        const hashEvent = event.type === 'hashchange';
        const changeEvent = loadEvent || (hashEvent && changed);
        if (!changeEvent) {
            return;
        }

        // update room
        this.room.update();
    }

    async export(date) {
        const zip = new JSZip();
        const zipName = `${this.stage.name}-${date || new Date().yyyymmddhhmmss()}.zip`;

        // export status
        this.stage.status('Exporting', 0);

        // add folders
        await this.stage.export(zip);
        await this.room.export(zip);

        // add config file
        zip.file('config.json', JSON.stringify(this.config, null, 4));

        // compression status
        this.stage.status('Compressing', 0);

        // generate zip file
        await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, (zipMeta) => {
            this.stage.status('Compressing', Math.round(zipMeta.percent));
        }).then((zipData) => {
            // compression finished
            this.stage.status();

            // download zip file
            saveAs(zipData, zipName);

            // update hash for next array value
            const next = getHash('next') | 0;
            setHash('next', next + 1);
        });
    }

    async reset() {
        await this.stage.reset();
        await this.room.reset();
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // make Math.random() globally predictable
    Math.seedrandom(document.title);

    // load preset and config
    const preset = await getPreset(presets);
    const config = await getConfig(preset);

    // init view
    new View(document.querySelector('#main'), config, presets);
});

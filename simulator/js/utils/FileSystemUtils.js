class FileSystemUtils {
    constructor(db) {
        this.db = db;
        this.version = 21;
        this.store = 'FILE_DATA';
    }

    async write(filePath, fileContent) {
        return this.connect(filePath, fileContent);
    }

    async read(filePath) {
        return this.connect(filePath);
    }

    async list() {
        return this.connect();
    }

    async connect(filePath, fileContent) {
        const file = {
            path: filePath,
            timestamp: (new Date()).toISOString(),
            mode: 33206,
            contents: fileContent ? Object.assign({}, ...[...fileContent].map((c, i) => ({ [i]: c.charCodeAt(0) }))) : null
        };

        // init object store
        const con = indexedDB.open(this.db, this.version);
        con.onupgradeneeded = () => { con.result.createObjectStore(this.store); };

        return new Promise(function (resolve) {
            con.onsuccess = () => {
                const db = con.result;
                const tx = db.transaction(this.store, 'readwrite');
                const store = tx.objectStore(this.store);

                if (file.contents) {
                    // write operation
                    const { path, ...contents } = file;
                    store.put(contents, path);
                    resolve(true);
                }
                else if (file.path) {
                    // read operation
                    const read = store.get(file.path);
                    read.onsuccess = () => {
                        const result = read.result ? read.result.contents : {};
                        resolve(Object.values(result).map((c) => String.fromCharCode(c)).join(''));
                    };
                }
                else {
                    // list operation
                    const keys = store.getAllKeys();
                    keys.onsuccess = () => {
                        resolve(keys.result);
                    };
                }

                // close connection
                tx.oncomplete = () => { db.close(); };
            }
        }.bind(this));
    }
}
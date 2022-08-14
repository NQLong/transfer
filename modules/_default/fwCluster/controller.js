module.exports = (app, appConfig) => {
    app.fs.createFolder(app.bundlePath);

    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            1006: { title: 'Cluster', link: '/user/cluster', icon: 'fa-braille', backgroundColor: '#4db6ac' }
        }
    };
    app.permission.add({ name: 'cluster:manage', menu }, { name: 'cluster:write' }, { name: 'cluster:delete' });

    app.get('/user/cluster', app.permission.check('cluster:manage'), app.templates.admin);

    // Cluster APIs ---------------------------------------------------------------------------------------------------------------------------------
    const socketIoEmit = (error) => !error && setTimeout(() => app.io.to('cluster').emit('services-changed'), 1000);

    app.get('/api/cluster/all', app.permission.check('cluster:manage'), async (req, res) => {
        const services = {},
            serviceNames = Object.keys(appConfig.services);
        for (let i = 0; i < serviceNames.length; i++) {
            const serviceName = serviceNames[i],
                service = await app.service.clusterGetAll(serviceName);
            if (service) services[serviceName] = service;
        }

        const images = [];
        app.fs.readdirSync(app.bundlePath).forEach(filename => {
            const state = app.fs.statSync(app.bundlePath + '/' + filename);
            state.isFile() && images.push({ filename, createdDate: state.mtime });
        });
        services.main = { clusters: app.worker.items, images };

        res.send({ services });
    });

    app.post('/api/cluster', app.permission.check('cluster:write'), async (req, res) => {
        const { serviceName } = req.body;
        serviceName == 'main' ? app.worker.create() : await app.service.clusterCreate(serviceName);
        socketIoEmit();
        res.send({});
    });

    app.put('/api/cluster', app.permission.check('cluster:write'), async (req, res) => {
        const { serviceName, id } = req.body;
        serviceName == 'main' ? app.worker.reset(id) : await app.service.clusterReset(serviceName, id);
        socketIoEmit();
        res.send({});
    });

    app.delete('/api/cluster', app.permission.check('cluster:delete'), async (req, res) => {
        const { serviceName, id } = req.body;
        if (serviceName == 'main') {
            if (app.worker.items.length > 1) {
                app.worker.shutdown(id);
                res.send({});
            } else {
                res.send({ error: 'Invalid action!' });
            }
        } else {
            await app.service.clusterDelete(serviceName, id);
            res.send({});
        }
        socketIoEmit();
    });

    // System Image APIs ----------------------------------------------------------------------------------------------------------------------------
    app.put('/api/cluster/image', app.permission.check('cluster:write'), async (req, res) => {
        const { serviceName, filename } = req.body;
        if (serviceName == 'main') {
            const imageFile = app.bundlePath + '/' + filename,
                extractPath = app.tempPath + '/' + app.path.parse(filename).name; // app.bundlePath + '/' + app.path.parse(filename).name;
            if (app.fs.existsSync(imageFile)) {
                const DecompressZip = require('decompress-zip'),
                    unzipper = new DecompressZip(imageFile);
                unzipper.on('error', error => console.error(error) || res.send({ error: 'Unzip has error!' }));
                unzipper.on('extract', () => {
                    let destPath = app.path.dirname(require.main.filename),
                        mainCodeFilename = require(destPath + '/package.json').main;
                    if (app.isDebug) {
                        destPath = app.bundlePath + '/dest';
                        app.fs.deleteFolder(destPath);
                        app.fs.createFolder(destPath);
                        app.fs.createFolder(destPath + '/public');
                    }

                    app.fs.renameSync(extractPath + '/' + mainCodeFilename, destPath + '/' + mainCodeFilename);
                    app.fs.renameSync(extractPath + '/package.json', destPath + '/package.json');
                    app.fs.readdirSync(extractPath + '/public', { withFileTypes: true }).forEach(file => {
                        if (file.isFile() && app.path.extname(file.name) == '.template') {
                            app.fs.renameSync(extractPath + '/public/' + file.name, destPath + '/public/' + file.name);
                        }
                    });

                    app.fs.deleteFolder(destPath + '/public/css');
                    app.fs.deleteFolder(destPath + '/public/fonts');
                    app.fs.deleteFolder(destPath + '/public/home');
                    app.fs.deleteFolder(destPath + '/public/js');
                    app.fs.deleteFolder(destPath + '/config');
                    app.fs.deleteFolder(destPath + '/modules');
                    app.fs.deleteFolder(destPath + '/services');

                    app.fs.renameSync(extractPath + '/public/css', destPath + '/public/css');
                    app.fs.renameSync(extractPath + '/public/fonts', destPath + '/public/fonts');
                    app.fs.renameSync(extractPath + '/public/home', destPath + '/public/home');
                    app.fs.renameSync(extractPath + '/public/js', destPath + '/public/js');
                    app.fs.renameSync(extractPath + '/config', destPath + '/config');
                    app.fs.renameSync(extractPath + '/modules', destPath + '/modules');
                    app.fs.existsSync(extractPath + '/services') && app.fs.renameSync(extractPath + '/services', destPath + '/services');

                    app.fs.deleteFolder(extractPath);
                    const imageInfoPath = app.path.join(destPath, 'imageInfo.txt');
                    app.fs.writeFileSync(imageInfoPath, app.path.basename(imageFile));
                    res.send({});
                });

                unzipper.extract({
                    path: extractPath,
                    filter: file => app.path.extname(file.filename) !== '.jsx'
                });
            } else {
                res.send({ error: 'Image does not exist!' });
            }
        } else {
            const response = await app.service.clusterImageApply(serviceName, filename);
            res.send(response);
        }
    });

    app.delete('/api/cluster/image', app.permission.check('cluster:delete'), async (req, res) => {
        const { serviceName, filename } = req.body;
        if (serviceName == 'main') {
            if (filename) {
                const filepath = app.path.join(app.bundlePath, filename),
                    state = app.fs.statSync(filepath);
                if (filepath.startsWith(app.bundlePath + '/') && app.fs.existsSync(filepath) && state.isFile()) {
                    app.fs.deleteFile(filepath, () => socketIoEmit() || res.send({}));
                } else {
                    res.send({ error: 'Invalid filename!' });
                }
            } else {
                res.send({ error: 'Invalid filename!' });
            }
        } else {
            const response = await app.service.clusterImageDelete(serviceName, filename);
            socketIoEmit(response.error);
            res.send(response);
        }
    });

    // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    const clusterImageUpload = (fields, files, params, done) => {
        if (fields && fields.userData && fields.userData == 'ClusterImageUpload' && fields.service && fields.token && files && files.clusterImageFile) {
            const crypto = require('crypto'),
                srcPath = files.clusterImageFile[0].path,
                token = fields.token.length ? fields.token[0] : '',
                service = fields.service.length ? fields.service[0] : '',
                originalFilename = files.clusterImageFile[0].originalFilename;

            const configPackage = require(app.path.join(app.assetPath, 'config.json')),
                secretCodes = configPackage.secretCodes;
            let secretCode = null;
            for (let i = 0, n = (secretCodes ? secretCodes.length : 0); i < n; i++) {
                const calculateToken = crypto.createHash('md5').update(`${secretCodes[i]}|${originalFilename}`).digest('hex');
                if (token == calculateToken) {
                    secretCode = secretCodes[i];
                    break;
                }
            }

            try {
                if (!secretCode) throw 'Invalid token!';
                if (service == 'main' || service == '') {
                    app.fs.renameSync(srcPath, app.path.join(app.bundlePath, originalFilename));
                    socketIoEmit();
                    done({});
                } else {
                    const destPath = app.path.join(app.path.dirname(srcPath), originalFilename);
                    app.fs.renameSync(srcPath, destPath);

                    const FormData = require('form-data'),
                        form = new FormData();
                    form.append('clusterImageFile', app.fs.createReadStream(destPath));

                    const requestConfig = {
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                        headers: { ...form.getHeaders() }
                    };
                    const url = app.service.url(`/api/cluster/service/image/${service}`, appConfig.services[service]);
                    app.service.post(url, form, requestConfig).then(response => {
                        const error = response && response.error ? response.error : null;
                        socketIoEmit(error);
                        done({ error });
                        app.fs.deleteFile(destPath);
                    });
                }
            } catch (error) {
                done({ error });
            }
        }
    };
    app.uploadHooks.add('ClusterImageUpload', (req, fields, files, params, done) => clusterImageUpload(fields, files, params, done));


    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('addSocketListener:Cluster', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('cluster', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('cluster:manage')) {
                socket.join('cluster');
            }
        }),
    });
};
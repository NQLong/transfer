module.exports = (app, serviceConfig) => {
    // Clusters -------------------------------------------------------------------------------------------------------------------------------------
    app.get(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const images = [],
            imagePath = app.path.join(__dirname, '../asset/bundle');
        app.fs.existsSync(imagePath) && app.fs.readdirSync(imagePath).forEach(filename => {
            const state = app.fs.statSync(app.path.join(__dirname, '../asset/bundle', filename));
            state.isFile() && filename.endsWith('.zip') && images.push({ filename, createdDate: state.mtime });
        });
        res.send({ clusters: app.worker.items, images });
    });

    app.post(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        app.worker.create();
        res.send({});
    });

    app.put(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const { id } = req.body;
        id && app.worker.reset(id);
        res.send({});
    });

    app.delete(`/api/cluster/service/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const { id } = req.body;
        id && app.worker.items.length > 1 && app.worker.shutdown(id);
        res.send({});
    });


    // Images ---------------------------------------------------------------------------------------------------------------------------------------
    const multiparty = require('multiparty');
    app.post(`/api/cluster/service/image/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => new multiparty.Form({ uploadDir: app.uploadPath }).parse(req, (error, fields, files) => {
        console.log('User Upload:', files);
        if (error) {
            res.send({ error });
        } else if (files && files.clusterImageFile && files.clusterImageFile.length) {
            const srcPath = files.clusterImageFile[0].path,
                destPath = app.path.join(app.bundlePath, files.clusterImageFile[0].originalFilename);
            app.fs.rename(srcPath, destPath, error => res.send({ error }));
        } else {
            res.send({ error: 'File is not available!' });
        }
    }));

    app.put(`/api/cluster/service/image/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const { filename } = req.body;
        const imageFile = app.bundlePath + '/' + filename,
            extractPath = app.bundlePath + '/' + app.path.parse(filename).name;
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
                }

                app.fs.renameSync(extractPath + '/' + mainCodeFilename, destPath + '/' + mainCodeFilename);
                app.fs.renameSync(extractPath + '/package.json', destPath + '/package.json');
                app.fs.deleteFolder(destPath + '/config');
                app.fs.deleteFolder(destPath + '/models');
                app.fs.deleteFolder(destPath + '/services');

                app.fs.renameSync(extractPath + '/config', destPath + '/config');
                app.fs.renameSync(extractPath + '/models', destPath + '/models');
                app.fs.existsSync(extractPath + '/services') && app.fs.renameSync(extractPath + '/services', destPath + '/services');

                app.fs.deleteFolder(extractPath);
                const imageInfoPath = app.path.join(destPath, 'imageInfo.txt');
                app.fs.writeFileSync(imageInfoPath, app.path.basename(imageFile));
                res.send({});
            });

            unzipper.extract({ path: extractPath });
        } else {
            res.send({ error: 'Image does not exist!' });
        }
    });

    app.delete(`/api/cluster/service/image/${serviceConfig.name}`, app.permission.isLocalIp, (req, res) => {
        const { filename } = req.body;
        if (filename) {
            const filepath = app.path.join(app.bundlePath, filename),
                state = app.fs.statSync(filepath);
            if (filepath.startsWith(app.bundlePath + '/') && app.fs.existsSync(filepath) && state.isFile()) {
                app.fs.deleteFile(filepath);
                res.send({});
            } else {
                res.send({ error: 'Invalid filename!' });
            }
        } else {
            res.send({ error: 'Invalid filename!' });
        }
    });
};
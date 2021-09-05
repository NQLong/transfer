module.exports = app => {
    app.get('/api/logo/all', app.permission.check('component:read'), (req, res) =>
        app.model.homeLogo.getAll((error, items) => res.send({ error, items })));

    app.get('/api/logo/item/:logoId', app.permission.check('component:read'), (req, res) =>
        app.model.homeLogo.get({id: req.params.logoId}, (error, item) => res.send({ error, item })));

    app.post('/api/logo', app.permission.check('component:write'), (req, res) =>
        app.model.homeLogo.create({ title: req.body.title}, (error, item) => res.send({ error, item })));

    app.put('/api/logo', app.permission.check('component:write'), (req, res) =>
        app.model.homeLogo.update({id: req.body.id}, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/logo', app.permission.check('component:write'), (req, res) => app.model.homeLogo.delete({id: req.body.id}, error => res.send({ error })));

    //LogoItem---------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/logoItem', app.permission.check('component:write'), (req, res) =>{    
        app.model.homeLogoItem.getAll({logoId: req.body.id}, (err, logos)=>{
            if (err) {
                res.send({ err, logos}); 
            } else{
                uploadComponentImage(req, 'logo', app.model.homeLogoItem.get, 'new', req.session.logoImage, response => { 
                    app.model.homeLogoItem.create({logoId: req.body.id, priority: logos.length + 1, name: req.body.name, address: req.body.address, link: req.body.link, image: response.image }, (error, item) => {
                        res.send({ error, item });});
                });
            }
        });
    });

    app.get('/api/logoItem/item/:logoId', app.permission.check('component:read'), (req, res) =>
        app.model.homeLogoItem.getAll({id: req.params.logoId}, (error, item) => res.send({ error, item })));
    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/logo/:id', (req, res) => app.model.homeLogo.get({id: req.params.id}, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/logo'));

    const uploadLogoImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('logo') && files.LogoImage && files.LogoImage.length > 0) {
            console.log('Hook: uploadLogoImage => Logo image upload');
            uploadComponentImage(req, 'logo', app.model.homeLogoItem.get, fields.userData[0].substring(5), files.LogoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLogoImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLogoImage(req, fields, files, params, done), done, 'component:write'));

    const uploadComponentImage = (req, dataName, getItem, dataId, srcPath, sendResponse) => {
        if (dataId == 'new') {
            let imageLink = app.path.join('/img/logo', app.path.basename(srcPath)),
                sessionPath = app.path.join(app.publicPath, imageLink);
            app.fs.rename(srcPath, sessionPath, error => {
                if (error == null) req.session[dataName + 'Image'] = sessionPath;
                sendResponse({ error, image: imageLink });
            });
        } else {
            req.session[dataName + 'Image'] = null;
            if (getItem) {
                getItem({logoId: dataId.id, priority: dataId.priority}, (error, dataItem) => {
                if (error || dataItem == null) {
                    sendResponse({ error: 'Invalid Id!' });
                } else {
                    app.deleteImage(dataItem.image);
                    dataItem.image = app.path.join('/img/logo', app.path.basename(srcPath));
                    let sessionPath = app.path.join(app.publicPath, dataItem.image);
                    app.fs.rename(srcPath, sessionPath, error => {
                        if (error) {
                            sendResponse({ error });
                        } else {
                            dataItem.image += '?t=' + (new Date().getTime()).toString().slice(-8);
                            app.model.homeLogoItem.update({logoId: dataItem.id, priority: dataItem.priority}, changes, (err) => {
                            if (err == null) app.io.emit(dataName + '-changed', dataItem);
                                sendResponse({
                                    error,
                                    url: dataItem.image,
                                    image: dataItem.image,
                                });
                            });
                        }
                    });
                }
            });
            } else {
                const image = '/img/' + dataName + '/' + dataId + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => sendResponse({ error, image }));
            }
        }
    };
        
};
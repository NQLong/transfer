module.exports = app => {
    app.get('/api/video/all', app.permission.check('component:read'), (req, res) =>
        app.model.homeVideo.getAll((error, items) => res.send({ error, items })));

    app.get('/api/video/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {

        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = {};
        const user = req.session.user;
        if (user && user.permissions.includes('website:manage')) {
            condition.maDonVi = '0';
        } else if (user && user.maDonVi && user.permissions.includes('website:read')) {
            condition.maDonVi = user.maDonVi;
        }
        app.model.homeVideo.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/video', app.permission.check('website:write'), (req, res) => {
        if (req.body.data && req.session.user && req.body.data.image == null) {
            req.body.data.image = '/public/avatar.png';
            req.body.data.maDonVi = req.session.user.maDonVi;
        }
        app.model.homeVideo.create(req.body.data, (error, video) => {
            if (video && req.session.videoImage) {
                uploadComponentImage(req, 'video', app.model.homeVideo.get, video.id, req.session.videoImage, response => {
                    if (response.image && response.image != '') {
                        video.image = response.image;
                        res.send({ error: response.error, video });
                    }
                });
            } else {
                res.send({ error, video });
            }
        })
    });

    app.put('/api/video', app.permission.check('website:write'), (req, res) => {
        let data = req.body.changes,
            changes = {};
        if (data.title && data.title != '') changes.title = data.title;
        if (data.link && data.link != '') changes.link = data.link;
        if (data.image && data.image != '') changes.image = data.image;
        if (data.content && data.content != '') changes.content = data.content;

        app.model.homeVideo.update({ id: req.body.id }, changes, (error, video) => res.send({ error, video }));
    });

    app.delete('/api/video', app.permission.check('component:write'), (req, res) => {
        app.model.homeVideo.get({ id: req.body.id }, (err, item) => {
            if (err == null) {
                app.deleteImage(item.image);
            }
        });
        app.model.homeVideo.delete({ id: req.body.id }, error => res.send({ error }))
    });


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/video/:id', (req, res) => app.model.homeVideo.get({ id: req.params.id }, (error, item) => res.send({ error, item })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/video'));

    const uploadVideo = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('video:') && files.VideoImage && files.VideoImage.length > 0) {
            console.log('Hook: uploadVideo => video image upload');
            uploadComponentImage(req, 'video', app.model.homeVideo.get, fields.userData[0].substring(6), files.VideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadVideo(req, fields, files, params, done), done, 'website:write'));

    //Upload imgae/video-------------------------------------------------------------------------------------------------------
    const uploadComponentImage = (req, dataName, getItem, dataId, srcPath, sendResponse) => {
        if (dataId == 'new') {
            let imageLink = app.path.join('/img/video', app.path.basename(srcPath)),
                sessionPath = app.path.join(app.publicPath, imageLink);
            app.fs.rename(srcPath, sessionPath, error => {
                if (error == null) req.session[dataName + 'Image'] = sessionPath;
                sendResponse({ error, image: imageLink });
            });
        } else {
            req.session[dataName + 'Image'] = null;
            if (getItem) {
                getItem({ id: dataId }, (error, dataItem) => {
                    if (error || dataItem == null) {
                        sendResponse({ error: 'Invalid Id!' });
                    } else {
                        if (dataItem.image != '/public/avatar.png') {
                            app.deleteImage(dataItem.image);
                        }
                        dataItem.image = '/img/' + dataName + '/' + dataItem.id + app.path.extname(srcPath);
                        app.fs.rename(srcPath, app.path.join(app.publicPath, dataItem.image), error => {
                            if (error) {
                                sendResponse({ error });
                            } else {
                                dataItem.image += '?t=' + (new Date().getTime()).toString().slice(-8);
                                let changes = {};
                                if (dataItem.title && dataItem.title != '') changes.title = dataItem.title;
                                if (dataItem.link && dataItem.link != '') changes.link = dataItem.link;
                                if (dataItem.image && dataItem.image != '') changes.image = dataItem.image;
                                if (dataItem.content && dataItem.content != '') changes.content = dataItem.content;
                                app.model.homeVideo.update({ id: dataItem.id }, changes, (err) => {
                                    if (err == null) app.io.emit(dataName + '-changed', dataItem);
                                    sendResponse({
                                        error,
                                        item: dataItem,
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
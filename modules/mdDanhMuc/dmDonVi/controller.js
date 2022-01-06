module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            23: { title: 'Danh sách Đơn vị', link: '/user/danh-muc/don-vi' },
        },
    };
    app.permission.add(
        { name: 'dmDonVi:read', menu },
        { name: 'dmDonVi:write' },
        { name: 'dmDonVi:delete' },
        { name: 'dmDonVi:upload' },
        { name: 'staff:login' },
    );
    app.get('/user/danh-muc/don-vi', app.permission.check('dmDonVi:read'), app.templates.admin);
    app.get('/user/danh-muc/don-vi/upload', app.permission.check('dmDonVi:write'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/don-vi/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'ten', 'tenTiengAnh', 'tenVietTat']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmDonVi.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/don-vi/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDonVi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/don-vi/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmDonVi.get({ ma: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/don-vi', app.permission.check('dmDonVi:write'), (req, res) => {
        let data = req.body.item;
        if (req.session.dmDonViImage) {
            const srcPath = req.session.dmDonViImage,
                imageLink = '/img/dmDonVi/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath),
                destPath = app.path.join(app.publicPath, imageLink);
            app.fs.copyFile(srcPath, destPath, () => {
                app.deleteFile(srcPath);
                data.image = imageLink;
                app.model.dmDonVi.create(data, (error, item) => res.send({ error, item }));
            });
        } else {
            app.model.dmDonVi.create(data, (error, item) => res.send({ error, item }));
        }

    });

    app.put('/api/danh-muc/don-vi', app.permission.check('dmDonVi:write'), (req, res) => {
        app.model.dmDonVi.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/don-vi', app.permission.check('dmDonVi:delete'), (req, res) => {
        app.model.dmDonVi.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.post('/api/danh-muc/don-vi/upload', app.permission.check('dmDonVi:upload'), (req, res) => {
        app.model.dmDonVi.upload(req.body.upload, error => res.send({ error }));
    });
    app.get('/api/danh-muc/don-vi/faculty', app.permission.check('user:login'), (req, res) => {
        let condition = {
            statement: 'maPl IN (:maPl) OR ma IN (:ma)',
            parameter: {
                maPl: '01',
                ma: ['30', '57']
            },
        };
        app.model.dmDonVi.getAll(condition, '*', null, (error, items) => res.send({ error, items }));
    });
    app.get('/dm-don-vi/:idLoaiDonVi', (req, res) => {
        const condition = { maPl: req.params.idLoaiDonVi, kichHoat: 1 };
        app.model.dmDonVi.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/dmDonVi'));
    app.createFolder(app.path.join(app.publicPath, '/img/dmDonViImage'));


    const uploadDmDonViImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dmDonVi:') && files.DmDonViImage && files.DmDonViImage.length > 0) {
            console.log('Hook: uploadDmDonViImage => news image upload');
            app.uploadComponentImage(req, 'dmDonVi', app.model.dmDonVi, fields.userData[0].substring(8), files.DmDonViImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDmDonViImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDmDonViImage(req, fields, files, params, done), done, 'dmDonVi:write'));

    //New Data
    const uploadDmDonViImageDisplay = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dmDonViImage:') && files.DmDonViImageDisplay && files.DmDonViImageDisplay.length > 0) {
            console.log('Hook: uploadDmDonViImageDisplay => news image upload');
            const maDonVi = fields.userData[0].substring(13),
                srcPath = files.DmDonViImageDisplay[0].path;
            let image = '/img/dmDonVi/' + maDonVi + '_' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
            app.model.dmDonVi.get({ ma: maDonVi }, (error, donVi) => {
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    if (error) done({ error });
                    else if (donVi) {
                        app.deleteFile(srcPath);
                        if (donVi.imageDisplay) app.deleteFile(app.path.join(app.publicPath, donVi.imageDisplay));
                        app.model.dmDonVi.update({ ma: maDonVi }, { imageDisplay: image }, (error,) => done({ error, image: image }));
                    }
                });
            });
        }
    };
    app.uploadHooks.add('uploadDmDonViImageDisplay', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDmDonViImageDisplay(req, fields, files, params, done), done, 'dmDonVi:write'));

    const uploadDmDonViImageDisplayTA = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dmDonViImageTA:') && files.DmDonViImageDisplayTA && files.DmDonViImageDisplayTA.length > 0) {
            console.log('Hook: uploadDmDonViImageDisplayTA => news image upload');
            const maDonVi = fields.userData[0].substring(15),
                srcPath = files.DmDonViImageDisplayTA[0].path;
            let image = '/img/dmDonVi/' + maDonVi + 'TA_' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
            app.model.dmDonVi.get({ ma: maDonVi }, (error, donVi) => {
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    if (error) done({ error });
                    else if (donVi) {
                        app.deleteFile(srcPath);
                        if (donVi.imageDisplayTa) app.deleteFile(app.path.join(app.publicPath, donVi.imageDisplayTa));
                        app.model.dmDonVi.update({ ma: maDonVi }, { imageDisplayTa: image }, (error,) => done({ error, image: image }));
                    }
                });
            });
        }
    };
    app.uploadHooks.add('uploadDmDonViImageDisplayTA', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDmDonViImageDisplayTA(req, fields, files, params, done), done, 'dmDonVi:write'));

    // Hook ready -----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyDmDonVi', {
        ready: () => app.dbConnection != null && app.model != null && app.model.dmDonVi != null,
        run: () => app.model.dmDonVi.count((error, numberOfDonVi) => app.data.numberOfDonVi = error ? 0 : numberOfDonVi),
    });
};
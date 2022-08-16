module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.websiteDv,
        menus: {
            1901: { title: 'Danh sách', link: '/user/website', icon: 'fa-chrome', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add(
        { name: 'website:manage', menu },
        { name: 'website:read', menu },
        { name: 'website:write' },
        { name: 'website:delete' });
    app.get('/user/website', app.permission.check('website:read'), app.templates.admin);
    app.get('/user/websites', app.permission.check('website:read'), app.templates.admin);
    app.get('/user/website/edit/:ma', app.permission.check('website:read'), app.templates.admin);
    // app.get('/user/website/edit/:shortname/:ma', app.permission.check('website:read'), app.templates.admin);
    app.get('/user/website/intro/edit/:ma', app.permission.check('website:read'), app.templates.admin);
    app.get('/user/news-donvi/:ma', app.permission.check('website:read'), app.templates.admin);
    app.get('/user/event-donvi/:ma', app.permission.check('website:read'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/website/page/:pageNumber/:pageSize', app.permission.check('website:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize), searchTerm = req.query.condition || '';
            let user = req.session.user, condition = {};
            if (user.permissions && !user.permissions.includes('website:manage')) {
                condition.maDonVi = user.maDonVi;
            }

            const page = await app.model.dvWebsite.searchPageDonVi(_pageNumber, _pageSize, !user.permissions.includes('website:manage') ? user.maDonVi : '', searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/website/all', (req, res) => {
        const condition = req.query.condition ? req.query.condition : {};
        app.model.dvWebsite.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/website/item/:id', async (req, res) => {
        try {
            const condition = req.query.condition;
            const item = await app.model.dvWebsite.get(condition ? condition : { id: req.params.id });
            if (item.maDonVi) item.donVi = await app.model.dmDonVi.get({ ma: item.maDonVi }, 'ma, ten, tenTiengAnh, tenVietTat, homeLanguage');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/website', app.permission.check('website:read'), async (req, res) => {
        try {
            const data = req.body.item;
            if (data.shortname) data.shortname = data.shortname.toLowerCase();
            const checkItem = await app.model.dvWebsite.get({ shortname: data.shortname });
            if (checkItem) {
                res.send({ error: 'Tên viết tắt đã được sử dụng!' });
            } else {
                const item = await app.model.dvWebsite.create(data);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/website', app.permission.check('website:read'), async (req, res) => {
        try {
            let changes = req.body.changes, id = req.body.id;
            if (changes.shortname) {
                changes.shortname = changes.shortname.toLowerCase();
                // Check duplicate
                const checkItem = await app.model.dvWebsite.get({ shortname: changes.shortname });
                if (checkItem && checkItem.id != id) {
                    return res.send({ error: 'Tên viết tắt đã được sử dụng!' });
                }
            }

            const item = await app.model.dvWebsite.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/website', app.permission.check('website:read'), (req, res) => {
        app.model.dvWebsite.delete({ shortname: req.body.shortname }, errors => res.send({ errors }));
    });

    // WebsiteGioiThieu APIs ------------------------------------------------------------------------------------------------------------------------
    app.get('/api/website/intro/page/:pageNumber/:pageSize', app.permission.check('website:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.dvWebsiteGioiThieu.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/website/intro/all/:maDonVi', (req, res) => {
        app.model.dvWebsiteGioiThieu.getAll({ maDonVi: req.params.maDonVi }, '*', 'thuTu DESC', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/website/intro/item/:ma', (req, res) => {
        app.model.dvWebsiteGioiThieu.get({ ma: req.params.ma }, (error, dvGioiThieu) => {
            if (error || dvGioiThieu == null) {
                res.send({ error: 'Lỗi khi lấy danh sách mục giới thiệu!' });
            } else {
                app.model.dvWebsiteGioiThieuHinh.getAll({ maWebsiteGioiThieu: dvGioiThieu.ma }, '*', 'thuTu DESC', (error, items) => {
                    res.send({ error, item: app.clone(dvGioiThieu, { hinhAnh: items }) });
                });
            }
        });
    });

    app.post('/api/website/intro', app.permission.check('website:write'), (req, res) => {
        let { maDonVi, ten, noiDung, trongSo, kichHoat } = req.body.item;
        app.model.dvWebsiteGioiThieu.createNewItem(maDonVi, ten, noiDung, trongSo, kichHoat ? 1 : 0, (error, result) => {
            if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                app.model.dvWebsiteGioiThieu.get({ ma: result.outBinds.ret }, (error, item) => res.send({ error, item }));
            } else {
                res.send({ error: 'Tạo mục giới thiệu bị lỗi!' });
            }
        });
    });

    app.put('/api/website/intro', app.permission.check('website:read'), (req, res) => {
        let item = req.body.changes;
        if (item.ma) item.ma = item.ma.toLowerCase();
        app.model.dvWebsiteGioiThieu.update({ ma: req.body.ma }, item, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/website/intro', app.permission.check('website:read'), (req, res) => {
        app.model.dvWebsiteGioiThieu.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.put('/api/website/intro/swap', app.permission.check('website:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true' ? 1 : 0;
        app.model.dvWebsiteGioiThieu.swapThuTu(req.body.ma, isMoveUp, req.body.maDonVi, error => res.send({ error }));
    });

    // WebsiteGioiThieuHinh APIs --------------------------------------------------------------------------------------------------------------------
    app.get('/api/website/intro/image/all', (req, res) => {
        app.model.dvWebsiteGioiThieuHinh.getAll('*', 'thuTu DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/website/intro/image/all/:maWebsiteGioiThieu', (req, res) => {
        app.model.dvWebsiteGioiThieuHinh.getAll({ maWebsiteGioiThieu: req.params.maWebsiteGioiThieu }, '*', 'thuTu ASC', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/website/intro/image/item/:ma', (req, res) => {
        app.model.dvWebsiteGioiThieuHinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/website/intro/image', app.permission.check('website:read'), (req, res) => {
        let { link, maWebsiteGioiThieu, image, kichHoat } = req.body.item;
        app.model.dvWebsiteGioiThieuHinh.createNewItem(link, maWebsiteGioiThieu, image, kichHoat ? 1 : 0, (error, result) => {
            if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                app.model.dvWebsiteGioiThieuHinh.get({ ma: result.outBinds.ret }, (error, item) => res.send({ error, item }));
            } else {
                res.send({ error: 'Tạo hình giới thiệu bị lỗi!' });
            }
        });
    });

    app.put('/api/website/intro/image', app.permission.check('website:read'), (req, res) => {
        let item = req.body.changes;
        app.model.dvWebsiteGioiThieuHinh.update({ ma: req.body.ma }, item, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/website/intro/image', app.permission.check('website:read'), (req, res) => {
        app.model.dvWebsiteGioiThieuHinh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.put('/api/website/intro/image/swap', app.permission.check('website:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true' ? 1 : 0;
        app.model.dvWebsiteGioiThieuHinh.swapThuTu(req.body.ma, isMoveUp, req.body.maWebsiteGioiThieu, error => res.send({ error }));
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, '/img/dvWebsiteGioiThieu'));

    const uploadDvWebsiteGioiThieuImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('DvWebsiteGioiThieu:') && files.DvWebsiteGioiThieuImage && files.DvWebsiteGioiThieuImage.length > 0) {
            console.log('Hook: uploadDvWebsiteGioiThieuImage => website image upload');
            let userData = fields.userData[0].split(' ');
            const conditions = userData[1] == 'new' ? { ma: 'new' } : { ma: userData[1] };
            uploadComponentImageWebsite(req, 'dvWebsiteGioiThieu', app.model.dvWebsiteGioiThieuHinh, conditions, files.DvWebsiteGioiThieuImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDvWebsiteGioiThieuImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDvWebsiteGioiThieuImage(req, fields, files, params, done), done, 'website:write'));

    // WebsiteHinh APIs -----------------------------------------------------------------------------------------------------------------------------
    app.get('/api/website/image/all/:maDonVi', (req, res) => {
        app.model.dvWebsiteHinh.getAll({ maDonVi: req.params.maDonVi }, '*', 'thuTu DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/website/image/item/:ma', (req, res) => {
        app.model.dvWebsiteHinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/website/image', app.permission.check('website:read'), (req, res) => {
        let { maDonVi, image, tieuDe, link, kichHoat } = req.body.item;
        app.model.dvWebsiteHinh.createNewItem(maDonVi, image, tieuDe, link, kichHoat ? 1 : 0, (error, result) => {
            if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                app.model.dvWebsiteHinh.get({ ma: result.outBinds.ret }, (error, item) => res.send({ error, item }));
            } else {
                res.send({ error: 'Tạo hình đơn vị website bị lỗi!' });
            }
        });
    });

    app.put('/api/website/image', app.permission.check('website:read'), (req, res) => {
        app.model.dvWebsiteHinh.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/website/image', app.permission.check('website:read'), (req, res) => {
        app.model.dvWebsiteHinh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.put('/api/website/image/swap', app.permission.check('website:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true' ? 1 : 0;
        app.model.dvWebsiteHinh.swapThuTu(req.body.ma, isMoveUp, req.body.maDonVi, error => res.send({ error }));
    });

    app.get('/website/image/all/:maDonVi', (req, res) => {
        app.model.dvWebsiteHinh.getAll({ maDonVi: req.params.maDonVi, kichHoat: 1 }, '*', 'thuTu DESC', (error, items) => {
            if (error || items == null) {
                res.send({ error, items: null });
            } else {
                res.send({ error, items });
            }
        });
    });

    app.get('/website/intro/all/:maDonVi', (req, res) => {
        app.model.dvWebsiteGioiThieu.getAll({ maDonVi: req.params.maDonVi, kichHoat: 1 }, '*', 'thuTu ASC', (error, items) => {
            if (error || items == null) {
                res.send({ error, items: null });
            } else {
                const result = [];
                const handleGetImage = index => {
                    if (index >= items.length) {
                        res.send({ error, items: result });
                    } else {
                        app.model.dvWebsiteGioiThieuHinh.getAll({ maWebsiteGioiThieu: items[index].ma, kichHoat: 1 }, '*', 'thuTu DESC', (error, hinhAnh) => {
                            if (error || hinhAnh == null) {
                                res.send({ item: '' });
                            } else {
                                result.push(app.clone(items[index], { hinhAnh }));
                                handleGetImage(index + 1);
                            }
                        });
                    }
                };
                handleGetImage(0);
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.fs.createFolder(
        app.path.join(app.publicPath, '/img/dvWebsite'),
        app.path.join(app.publicPath, '/img/dvWebsiteHinh')
    );

    const uploadDvWebsiteHinhImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('DvWebsiteHinh:') && files.DvWebsiteGioiThieuImage && files.DvWebsiteGioiThieuImage.length > 0) {
            console.log('Hook: uploadDvWebsiteHinh => website image upload');
            let userData = fields.userData[0].split(' ');
            const conditions = userData[1] == 'new' ? { ma: 'new' } : { ma: userData[1] };
            uploadComponentImageWebsite(req, 'dvWebsiteHinh', app.model.dvWebsiteHinh, conditions, files.DvWebsiteGioiThieuImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadDvWebsiteHinhImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDvWebsiteHinhImage(req, fields, files, params, done), done, 'website:write'));

    const uploadComponentImageWebsite = (req, dataName, model, conditions, srcPath, sendResponse) => {
        if (conditions.ma == 'new') {
            let imageLink = '/img/' + dataName + '/' + app.path.basename(srcPath),
                sessionPath = app.path.join(app.publicPath, imageLink);
            app.fs.copyFile(srcPath, sessionPath, error => {
                app.fs.deleteFile(srcPath);
                if (error == null) req.session[dataName + 'Image'] = sessionPath;
                sendResponse({ error, image: imageLink });
            });
        } else {
            req.session[dataName + 'Image'] = null;
            if (model) {
                model.get(conditions, (error, dataItem) => {
                    if (error || dataItem == null) {
                        sendResponse({ error: 'Invalid Id!' });
                    } else {
                        // app.fs.deleteImage(dataItem.image);
                        dataItem.image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                        app.fs.copyFile(srcPath, app.path.join(app.publicPath, dataItem.image), error => {
                            if (error) {
                                sendResponse({ error });
                            } else {
                                dataItem.image += '?t=' + (new Date().getTime()).toString().slice(-8);
                                delete dataItem.ma;
                                app.fs.deleteFile(srcPath);
                                sendResponse({
                                    item: dataItem,
                                    image: dataItem.image,
                                });
                            }
                        });
                    }
                });
            } else {
                const image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    sendResponse({ error, image });
                    app.fs.deleteFile(srcPath);
                });
            }
        }
    };

    const uploadDvWebsiteImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('dvWebsite:') && files.DvWebsiteImage && files.DvWebsiteImage.length > 0) {
            console.log('Hook: upload dvWebsite image => dvWebsite image upload');
            app.uploadComponentImage(req, 'dvWebsite', app.model.dvWebsite, { shortname: fields.userData[0].substring(10) }, files.DvWebsiteImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadDvWebsiteImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDvWebsiteImage(req, fields, files, params, done), done, 'website:write'));

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyDvWebsite', {
        ready: () => app.database.oracle.connected && app.model.dvWebsite,
        run: () => app.model.dvWebsite.count((error, numberOfDvWebsite) => {
            if (error == null) {
                numberOfDvWebsite = Number(numberOfDvWebsite);
                app.model.setting.setValue({ numberOfDvWebsite: isNaN(numberOfDvWebsite) ? 0 : numberOfDvWebsite });
            }
        }),
    });
};
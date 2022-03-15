module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4083: { title: 'Đơn vị gửi công văn', link: '/user/danh-muc/don-vi-gui-cong-van' },
        },
    };
    app.permission.add(
        { name: 'dmDonViGuiCV:read', menu },
        { name: 'dmDonViGuiCV:write' },
        { name: 'dmDonViGuiCV:delete' },
        { name: 'dmDonViGuiCV:upload' },
        { name: 'staff:login', menu },
    );

    app.get('/user/danh-muc/don-vi-gui-cong-van', app.permission.check('dmDonViGuiCV:read'), app.templates.admin);
    app.get('/user/danh-muc/don-vi/upload', app.permission.check('dmDonViGuiCV:write'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/don-vi-gui-cong-van/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ten']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmDonViGuiCv.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/don-vi-gui-cong-van/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDonViGuiCv.getAll((error, items) => res.send({ error, items }));
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
            statement: 'maPl IN (:maPl)',
            parameter: {
                maPl: '01',
            },
        };
        app.model.dmDonVi.getAll(condition, (error, items) => res.send({ error, items }));
    });
    app.get('/dm-don-vi/:idLoaiDonVi', (req, res) => {
        const condition = { maPl: req.params.idLoaiDonVi, kichHoat: 1 };
        app.model.dmDonVi.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });
};
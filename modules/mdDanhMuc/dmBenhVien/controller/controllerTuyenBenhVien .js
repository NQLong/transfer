module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4005: { title: 'Tuyến bệnh viện', link: '/user/danh-muc/tuyen-benh-vien' } },
    };
    app.permission.add(
        { name: 'dmTuyenBenhVien:read', menu },
        { name: 'dmTuyenBenhVien:write' },
        { name: 'dmTuyenBenhVien:delete' },
    );
    app.get('/user/danh-muc/tuyen-benh-vien', app.permission.check('dmTuyenBenhVien:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tuyen-benh-vien/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTuyenBenhVien.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tuyen-benh-vien/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTuyenBenhVien.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tuyen-benh-vien/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTuyenBenhVien.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tuyen-benh-vien', app.permission.check('dmTuyenBenhVien:write'), (req, res) => {
        const newItem = req.body.dmTuyenBenhVien;
        app.model.dmTuyenBenhVien.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Tuyến bệnh viện ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmTuyenBenhVien.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/tuyen-benh-vien', app.permission.check('dmTuyenBenhVien:write'), (req, res) => {
        app.model.dmTuyenBenhVien.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/tuyen-benh-vien', app.permission.check('dmTuyenBenhVien:delete'), (req, res) => {
        app.model.dmTuyenBenhVien.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
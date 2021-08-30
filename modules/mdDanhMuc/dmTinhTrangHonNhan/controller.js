module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2029: { title: 'Tình trạng hôn nhân', link: '/user/danh-muc/tinh-trang-hon-nhan' },
        },
    };
    app.permission.add(
        { name: 'dmTinhTrangHonNhan:read', menu },
        { name: 'dmTinhTrangHonNhan:write' },
        { name: 'dmTinhTrangHonNhan:delete' },
    );
    app.get('/user/danh-muc/tinh-trang-hon-nhan', app.permission.check('dmTinhTrangHonNhan:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tinh-trang-hon-nhan/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTinhTrangHonNhan.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/tinh-trang-hon-nhan/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangHonNhan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tinh-trang-hon-nhan/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangHonNhan.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tinh-trang-hon-nhan', app.permission.check('dmTinhTrangHonNhan:write'), (req, res) => {
        app.model.dmTinhTrangHonNhan.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tinh-trang-hon-nhan', app.permission.check('dmTinhTrangHonNhan:write'), (req, res) => {
        app.model.dmTinhTrangHonNhan.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/tinh-trang-hon-nhan', app.permission.check('dmTinhTrangHonNhan:delete'), (req, res) => {
        app.model.dmTinhTrangHonNhan.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
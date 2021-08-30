module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2100: { title: 'Tình trạng đề tài NCKH', link: '/user/danh-muc/tinh-trang-de-tai-nckh' },
        },
    };
    app.permission.add(
        { name: 'dmTinhTrangDeTaiNckh:read', menu },
        { name: 'dmTinhTrangDeTaiNckh:write' },
        { name: 'dmTinhTrangDeTaiNckh:delete' },
    );
    app.get('/user/danh-muc/tinh-trang-de-tai-nckh', app.permission.check('dmTinhTrangDeTaiNckh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tinh-trang-de-tai-nckh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTinhTrangDeTaiNckh.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tinh-trang-de-tai-nckh/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangDeTaiNckh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tinh-trang-de-tai-nckh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangDeTaiNckh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tinh-trang-de-tai-nckh', app.permission.check('dmTinhTrangDeTaiNckh:write'), (req, res) => {
        app.model.dmTinhTrangDeTaiNckh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tinh-trang-de-tai-nckh', app.permission.check('dmTinhTrangDeTaiNckh:write'), (req, res) => {
        app.model.dmTinhTrangDeTaiNckh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/tinh-trang-de-tai-nckh', app.permission.check('dmTinhTrangDeTaiNckh:delete'), (req, res) => {
        app.model.dmTinhTrangDeTaiNckh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
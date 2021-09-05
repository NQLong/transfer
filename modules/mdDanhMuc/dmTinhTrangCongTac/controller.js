module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2050: { title: 'Tình trạng công tác', link: '/user/danh-muc/tinh-trang-cong-tac' } },
    };
    app.permission.add(
        { name: 'dmTinhTrangCongTac:read', menu },
        { name: 'dmTinhTrangCongTac:write' },
        { name: 'dmTinhTrangCongTac:delete' },
    );
    app.get('/user/danh-muc/tinh-trang-cong-tac', app.permission.check('dmTinhTrangCongTac:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tinh-trang-cong-tac/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTinhTrangCongTac.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tinh-trang-cong-tac/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTinhTrangCongTac.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/tinh-trang-cong-tac/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTinhTrangCongTac.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tinh-trang-cong-tac', app.permission.check('dmTinhTrangCongTac:write'), (req, res) => {
        const newItem = req.body.dmTinhTrangCongTac;
        app.model.dmTinhTrangCongTac.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Tình trạng công tác ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmTinhTrangCongTac.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/tinh-trang-cong-tac', app.permission.check('dmTinhTrangCongTac:write'), (req, res) => {
        app.model.dmTinhTrangCongTac.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/tinh-trang-cong-tac', app.permission.check('dmTinhTrangCongTac:delete'), (req, res) => {
        app.model.dmTinhTrangCongTac.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
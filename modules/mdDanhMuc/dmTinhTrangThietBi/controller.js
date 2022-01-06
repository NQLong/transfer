module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            70: { title: 'Tình trạng thiết bị', link: '/user/danh-muc/tinh-trang-thiet-bi' },
        },
    };

    app.permission.add(
        { name: 'dmTinhTrangThietBi:read', menu },
        { name: 'dmTinhTrangThietBi:write' },
        { name: 'dmTinhTrangThietBi:delete' },
    );

    app.get('/user/danh-muc/tinh-trang-thiet-bi', app.permission.check('dmTinhTrangThietBi:read'), app.templates.admin);

    app.get('/api/danh-muc/tinh-trang-thiet-bi/page/:pageNumber/:pageSize', app.permission.check('dmTinhTrangThietBi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(tinhTrangThietBi) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTinhTrangThietBi.getPage(pageNumber, pageSize, searchTerm, '*', 'ma asc', (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                res.send({ error, page });
            }
        });
    });

    app.get('/api/danh-muc/tinh-trang-thiet-bi/:maTinhTrangThietBi', app.permission.check('dmTinhTrangThietBi:read'), (req, res) => {
        const { maTinhTrangThietBi } = req.params;
        app.model.dmTinhTrangThietBi.get({ ma: maTinhTrangThietBi }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/tinh-trang-thiet-bi', app.permission.check('dmTinhTrangThietBi:write'), (req, res) => {
        const newTinhTrangThietBi = req.body.tinhTrangThietBi || {};
        app.model.dmTinhTrangThietBi.create(newTinhTrangThietBi, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tinh-trang-thiet-bi', app.permission.check('dmTinhTrangThietBi:write'), (req, res) => {
        const changesTinhTrangThietBi = req.body.changes;
        app.model.dmTinhTrangThietBi.update(
            { ma: req.body.ma },
            changesTinhTrangThietBi,
            (err, items) => res.send({ err, items }));
    });

    app.delete('/api/danh-muc/tinh-trang-thiet-bi', app.permission.check('dmTinhTrangThietBi:delete'), (req, res) => {
        app.model.dmTinhTrangThietBi.delete({ ma: req.body.ma }, (err, items) => res.send({ err, items }));
    });
};

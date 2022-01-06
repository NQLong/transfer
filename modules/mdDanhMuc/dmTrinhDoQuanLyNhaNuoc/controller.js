module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            76: { title: 'Trình độ Quản lý nhà nước', link: '/user/danh-muc/trinh-do-quan-ly-nha-nuoc' },
        },
    };
    app.permission.add(
        { name: 'dmTrinhDoQuanLyNhaNuoc:read', menu },
        { name: 'dmTrinhDoQuanLyNhaNuoc:write' },
        { name: 'dmTrinhDoQuanLyNhaNuoc:delete' },
    );
    app.get('/user/danh-muc/trinh-do-quan-ly-nha-nuoc', app.permission.check('dmTrinhDoQuanLyNhaNuoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/trinh-do-quan-ly-nha-nuoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTrinhDoQuanLyNhaNuoc.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/trinh-do-quan-ly-nha-nuoc/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTrinhDoQuanLyNhaNuoc.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/trinh-do-quan-ly-nha-nuoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTrinhDoQuanLyNhaNuoc.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/trinh-do-quan-ly-nha-nuoc', app.permission.check('dmTrinhDoQuanLyNhaNuoc:write'), (req, res) => {
        let newData = req.body.item;
        newData.kichHoat = newData.kichHoat ? parseInt(newData.kichHoat) : null;
        app.model.dmTrinhDoQuanLyNhaNuoc.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/trinh-do-quan-ly-nha-nuoc', app.permission.check('dmTrinhDoQuanLyNhaNuoc:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmTrinhDoQuanLyNhaNuoc.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/trinh-do-quan-ly-nha-nuoc', app.permission.check('dmTrinhDoQuanLyNhaNuoc:delete'), (req, res) => {
        app.model.dmTrinhDoQuanLyNhaNuoc.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
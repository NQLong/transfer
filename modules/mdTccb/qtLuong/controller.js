module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3031: { title: 'Quá trình lương', link: '/user/tccb/qua-trinh/luong', icon: 'fa-money', backgroundColor: '#21b849', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'qtLuong:read', menu },
        { name: 'qtLuong:write' },
        { name: 'qtLuong:delete' },
    );
    app.get('/user/tccb/qua-trinh/luong/:ma', app.permission.check('qtLuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/luong', app.permission.check('qtLuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/luong/group/:ma', app.permission.check('qtLuong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);
    app.get('/api/tccb/qua-trinh/luong/page/:pageNumber/:pageSize', app.permission.check('qtLuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtLuong.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/luong/group/page/:pageNumber/:pageSize', app.permission.check('qtLuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtLuong.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/qua-trinh/luong/all', checkGetStaffPermission, (req, res) => {
        app.model.qtLuong.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/qua-trinh/luong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtLuong.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/luong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtLuong.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/luong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtLuong.delete({ id: req.body.id }, (error) => res.send(error)));
};
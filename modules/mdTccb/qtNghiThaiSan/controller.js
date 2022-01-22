module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3015: { title: 'Quá trình nghỉ thai sản', link: '/user/tccb/qua-trinh/nghi-thai-san', icon: 'fa-bed', backgroundColor: '#515659', groupIndex: 1},
        },
    };
    app.permission.add(
        { name: 'qtNghiThaiSan:read', menu },
        { name: 'qtNghiThaiSan:write' },
        { name: 'qtNghiThaiSan:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-thai-san/:stt', app.permission.check('qtNghiThaiSan:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/qua-trinh/nghi-thai-san/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        // if (req.query.condition) {
        //     condition = {
        //         statement: 'lower(stt) LIKE :searchText OR lower(ten) LIKE :searchText',
        //         parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
        //     };
        // }
        // app.model.qtNghiThaiSan.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
        app.model.qtNghiThaiSan.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-thai-san/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiThaiSan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtNghiThaiSan.groupPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/qua-trinh/nghi-thai-san/all', checkGetStaffPermission, (req, res) => {
        app.model.qtNghiThaiSan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/qua-trinh/nghi-thai-san/item/:stt', checkGetStaffPermission, (req, res) => {
        app.model.qtNghiThaiSan.get({ stt: req.params.stt }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/qua-trinh/nghi-thai-san/edit/item/:stt', checkGetStaffPermission, (req, res) => {
        app.model.qtNghiThaiSan.get({ stt: req.params.stt }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:write'), (req, res) => {
        app.model.qtNghiThaiSan.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:write'), (req, res) => {
        app.model.qtNghiThaiSan.update({ stt: req.body.stt }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:delete'), (req, res) => {
        app.model.qtNghiThaiSan.delete({ stt: req.body.stt }, errors => res.send({ errors }));
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3015: { title: 'Quá trình nghỉ thai sản', link: '/user/tccb/qua-trinh/nghi-thai-san', icon: 'fa-bed', backgroundColor: '#515659', groupIndex: 4 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1013: { title: 'Nghỉ thai sản', link: '/user/nghi-thai-san', icon: 'fa-bed', backgroundColor: '#515659', groupIndex: 3 },
        },
    };

    app.permission.add(
        { name: 'staff:female', menu: menuStaff },
        { name: 'qtNghiThaiSan:read', menu },
        { name: 'qtNghiThaiSan:write' },
        { name: 'qtNghiThaiSan:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-thai-san/:stt', app.permission.check('qtNghiThaiSan:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:read'), app.templates.admin);
    app.get('/user/nghi-thai-san', app.permission.check('staff:female'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/qua-trinh/nghi-thai-san/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtNghiThaiSan.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-thai-san/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiThaiSan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtNghiThaiSan.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/qua-trinh/nghi-thai-san/all', checkGetStaffPermission, (req, res) => {
        app.model.qtNghiThaiSan.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:write'), (req, res) => {
        app.model.qtNghiThaiSan.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:write'), (req, res) => {
        app.model.qtNghiThaiSan.update({ stt: req.body.stt }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:delete'), (req, res) => {
        app.model.qtNghiThaiSan.delete({ stt: req.body.stt }, errors => res.send({ errors }));
    });

    // //User Actions:
    app.post('/api/user/qua-trinh/nghi-thai-san', app.permission.check('staff:female'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNghiThaiSan.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nghi-thai-san', app.permission.check('staff:female'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNghiThaiSan.get({ stt: req.body.stt }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNghiThaiSan.update({ stt: req.body.stt }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nghi-thai-san', app.permission.check('staff:female'), (req, res) => {
        if (req.session.user) {
            app.model.qtNghiThaiSan.get({ stt: req.body.stt }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtNghiThaiSan.delete({ stt: req.body.stt }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/nghi-thai-san/page/:pageNumber/:pageSize', app.permission.check('staff:female'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.qtNghiThaiSan.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, 0, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    ///END USER ACTIONS
};
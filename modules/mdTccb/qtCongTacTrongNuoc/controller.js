module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3043: { title: 'Quá trình Công tác trong nước', link: '/user/tccb/qua-trinh/cong-tac-trong-nuoc', icon: 'fa fa-building', backgroundColor: '#fa0fd3', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1032: { title: 'Công tác trong nước', link: '/user/cong-tac-trong-nuoc', icon: 'fa fa-building', backgroundColor: '#fa0fd3', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtCongTacTrongNuoc:read', menu },
        { name: 'qtCongTacTrongNuoc:write' },
        { name: 'qtCongTacTrongNuoc:delete' },
    );
    app.get('/user/tccb/qua-trinh/cong-tac-trong-nuoc', app.permission.check('qtCongTacTrongNuoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/cong-tac-trong-nuoc/group/:shcc', app.permission.check('qtCongTacTrongNuoc:read'), app.templates.admin);
    app.get('/user/cong-tac-trong-nuoc', app.permission.check('staff:login'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtCongTacTrongNuoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtCongTacTrongNuoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtCongTacTrongNuoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtCongTacTrongNuoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtCongTacTrongNuoc.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/cong-tac-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtCongTacTrongNuoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtCongTacTrongNuoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/group/page/:pageNumber/:pageSize', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtCongTacTrongNuoc.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtCongTacTrongNuoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtCongTacTrongNuoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtCongTacTrongNuoc.delete({ id: req.body.id }, (error) => res.send(error)));
};
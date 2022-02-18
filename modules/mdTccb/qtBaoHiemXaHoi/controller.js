module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3037: { title: 'Quá trình bảo hiểm xã hội', link: '/user/tccb/qua-trinh/bao-hiem-xa-hoi', icon: 'fa-life-ring', backgroundColor: '#02006e', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1009: { title: 'Bảo hiểm xã hội', link: '/user/bao-hiem-xa-hoi', icon: 'fa-life-ring', backgroundColor: '#02006e', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBaoHiemXaHoi:read', menu },
        { name: 'qtBaoHiemXaHoi:write' },
        { name: 'qtBaoHiemXaHoi:delete' },
    );
    app.get('/user/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('qtBaoHiemXaHoi:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bao-hiem-xa-hoi/group/:shcc', app.permission.check('qtBaoHiemXaHoi:read'), app.templates.admin);
    app.get('/user/bao-hiem-xa-hoi', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtBaoHiemXaHoi.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaoHiemXaHoi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBaoHiemXaHoi.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaoHiemXaHoi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtBaoHiemXaHoi.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.qtBaoHiemXaHoi.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.qtBaoHiemXaHoi.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/group/page/:pageNumber/:pageSize', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.qtBaoHiemXaHoi.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.delete({ id: req.body.id }, (error) => res.send(error)));

};
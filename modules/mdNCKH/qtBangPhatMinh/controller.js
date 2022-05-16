module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9503: { title: 'Quá trình bằng phát minh', link: '/user/khcn/qua-trinh/bang-phat-minh', icon: 'fa fa-cogs', color: '#000000', backgroundColor: '#FFE47A' },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9503: { title: 'Bằng phát minh', link: '/user/bang-phat-minh', icon: 'fa fa-cogs', backgroundColor: '#FFE47A', color: '#000000' },
        },
    };

    const menuTCCB = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3014: { title: 'Bằng phát minh', link: '/user/tccb/qua-trinh/bang-phat-minh', icon: 'fa fa-cogs', backgroundColor: '#FFE47A', color: '#000000', groupIndex: 5 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBangPhatMinh:readOnly', menu: menuTCCB },
        { name: 'qtBangPhatMinh:read', menu },
        { name: 'qtBangPhatMinh:write' },
        { name: 'qtBangPhatMinh:delete' },
    );
    app.get('/user/:khcn/qua-trinh/bang-phat-minh', app.permission.orCheck('qtBangPhatMinh:read', 'qtBangPhatMinh:readOnly'), app.templates.admin);
    app.get('/user/:khcn/qua-trinh/bang-phat-minh/group/:shcc', app.permission.orCheck('qtBangPhatMinh:read', 'qtBangPhatMinh:readOnly'), app.templates.admin);
    app.get('/user/bang-phat-minh', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/bang-phat-minh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtBangPhatMinh.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bang-phat-minh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBangPhatMinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBangPhatMinh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/bang-phat-minh', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBangPhatMinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtBangPhatMinh.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/bang-phat-minh/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtBangPhatMinh.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
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

    app.get('/api/khcn/qua-trinh/bang-phat-minh/page/:pageNumber/:pageSize', app.permission.orCheck('qtBangPhatMinh:read', 'qtBangPhatMinh:readOnly'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtBangPhatMinh.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/khcn/qua-trinh/bang-phat-minh/group/page/:pageNumber/:pageSize', app.permission.orCheck('qtBangPhatMinh:read', 'qtBangPhatMinh:readOnly'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtBangPhatMinh.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:write'), (req, res) => {
        app.model.qtBangPhatMinh.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Bằng phát minh');
            res.send({ error, item });
        });
    });

    app.put('/api/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:write'), (req, res) => {
        app.model.qtBangPhatMinh.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Bằng phát minh');
            res.send({ error, item });
        });
    });
    app.delete('/api/qua-trinh/bang-phat-minh', app.permission.check('qtBangPhatMinh:write'), (req, res) => {
        app.model.qtBangPhatMinh.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Bằng phát minh');
            res.send({ error });
        });
    });

};
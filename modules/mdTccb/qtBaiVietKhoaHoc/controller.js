module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3025: { title: 'Danh sách bài viết khoa học', link: '/user/tccb/qua-trinh/bai-viet-khoa-hoc', icon: 'fa-quote-right', backgroundColor: '#23a0b0', groupIndex: 5 },
        },
    };
    app.permission.add(
        { name: 'qtBaiVietKhoaHoc:read', menu },
        { name: 'qtBaiVietKhoaHoc:write' },
        { name: 'qtBaiVietKhoaHoc:delete' },
    );
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc/group/:shcc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtBaiVietKhoaHoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
    app.delete('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, xuatBanRange } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, xuatBanRange: null };
        app.model.qtBaiVietKhoaHoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, xuatBanRange, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, xuatBanRange } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, xuatBanRange: null };
        app.model.qtBaiVietKhoaHoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, xuatBanRange, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/bai-viet-khoa-hoc/group/page/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, xuatBanRange } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, xuatBanRange: null };
        app.model.qtBaiVietKhoaHoc.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, xuatBanRange, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error)));
};
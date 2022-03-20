module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3044: { title: 'Danh sách Nghỉ không lương', link: '/user/tccb/qua-trinh/nghi-khong-luong', icon: 'fa fa-window-close', color: '#000000', backgroundColor: '#ba70ff', groupIndex: 4 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1027: { title: 'Nghỉ không lương', link: '/user/nghi-khong-luong', icon: 'fa fa-window-close', backgroundColor: '#a5aa45', groupIndex: 3 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtNghiKhongLuong:read', menu },
        { name: 'qtNghiKhongLuong:write' },
        { name: 'qtNghiKhongLuong:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-khong-luong', app.permission.check('qtNghiKhongLuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-khong-luong/group/:shcc', app.permission.check('qtNghiKhongLuong:read'), app.templates.admin);
    app.get('/user/nghi-khong-luong', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/nghi-khong-luong', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNghiKhongLuong.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nghi-khong-luong', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNghiKhongLuong.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNghiKhongLuong.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nghi-khong-luong', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtNghiKhongLuong.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtNghiKhongLuong.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/nghi-khong-luong/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, tinhTrang, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, tinhTrang: null, timeType: 0 };
        app.model.qtNghiKhongLuong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, tinhTrang, timeType, searchTerm, (error, page) => {
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
    
    app.get('/api/tccb/qua-trinh/nghi-khong-luong/page/:pageNumber/:pageSize', app.permission.check('qtNghiKhongLuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, tinhTrang, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, tinhTrang: null, timeType: 0 };
        app.model.qtNghiKhongLuong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, tinhTrang, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    // app.get('/api/tccb/qua-trinh/nghi-khong-luong/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiKhongLuong:read'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    //     const { fromYear, toYear, listShcc, listDv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, tinhTrang: null };
    //     app.model.qtNghiKhongLuong.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
    //         if (error || page == null) {
    //             res.send({ error });
    //         } else {
    //             const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //             const pageCondition = searchTerm;
    //             res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
    //         }
    //     });
    // });
    
    app.post('/api/qua-trinh/nghi-khong-luong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiKhongLuong.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/nghi-khong-luong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiKhongLuong.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/nghi-khong-luong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiKhongLuong.delete({ id: req.body.id }, (error) => res.send(error)));

};
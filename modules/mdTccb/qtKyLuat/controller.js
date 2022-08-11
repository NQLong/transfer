module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3006: { title: 'Quá trình kỷ luật', link: '/user/tccb/qua-trinh/ky-luat', icon: 'fa-ban', backgroundColor: '#B8492F', groupIndex: 3 },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            // 1007: { title: 'Kỷ luật', link: '/user/ky-luat', icon: 'fa-ban', backgroundColor: '#E36273', groupIndex: 2 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtKyLuat:read', menu },
        { name: 'qtKyLuat:write' },
        { name: 'qtKyLuat:delete' },
        { name: 'qtKyLuat:export' },
    );
    app.get('/user/tccb/qua-trinh/ky-luat/:id', app.permission.check('qtKyLuat:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/ky-luat', app.permission.check('qtKyLuat:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/ky-luat/group/:shcc', app.permission.check('qtKyLuat:read'), app.templates.admin);
    app.get('/user/ky-luat', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtKyLuatAll', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtKyLuat:read', 'qtKyLuat:write', 'qtKyLuat:delete', 'qtKyLuat:export');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtKyLuat.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKyLuat.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtKyLuat.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKyLuat.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtKyLuat.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/ky-luat/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.utils.stringify(req.query.filter);
        app.model.qtKyLuat.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/ky-luat/page/:pageNumber/:pageSize', app.permission.check('qtKyLuat:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.utils.stringify(req.query.filter);
        app.model.qtKyLuat.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/ky-luat/group/page/:pageNumber/:pageSize', app.permission.check('qtKyLuat:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.utils.stringify(req.query.filter);
        app.model.qtKyLuat.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/ky-luat/all', app.permission.check('qtKyLuat:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.ma) {
            condition = {
                statement: 'ma = :searchText',
                parameter: { searchText: req.query.ma },
            };
        }
        app.model.qtKyLuat.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/ky-luat/item/:id', app.permission.check('qtKyLuat:read'), (req, res) => {
        app.model.qtKyLuat.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/ky-luat', app.permission.check('qtKyLuat:write'), (req, res) => {
        app.model.qtKyLuat.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Kỷ luật');
            res.send({ error, item });
        });
    });

    app.post('/api/tccb/qua-trinh/ky-luat/create-multiple', app.permission.check('qtKyLuat:write'), (req, res) => {
        const { listShcc, lyDoHinhThuc, diemThiDua, noiDung, soQuyetDinh, ngayRaQuyetDinh } = req.body.data, errorList = [];
        const solve = (index = 0) => {
            if (index == listShcc.length) {
                app.tccbSaveCRUD(req.session.user.email, 'C', 'Kỷ luật');
                res.send({ error: errorList });
                return;
            }
            const shcc = listShcc[index];
            const dataAdd = {
                shcc, lyDoHinhThuc, diemThiDua, noiDung, soQuyetDinh, ngayRaQuyetDinh
            };
            app.model.qtKyLuat.create(dataAdd, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.put('/api/tccb/qua-trinh/ky-luat', app.permission.check('qtKyLuat:write'), (req, res) => {
        app.model.qtKyLuat.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Kỷ luật');
            res.send({ error, item });
        });
    });

    app.delete('/api/tccb/qua-trinh/ky-luat', app.permission.check('qtKyLuat:delete'), (req, res) => {
        app.model.qtKyLuat.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Kỷ luật');
            res.send({ error });
        });
    });

    app.get('/api/qua-trinh/ky-luat/download-excel/:filter', app.permission.check('qtKyLuat:export'), (req, res) => {
        app.model.qtKyLuat.download(req.params.filter, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('kyluat');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Học vị', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Đơn vị', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Hình thức kỷ luật', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Nội dung', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Số quyết định', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Ngày ra quyết định', bold: true, border: '1234' },
                        { cell: 'L1', value: 'Điểm thi đua', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.maCanBo });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenKyLuat });
                        cells.push({ cell: 'I' + (index + 2), alignment: 'center', border: '1234', value: item.noiDung });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.soQuyetDinh });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.ngayRaQuyetDinh ? app.date.dateTimeFormat(new Date(item.ngayRaQuyetDinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.diemThiDua });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'kyluat.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });
};

module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            9503: { title: 'Quá trình sáng kiến', link: '/user/tccb/qua-trinh/sang-kien', icon: 'fa fa-lightbulb-o', color: '#000000', backgroundColor: '#ffff19', groupIndex: 3 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1036: { title: 'Danh sách sáng kiến', link: '/user/sang-kien', icon: 'fa fa-lightbulb-o', color: '#000000', backgroundColor: '#ffff19', groupIndex: 2 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtSangKien:read', menu },
        { name: 'qtSangKien:write' },
        { name: 'qtSangKien:delete' },
    );
    app.get('/user/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:read'), app.templates.admin);
    app.get('/user/sang-kien', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    // End APIS -------------------------------------------------------------------------------------------------------------------------------------

    // TCCB APIs ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/sang-kien/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
            filter = JSON.stringify(req.query.filter || {});
        app.model.qtSangKien.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.delete({ id: req.body.id }, (error) => res.send(error)));

    // End TCCB APIs ---------------------------------------------------------------------------------------------------------------------------

    // User APIs -------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/user/qua-trinh/sang-kien', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtSangKien.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    }); 

    app.put('/api/user/qua-trinh/sang-kien', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtSangKien.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtSangKien.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/sang-kien', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtSangKien.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtSangKien.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/sang-kien/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
            filter = JSON.stringify(req.query.filter || {});
        app.model.qtSangKien.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    // End User APIs ---------------------------------------------------------------------------------------------------------------- 

    // Other APIs -------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/qua-trinh/sang-kien/download-excel/:listShcc/:listDonVi', app.permission.check('qtSangKien:read'), (req, res) => {
        console.log('lol------------');
        let { listShcc, listDonVi } = req.params ? req.params : { listShcc: null, listDonVi: null };
        if (listShcc == 'null') listShcc = null;
        if (listDonVi == 'null') listDonVi = null;
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let filter = { listShcc, listDonVi };
        try {
            filter = JSON.stringify(filter || {});
        } catch(error) {
            res.send({ error });
        }
        app.model.qtSangKien.downloadExcel(filter, searchTerm, (err, result) => {
            if (err) {
                res.send({ err });
            } else {
                console.log(result);
                const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('sangkien');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                        { cell: 'D1', value: 'ĐƠN VỊ CÔNG TÁC', bold: true, border: '1234' },
                        { cell: 'E1', value: 'BỘ MÔN', bold: true, border: '1234' },
                        { cell: 'F1', value: 'CHỨC VỤ CHÍNH', bold: true, border: '1234' },
                        { cell: 'G1', value: 'CHỨC DANH NGHỀ NGHIỆP', bold: true, border: '1234' },
                        { cell: 'H1', value: 'MÃ SỐ SÁNG KIẾN', bold: true, border: '1234' },
                        { cell: 'I1', value: 'TÊN SÁNG KIẾN', bold: true, border: '1234' },
                        { cell: 'J1', value: 'SỐ QUYẾT ĐỊNH', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoCanBo + ' ' + item.tenCanBo });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenBoMon});
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.maSo });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenSangKien });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.soQuyetDinh });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'sangkien.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
};

// End Other APIs --------------------------------------------------------------------------------------------------------------
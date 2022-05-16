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
    app.get('/user/tccb/qua-trinh/sang-kien/upload', app.permission.check('qtSangKien:write'), app.templates.admin);

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

    app.post('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) => {
        app.model.qtSangKien.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Sáng kiến');
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) => {
        app.model.qtSangKien.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Sáng kiến');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) => {
        app.model.qtSangKien.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Sáng kiến');
            res.send({ error });
        });
    });

    app.post('/api/tccb/qua-trinh/sang-kien/multiple', app.permission.check('qtSangKien:write'), (req, res) => {
        const qtSangKien = req.body.qtSangKien;

        let promises = qtSangKien ? qtSangKien.map(item => {
            return new Promise((resolve) => {
                app.model.qtSangKien.create(item, (error) => {
                    resolve(error);
                });
            });
        }) : [];

        Promise.all(promises).then(errorList => {
            res.send({ error: errorList.filter(error => error != null) });
        });
    });

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
    app.get('/api/qua-trinh/sang-kien/download-excel/:filter', app.permission.check('qtSangKien:read'), (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = req.params.filter;
        app.model.qtSangKien.downloadExcel(filter, searchTerm, (error, result) => {
            if (error) {
                res.send({ error });
            } else {
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
                        { cell: 'K1', value: 'CẤP ẢNH HƯỞNG', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoCanBo + ' ' + item.tenCanBo });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenBoMon });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.maSo });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenSangKien });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.soQuyetDinh });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.capAnhHuong == 1 ? 'Cấp bộ' : (item.capAnhHuong == 2 ? 'Cấp cơ sở' : '') });
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

    app.get('/api/qua-trinh/sang-kien/download-template', app.permission.check('qtSangKien:write'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Khen_thuong_Template');
        new Promise(resolve => {
            const defaultColumns = [
                { header: 'SỐ QUYẾT ĐỊNH', key: 'soQuyetDinh', width: 15 },
                { header: 'CÁN BỘ', key: 'shcc', width: 15 },
                { header: 'MÃ SỐ SÁNG KIẾN', key: 'maSo', width: 15 },
                { header: 'TÊN SÁNG KIẾN', key: 'tenSangKien', width: 30 },
                { header: 'CẤP ẢNH HƯỞNG \n (Nếu là cấp bộ thì điền 1, cấp cơ sở thì điền 2)', key: 'capAnhHuong', width: 30 },
            ];
            ws.columns = defaultColumns;
            resolve();
        }).then(() => {
            app.excel.attachment(workBook, res, 'Sang_Kien_Template.xlsx');
        }).catch((error) => {
            res.send({ error });
        });
    });

    const sangKienImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'SangKienDataFile' && files.SangKienDataFile && files.SangKienDataFile.length) {
                const srcPath = files.SangKienDataFile[0].path;
                const workbook = app.excel.create();
                workbook.xlsx.readFile(srcPath).then(() => {
                    app.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    worksheet ? resolve() : reject('File dữ liệu không hợp lệ!');
                });
            }
        }).then(() => {
            let items = [];
            const getData = (index = 2) => {
                let soQuyetDinh = (worksheet.getCell('A' + index).value || '').toString().trim();
                let shcc = (worksheet.getCell('B' + index).value || '').toString().trim();
                let maSo = (worksheet.getCell('C' + index).value || '').toString().trim();
                let tenSangKien = (worksheet.getCell('D' + index).value || '').toString().trim();
                let capAnhHuong = (worksheet.getCell('E' + index).value || '').toString().trim();

                if (soQuyetDinh.length == 0) {
                    done({ items });
                    return;
                }
                app.model.canBo.get({ shcc }, (error, item) => {
                    if (error || !item) {
                        done({ error: `Sai định dạng mã số cán bộ ở dòng ${index}` });
                        getData(index + 1);
                    }
                    let hoCanBo = item.ho;
                    let tenCanBo = item.ten;
                    items.push({
                        soQuyetDinh, maSo, tenSangKien, tenCanBo, hoCanBo, shcc, capAnhHuong
                    });
                    getData(index + 1);
                });
            };
            getData();
        }).catch(error => done({ error }));
    };

    app.uploadHooks.add('SangKienDataFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => sangKienImportData(fields, files, done), done, 'qtSangKien:write'));
};

// End Other APIs --------------------------------------------------------------------------------------------------------------
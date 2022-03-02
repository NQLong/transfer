module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.library,
        menus: {
            8001: { title: 'Sách, giáo trình', subTitle: 'Của cán bộ', link: '/user/library/sach-giao-trinh', icon: 'fa-book', backgroundColor: '#ccad2f', pin: true },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1006: { title: 'Sách, giáo trình', link: '/user/sach-giao-trinh', icon: 'fa-book', backgroundColor: '#ccad2f', groupIndex: 4 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'sachGiaoTrinh:read', menu },
        { name: 'sachGiaoTrinh:write' },
        { name: 'sachGiaoTrinh:delete' },
    );
    app.get('/user/library/sach-giao-trinh', app.permission.check('sachGiaoTrinh:read'), app.templates.admin);
    app.get('/user/library/sach-giao-trinh/group/:shcc', app.permission.check('sachGiaoTrinh:read'), app.templates.admin);
    app.get('/user/sach-giao-trinh', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.sachGiaoTrinh.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.sachGiaoTrinh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/sach-giao-trinh/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.sachGiaoTrinh.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
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

    app.get('/api/library/qua-trinh/sach-giao-trinh/page/:pageNumber/:pageSize', app.permission.check('sachGiaoTrinh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.sachGiaoTrinh.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/library/qua-trinh/sach-giao-trinh/group/page/:pageNumber/:pageSize', app.permission.check('sachGiaoTrinh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.sachGiaoTrinh.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.sachGiaoTrinh.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.sachGiaoTrinh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/sach-giao-trinh/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Sach_giao_trinh_Template');
        const defaultColumns = [
            { header: 'TÊN SÁCH', key: 'ten', width: 40 },
            { header: 'NHÀ XUẤT BẢN, ISBN', key: 'nhaSanXuat', width: 20 },
            { header: 'THỂ LOẠI', key: 'theLoai', width: 15 },
            { header: 'NĂM XUẤT BẢN (yyyy)', key: 'namSanXuat', width: 25 },
            { header: '(ĐỒNG) CHỦ BIÊN', key: 'chuBien', width: 20 },
            { header: 'SẢN PHẨM', key: 'sanPham', width: 15 },
            { header: 'BÚT DANH', key: 'butDanh', width: 15 },
            { header: 'PHẠM VI XUẤT BẢN', key: 'quocTe', width: 20, style: { numFmt: '@' } },
            { header: 'Ghi chú', key: 'ghiChu', width: 50 },

        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        ws.getCell('I2').value = 'Phạm vi trong nước: Nhập 0';
        ws.getCell('I3').value = 'Phạm vi quốc tế: Nhập 1';
        ws.getCell('I4').value = 'Phạm vi trong và ngoài nước: Nhập 2';
        app.excel.attachment(workBook, res, 'Sach_giao_trinh_Template.xlsx');
    });

    const sachGTImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'SGTDataFile' && files.SGTDataFile && files.SGTDataFile.length) {
                const srcPath = files.SGTDataFile[0].path;
                const workbook = app.excel.create();
                workbook.xlsx.readFile(srcPath).then(() => {
                    app.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    worksheet ? resolve() : reject('File dữ liệu không hợp lệ!');
                });
            }
        }).then(() => {
            let index = 1,
                items = [];
            while (true) {
                index++;
                let flag = worksheet.getCell('A' + index).value;
                if (flag) {
                    let ten = worksheet.getCell('A' + index).value ? worksheet.getCell('A' + index).value.toString().trim() : '',
                        nhaSanXuat = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '',
                        theLoai = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '',
                        namSanXuat = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString().trim() : '',
                        chuBien = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.toString().trim() : '',
                        sanPham = worksheet.getCell('F' + index).value ? worksheet.getCell('F' + index).value.toString().trim() : '',
                        butDanh = worksheet.getCell('G' + index).value ? worksheet.getCell('G' + index).value.toString().trim() : '',
                        quocTe = worksheet.getCell('H' + index).value ? worksheet.getCell('H' + index).value : '';
                    if (quocTe != '0' && quocTe != '1' && quocTe != '2') {
                        done({ error: 'Sai định dạng cột phạm vi xuất bản' });
                    }
                    else if (namSanXuat.length != 4) {
                        done({ error: 'Sai định dạng cột năm sản xuất' });
                    }
                    else items.push({ ten, nhaSanXuat, namSanXuat, chuBien, theLoai, sanPham, butDanh, quocTe: parseInt(quocTe) });
                } else {
                    done({ items });
                    break;
                }
            }

        }).catch(error => done({ error }));
    };

    app.uploadHooks.add('SGTDataFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => sachGTImportData(fields, files, done), done, 'staff:login'));
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9054: { title: 'Quá trình hướng dẫn luận văn', link: '/user/khcn/qua-trinh/hdlv', icon: 'fa-university', backgroundColor: '#488a37' },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1003: { title: 'Hướng dẫn luận văn', link: '/user/huong-dan-luan-van', icon: 'fa-university', backgroundColor: '#decf45', groupIndex: 4 },
        },
    };

    const menuTCCB = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3018: { title: 'Quá trình hướng dẫn luận văn', link: '/user/tccb/qua-trinh/hdlv', icon: 'fa-university', backgroundColor: '#488a37', groupIndex: 5 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtHuongDanLuanVan:read', menu },
        { name: 'qtHuongDanLuanVan:readOnly', menu: menuTCCB },
        { name: 'qtHuongDanLuanVan:write' },
        { name: 'qtHuongDanLuanVan:delete' },
    );
    app.get('/user/:khcn/qua-trinh/hdlv', app.permission.orCheck('qtHuongDanLuanVan:read', 'qtHuongDanLuanVan:readOnly'), app.templates.admin);
    app.get('/user/:khcn/qua-trinh/hdlv/group/:shcc', app.permission.orCheck('qtHuongDanLuanVan:read', 'qtHuongDanLuanVan:readOnly'), app.templates.admin);
    app.get('/user/huong-dan-luan-van', app.permission.check('staff:login'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);
    app.get('/api/user/qua-trinh/hdlv/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHuongDanLuanVan.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/qua-trinh/hdlv/page/:pageNumber/:pageSize', app.permission.orCheck('qtHuongDanLuanVan:read', 'qtHuongDanLuanVan:readOnly'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHuongDanLuanVan.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/qua-trinh/hdlv/group/page/:pageNumber/:pageSize', app.permission.orCheck('qtHuongDanLuanVan:read', 'qtHuongDanLuanVan:readOnly'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHuongDanLuanVan.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });


    app.get('/api/qua-trinh/hdlv/all', app.permission.orCheck('qtHuongDanLuanVan:read', 'qtHuongDanLuanVan:readOnly'), (req, res) => {
        app.model.qtHuongDanLuanVan.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/qua-trinh/hdlv', app.permission.check('qtHuongDanLuanVan:write'), (req, res) => {
        app.model.qtHuongDanLuanVan.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hướng dẫn luận văn');
            res.send({ error, item });
        });
    });

    app.put('/api/qua-trinh/hdlv', app.permission.check('qtHuongDanLuanVan:write'), (req, res) => {
        app.model.qtHuongDanLuanVan.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hướng dẫn luận văn');
            res.send({ error, item });
        });
    });
    app.delete('/api/qua-trinh/hdlv', app.permission.check('qtHuongDanLuanVan:write'), (req, res) => {
        app.model.qtHuongDanLuanVan.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hướng dẫn luận văn');
            res.send({ error });
        });
    });

    app.post('/api/user/qua-trinh/hdlv', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtHuongDanLuanVan.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/hdlv', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHuongDanLuanVan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtHuongDanLuanVan.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/hdlv', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHuongDanLuanVan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtHuongDanLuanVan.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    const qtHDLVImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'HDLVDataFile' && files.HDLVDataFile && files.HDLVDataFile.length) {
                const srcPath = files.HDLVDataFile[0].path;
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
                    let hoTen = worksheet.getCell('A' + index).value ? worksheet.getCell('A' + index).value.toString().trim() : '',
                        tenLuanVan = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '',
                        bacDaoTao = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '',
                        namTotNghiep = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString() : '',
                        sanPham = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.toString().trim() : '';
                    if (namTotNghiep.length != 4) {
                        done({ error: 'Sai định dạng cột năm tốt nghiệp' });
                    }
                    else items.push({ hoTen, tenLuanVan, bacDaoTao, namTotNghiep, sanPham });
                } else {
                    done({ items });
                    break;
                }
            }

        }).catch(error => done({ error }));
    };

    app.uploadHooks.add('HDLVDataFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => qtHDLVImportData(fields, files, done), done, 'staff:login'));

    app.get('/api/qua-trinh/hdlv/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Qua_trinh_HDLV_Template');
        const defaultColumns = [
            { header: 'HỌ VÀ TÊN SINH VIÊN', key: 'hoTen', width: 40 },
            { header: 'TÊN LUẬN VĂN/LUẬN ÁN', key: 'tenLuanVan', width: 40 },
            { header: 'BẬC ĐÀO TẠO', key: 'bacDaoTao', width: 20 },
            { header: 'NĂM TỐT NGHIỆP (yyyy)', key: 'namTotNghiep', width: 30 },
            { header: 'SẢN PHẨM', key: 'sanPham', width: 20 },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        app.excel.attachment(workBook, res, 'Qua_trinh_HDLV_Template.xlsx');
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3033: { title: 'Quá trình học tập, công tác', link: '/user/tccb/qua-trinh/hoc-tap-cong-tac', icon: 'fa-calendar', backgroundColor: '#30a17f', groupIndex: 5 },
        },
    };
    // const menuStaff = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1012: { title: 'Học tập, công tác', subTitle: 'Tiểu sử', link: '/user/hoc-tap-cong-tac', icon: 'fa-calendar', backgroundColor: '#fb8f04', groupIndex: 0 },
    //     },
    // };

    app.permission.add(
        // { name: 'staff:login', menu: menuStaff },
        { name: 'qtHocTapCongTac:read', menu },
        { name: 'qtHocTapCongTac:write' },
        { name: 'qtHocTapCongTac:delete' },
    );
    app.get('/user/tccb/qua-trinh/hoc-tap-cong-tac', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hoc-tap-cong-tac/group/:shcc', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);
    app.get('/user/hoc-tap-cong-tac', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/hoc-tap-cong-tac', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtHocTapCongTac.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/hoc-tap-cong-tac', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHocTapCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtHocTapCongTac.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/hoc-tap-cong-tac', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHocTapCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtHocTapCongTac.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/hoc-tap-cong-tac/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtHocTapCongTac.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/hoc-tap-cong-tac/page/:pageNumber/:pageSize', app.permission.check('qtHocTapCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtHocTapCongTac.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hoc-tap-cong-tac/group/page/:pageNumber/:pageSize', app.permission.check('qtHocTapCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtHocTapCongTac.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/htct', app.permission.check('qtHocTapCongTac:write'), (req, res) => {
        app.model.qtHocTapCongTac.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Học tập công tác');
            res.send({ error, item });
        });
    });

    app.put('/api/qua-trinh/htct', app.permission.check('qtHocTapCongTac:write'), (req, res) => {
        app.model.qtHocTapCongTac.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Học tập công tác');
            res.send({ error, item });
        });
    });
    app.delete('/api/qua-trinh/htct', app.permission.check('qtHocTapCongTac:write'), (req, res) => {
        app.model.qtHocTapCongTac.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Học tập công tác');
            res.send({ error });
        });
    });

    app.post('/api/user/qua-trinh/htct', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtHocTapCongTac.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/htct', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHocTapCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtHocTapCongTac.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/htct', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHocTapCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtHocTapCongTac.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    const qtHTCTImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'HTCTDataFile' && files.HTCTDataFile && files.HTCTDataFile.length) {
                const srcPath = files.HTCTDataFile[0].path;
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
                    let noiDung = worksheet.getCell('A' + index).value ? worksheet.getCell('A' + index).value.toString().trim() : '',
                        batDau = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '',
                        ketThuc = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '';
                    if (ketThuc == '') {
                        ketThuc = -1;
                    }
                    if (batDau.length != 4) {
                        done({ error: 'Sai định dạng cột bắt đầu' });
                    }
                    else if (ketThuc.length != 4 && ketThuc != -1) {
                        done({ error: 'Sai định dạng cột kết thúc' });
                    }
                    else items.push({ noiDung, batDau, ketThuc, batDauType: 'yyyy', ketThucType: 'yyyy' });


                } else {
                    done({ items });
                    break;
                }
            }

        }).catch(error => done({ error }));
    };

    app.get('/api/qua-trinh/hoc-tap-cong-tac/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Qua_trinh_HTCT_Template');
        const defaultColumns = [
            { header: 'NỘI DUNG', key: 'noiDung', width: 50 },
            { header: 'BẮT ĐẦU (yyyy)', key: 'batDau', width: 20 },
            { header: 'KẾT THÚC (yyyy)', key: 'ketThuc', width: 20 },
            { header: 'Ghi chú', key: 'ghiChu', width: 20 },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        ws.getCell('D2').value = 'NỘI DUNG bao gồm nơi học tập, công tác; tên đơn vị; chức vụ (nếu có); chức danh nghề nghiệp (nếu có)';
        ws.getCell('D3').value = 'Nếu đang công tác tại đơn vị, để trống ô KẾT THÚC';
        app.excel.attachment(workBook, res, 'Qua_trinh_HTCT_Template.xlsx');
    });

    app.uploadHooks.add('HTCTDataFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => qtHTCTImportData(fields, files, done), done, 'staff:login'));

};
module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.khcn,
    //     menus: {
    //         9501: { title: 'Quá trình nghiên cứu khoa học', link: '/user/khcn/qua-trinh/nghien-cuu-khoa-hoc', icon: 'fa-wpexplorer', backgroundColor: '#f03a88', groupIndex: 5 },
    //     },
    // };

    const menuTCCB = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3013: { title: 'Quá trình nghiên cứu khoa học', link: '/user/tccb/qua-trinh/nghien-cuu-khoa-hoc', icon: 'fa-wpexplorer', backgroundColor: '#1999C2', groupIndex: 5 },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9501: { title: 'Nghiên cứu khoa học', link: '/user/nghien-cuu-khoa-hoc', icon: 'fa-wpexplorer', backgroundColor: '#1999C2' },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu },
        { name: 'qtNghienCuuKhoaHoc:readOnly', menu: menuTCCB },
        { name: 'qtNghienCuuKhoaHoc:read', menu },
        { name: 'qtNghienCuuKhoaHoc:write' },
        { name: 'qtNghienCuuKhoaHoc:delete' },
    );

    app.get('/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/:id', app.permission.check('qtNghienCuuKhoaHoc:readOnly'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghien-cuu-khoa-hoc', app.permission.check('qtNghienCuuKhoaHoc:readOnly'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/group/:shcc', app.permission.check('qtNghienCuuKhoaHoc:readOnly'), app.templates.admin);

    app.get('/user/nghien-cuu-khoa-hoc', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/nghien-cuu-khoa-hoc/:id/:ownerShcc', app.permission.check('staff:login'), app.templates.admin);
    // Hook ready -----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyQtNghienCuuKhoaHoc', {
        ready: () => app.database.oracle.connected && app.model && app.model.qtNghienCuuKhoaHoc,
        run: () => app.model.qtNghienCuuKhoaHoc.count((error, number) => {
            if (error == null) {
                number = Number(number);
                app.model.setting.setValue({ number: isNaN(number) ? 0 : number });
            }
        }),
    });
    // const checkReadPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('qtNghienCuuKhoaHoc:read', 'qtNghienCuuKhoaHoc:readOnly', 'staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, loaiHocVi, maSoCanBo, timeType, maDonVi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, maSoCanBo: null, loaiHocVi: null, timeType: 0, maDonVi: null };
        app.model.qtNghienCuuKhoaHoc.searchPage(pageNumber, pageSize, searchTerm, maSoCanBo, loaiHocVi, fromYear, toYear, timeType, maDonVi, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/group/page/:pageNumber/:pageSize', app.permission.orCheck('qtNghienCuuKhoaHoc:read', 'qtNghienCuuKhoaHoc:readOnly'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, loaiHocVi, maSoCanBo, timeType, maDonVi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, maSoCanBo: null, loaiHocVi: null, timeType: 0, maDonVi: null };
        app.model.qtNghienCuuKhoaHoc.groupPage(pageNumber, pageSize, searchTerm, maSoCanBo, loaiHocVi, fromYear, toYear, timeType, maDonVi, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/khcn/qua-trinh/nghien-cuu-khoa-hoc/all', app.permission.orCheck('qtNghienCuuKhoaHoc:read', 'qtNghienCuuKhoaHoc:readOnly'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc },
            };
        }
        app.model.qtNghienCuuKhoaHoc.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/qua-trinh/nckh', app.permission.check('qtNghienCuuKhoaHoc:write'), (req, res) => {
        app.model.qtNghienCuuKhoaHoc.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Nghiên cứu khoa học');
            res.send({ error, item });
        });
    });

    app.post('/api/qua-trinh/nckh/create-multiple', app.permission.check('qtNghienCuuKhoaHoc:write'), (req, res) => {
        const { listShcc, batDau, ketThuc, batDauType, ketThucType, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ketQua, ngayNghiemThu, ngayNghiemThuType } = req.body.data, errorList = [];
        const solve = (index = 0) => {
            if (index == listShcc.length) {
                app.tccbSaveCRUD(req.session.user.email, 'C', 'Nghiên cứu khoa học');
                res.send({ error: errorList });
                return;
            }
            const shcc = listShcc[index];
            const dataAdd = {
                shcc, batDau, ketThuc, batDauType, ketThucType, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ketQua, ngayNghiemThu, ngayNghiemThuType
            };
            app.model.qtNghienCuuKhoaHoc.create(dataAdd, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.put('/api/qua-trinh/nckh', app.permission.check('qtNghienCuuKhoaHoc:write'), (req, res) => {
        app.model.qtNghienCuuKhoaHoc.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Nghiên cứu khoa học');
            res.send({ error, item });
        });
    });
    app.delete('/api/qua-trinh/nckh', app.permission.check('qtNghienCuuKhoaHoc:write'), (req, res) => {
        app.model.qtNghienCuuKhoaHoc.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Nghiên cứu khoa học');
            res.send({ error });
        });
    });

    app.get('/api/qua-trinh/nckh/download-excel/:maDonVi/:fromYear/:toYear/:loaiHocVi/:maSoCanBo/:timeType', app.permission.orCheck('qtNghienCuuKhoaHoc:read', 'qtNghienCuuKhoaHoc:readOnly'), (req, res) => {
        let { maDonVi, fromYear, toYear, loaiHocVi, maSoCanBo, timeType } = req.params ? req.params : { maDonVi: '', fromYear: null, toYear: null, loaiHocVi: '', maSoCanBo: '', timeType: 0 };
        if (maDonVi == 'null') maDonVi = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (loaiHocVi == 'null') loaiHocVi = null;
        if (maSoCanBo == 'null') maSoCanBo = null;
        app.model.qtNghienCuuKhoaHoc.downloadExcel(maSoCanBo, loaiHocVi, fromYear, toYear, timeType, maDonVi, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('NCKH');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ và tên cán bộ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên đề tài', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Mã số và cấp quản lý', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Bắt đầu', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Kết thúc', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Nghiệm thu', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Vai trò', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Kết quả', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoTen = item.hoCanBo + ' ' + item.tenCanBo;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenDeTai });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.maSoCapQuanLy });
                        cells.push({ cell: 'F' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'G' + (index + 2), alignment: 'center', border: '1234', value: item.ketThuc != null ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'H' + (index + 2), alignment: 'center', border: '1234', value: item.ngayNghiemThu ? app.date.dateTimeFormat(new Date(item.ngayNghiemThu), item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.vaiTro ? item.vaiTro : '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.ketQua ? item.ketQua : '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'NCKH.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });

    // User API  -----------------------------------------------------------------------------------------------
    app.get('/api/user/qua-trinh/nckh', app.permission.check('staff:login'), (req, res) => {
        app.model.qtNghienCuuKhoaHoc.userPage(req.session.user.email.trim(), (error, items) => {
            if (error || items == null) {
                res.send({ error });
            } else {
                res.send({ items: items.rows });
            }
        });
    });

    app.post('/api/user/qua-trinh/nckh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNghienCuuKhoaHoc.create(data, async (error, item) => {
                //TO_DO: Delete /new Insert /ID

                // if (!error && item) {
                //     if (item.fileMinhChung && JSON.parse(item.fileMinhChung).length > 0) {
                //         new Promise(resolve => {
                //             JSON.parse(item.fileMinhChung).map(file => {
                //                 app.fs.rename(app.assetPath + '/deTaiNCKH/new/' + file, app.assetPath + '/deTaiNCKH/' + item.id + '/' + file, (err) => {
                //                     if (err) {
                //                         res.send({ errorFile: err });
                //                     }
                //                 });
                //             });
                //             resolve();
                //         }).then(() => {
                //             JSON.parse(item.fileMinhChung).map(file => app.deleteFile(app.assetPath + '/deTaiNCKH/new' + file));
                //             const folderPath = app.assetPath + '/deTaiNCKH/new';
                //             if (app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath).length == 0) app.fs.rmdirSync(folderPath);
                //         });
                //     }
                // }
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nckh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNghienCuuKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNghienCuuKhoaHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nckh', app.permission.check('staff:login'), (req, res) => {
        app.model.qtNghienCuuKhoaHoc.get({ shcc: req.body.shcc, id: req.body.id }, (error, item) => {
            if (!error && item) {
                if (item.fileMinhChung && JSON.parse(item.fileMinhChung).length > 0) {
                    JSON.parse(item.fileMinhChung).map(file => app.deleteFile(app.assetPath + '/deTaiNCKH' + file));
                    const folderPath = app.assetPath + '/deTaiNCKH/' + item.id;
                    if (app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath).length == 0) app.fs.rmdirSync(folderPath);
                }
                app.model.qtNghienCuuKhoaHoc.delete({ shcc: req.body.shcc, id: req.body.id }, e => {
                    res.send({ error: e });
                });
            }
        });
    });

    app.get('/api/user/qua-trinh/nckh/item/:id/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtNghienCuuKhoaHoc.get({ id: req.params.id, shcc: req.params.shcc }, (error, item) => res.send({ error, item }));
    });

    // const qtNCKHImportData = (fields, files, done) => {
    //     let worksheet = null;
    //     new Promise((resolve, reject) => {
    //         if (fields.userData && fields.userData[0] && fields.userData[0] == 'NCKHDataFile' && files.NCKHDataFile && files.NCKHDataFile.length) {
    //             const srcPath = files.NCKHDataFile[0].path;
    //             const workbook = app.excel.create();
    //             workbook.xlsx.readFile(srcPath).then(() => {
    //                 app.deleteFile(srcPath);
    //                 worksheet = workbook.getWorksheet(1);
    //                 worksheet ? resolve() : reject('File dữ liệu không hợp lệ!');
    //             });
    //         }
    //     }).then(() => {
    //         let index = 1,
    //             items = [];
    //         while (true) {
    //             index++;
    //             let flag = worksheet.getCell('A' + index).value;
    //             if (flag) {
    //                 let tenDeTai = worksheet.getCell('A' + index).value ? worksheet.getCell('A' + index).value.toString().trim() : '',
    //                     maSoCapQuanLy = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '',
    //                     vaiTro = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '',
    //                     batDau = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value : '',
    //                     batDauType = worksheet.getCell('D' + index).value ? 'mm/yyyy' : '',
    //                     ketThuc = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value : '',
    //                     ketThucType = worksheet.getCell('E' + index).value ? 'mm/yyyy' : '',
    //                     ngayNghiemThu = worksheet.getCell('F' + index).value ? worksheet.getCell('F' + index).value : '',
    //                     ngayNghiemThuType = worksheet.getCell('F' + index).value ? 'mm/yyyy' : '',
    //                     kinhPhi = worksheet.getCell('G' + index).value ? worksheet.getCell('G' + index).value.toString().trim() : '',
    //                     ketQua = worksheet.getCell('H' + index).value ? worksheet.getCell('H' + index).value.toString().trim() : '';
    //                 if (isNaN(Date.parse(batDau))) {
    //                     done({ error: 'Sai định dạng cột bắt đầu' });
    //                 }
    //                 else if (isNaN(Date.parse(ketThuc))) {
    //                     done({ error: 'Sai định dạng cột kết thúc' });
    //                 }
    //                 else if (isNaN(Date.parse(ngayNghiemThu))) {
    //                     done({ error: 'Sai định dạng cột nghiệm thu' });
    //                 }
    //                 else items.push({ tenDeTai, maSoCapQuanLy, vaiTro, batDau, batDauType, ketThuc, ketThucType, ngayNghiemThu, ngayNghiemThuType, kinhPhi, ketQua });
    //             } else {
    //                 done({ items });
    //                 break;
    //             }
    //         }

    //     }).catch(error => done({ error }));
    // };

    // app.uploadHooks.add('NCKHDataFile', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => qtNCKHImportData(fields, files, done), done, 'staff:login'));

    // app.get('/api/qua-trinh/nghien-cuu-khoa-hoc/download-template', app.permission.check('staff:login'), (req, res) => {
    //     const workBook = app.excel.create();
    //     const ws = workBook.addWorksheet('Qua_trinh_NCKH_Template');
    //     const defaultColumns = [
    //         { header: 'TÊN ĐỀ TÀI', key: 'tenDeTai', width: 40 },
    //         { header: 'MÃ SỐ VÀ CẤP QUẢN LÝ', key: 'maSoCapQuanLy', width: 30 },
    //         { header: 'VAI TRÒ', key: 'vaiTro', width: 15 },
    //         { header: 'BẮT ĐẦU (mm/yyyy)', key: 'batDau', width: 20, style: { numFmt: 'mm/yyyy' } },
    //         { header: 'KẾT THÚC (mm/yyyy)', key: 'ketThuc', width: 20, style: { numFmt: 'mm/yyyy' } },
    //         { header: 'NGHIỆM THU (mm/yyyy)', key: 'ngayNghiemThu', width: 20, style: { numFmt: 'mm/yyyy' } },
    //         { header: 'KINH PHÍ', key: 'kinhPhi', width: 15 },
    //         { header: 'KẾT QUẢ', key: 'ketQua', width: 15 },
    //     ];
    //     ws.columns = defaultColumns;
    //     ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
    //     app.excel.attachment(workBook, res, 'Qua_trinh_NCKH_Template.xlsx');
    // });

    //Upload File
    // app.createFolder(app.path.join(app.assetPath, '/khcnDetaiNckh'));

    app.createFolder(app.path.join(app.assetPath, '/deTaiNCKH'));


    app.get('/api/khcn/download/:id/:fileName', app.permission.check('staff:login'), (req, res) => {
        const { id, fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/deTaiNCKH/${id}`);

        if (app.fs.existsSync(dir)) {
            const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
            for (const serverFileName of serverFileNames) {
                const clientFileIndex = serverFileName.indexOf(fileName);
                if (clientFileIndex !== -1 && serverFileName.slice(clientFileIndex) === fileName) {
                    return res.sendFile(app.path.join(dir, serverFileName));
                }
            }
        }

        res.status(400).send('Không tìm thấy tập tin');
    });

    app.uploadHooks.add('deTaiNCKHStaffFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => deTaiNCKHStaffFile(req, fields, files, params, done), done, 'staff:login'));

    const deTaiNCKHStaffFile = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('DeTaiNCKHStaffFile') && files.deTaiNCKHStaffFile && files.deTaiNCKHStaffFile.length > 0) {
            const user = req.session.user,
                srcPath = files.deTaiNCKHStaffFile[0].path,
                filePath = (fields.userData[0].substring(19) != 'new' ? '/' + fields.userData[0].substring(19) : '/new') + '/' + user.shcc + '_' + (new Date().getTime()).toString() + '_' + files.deTaiNCKHStaffFile[0].originalFilename,
                destPath = app.assetPath + '/deTaiNCKH' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.createFolder(
                    app.path.join(app.assetPath, '/deTaiNCKH/' + (fields.userData[0].substring(19) != 'new' ? '/' + fields.userData[0].substring(19) : '/new'))
                );
                app.fs.rename(srcPath, destPath, error => {
                    if (error) {
                        done({ error });
                    } else {
                        done({ data: filePath });
                    }
                });
            }
        }
    };

    //Delete file
    app.put('/api/khcn/de-tai-nckh/delete-file', app.permission.check('staff:login'), (req, res) => {
        const id = req.body.id,
            shcc = req.body.shcc,
            index = req.body.index,
            file = req.body.file;
        app.model.qtNghienCuuKhoaHoc.get({ id: id, shcc: shcc }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item && item.fileMinhChung) {
                let newList = JSON.parse(item.fileMinhChung);
                app.deleteFile(app.assetPath + '/deTaiNCKH' + newList[index]);
                newList.splice(index, 1);
                app.model.qtNghienCuuKhoaHoc.update(id, { fileMinhChung: JSON.stringify(newList) }, (error, qtNghienCuuKhoaHoc) => {
                    res.send({ error, qtNghienCuuKhoaHoc });
                });
            } else {
                const filePath = app.path.join(app.assetPath, '/deTaiNCKH', file);
                if (app.fs.existsSync(filePath)) {
                    app.deleteFile(filePath);
                    res.send({ error: null });
                } else {
                    res.send({ error: 'Không tìm thấy đề tài' });
                }
            }
        });
    });
};

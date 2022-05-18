module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3042: { title: 'Quá trình Đi nước ngoài', link: '/user/tccb/qua-trinh/di-nuoc-ngoai', icon: 'fa-globe', backgroundColor: '#4297ff', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1003: { title: 'Đi nước ngoài', subTitle: 'Công tác, đào tạo, du lịch, ...', link: '/user/di-nuoc-ngoai', icon: 'fa-globe', backgroundColor: '#4297ff', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtDiNuocNgoai:read', menu },
        { name: 'qtDiNuocNgoai:write' },
        { name: 'qtDiNuocNgoai:delete' },
    );
    app.get('/user/tccb/qua-trinh/di-nuoc-ngoai', app.permission.check('qtDiNuocNgoai:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/di-nuoc-ngoai/group/:shcc', app.permission.check('qtDiNuocNgoai:read'), app.templates.admin);
    app.get('/user/di-nuoc-ngoai', app.permission.check('staff:login'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/di-nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtDiNuocNgoai.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/di-nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtDiNuocNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtDiNuocNgoai.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/di-nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtDiNuocNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtDiNuocNgoai.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/di-nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtDiNuocNgoai.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/di-nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('qtDiNuocNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtDiNuocNgoai.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/di-nuoc-ngoai/group/page/:pageNumber/:pageSize', app.permission.check('qtDiNuocNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtDiNuocNgoai.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/di-nuoc-ngoai', app.permission.check('qtDiNuocNgoai:write'), (req, res) => {
        app.model.qtDiNuocNgoai.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Đi nước ngoài');
            res.send({ error, item });
        });
    });

    app.post('/api/qua-trinh/di-nuoc-ngoai-multiple', app.permission.check('qtDiNuocNgoai:write'), (req, res) => {
        let errorList = [];
        const solve = (index = 0) => {
            if (index >= req.body.data.listShcc.length) {
                app.tccbSaveCRUD(req.session.user.email, 'C', 'Đi nước ngoài');
                res.send({ errorList });
                return;
            }
            const shcc = req.body.data.listShcc[index];
            let data = req.body.data;
            data.shcc = shcc;
            app.model.qtDiNuocNgoai.create(req.body.data, (error, item) => {
                if (error || item == null) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.put('/api/qua-trinh/di-nuoc-ngoai', app.permission.check('qtDiNuocNgoai:write'), (req, res) => {
        app.model.qtDiNuocNgoai.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Đi nước ngoài');
            res.send({ error, item });
        });
    });

    app.delete('/api/qua-trinh/di-nuoc-ngoai', app.permission.check('qtDiNuocNgoai:write'), (req, res) => {
        app.model.qtDiNuocNgoai.get({ id: req.body.id }, (error, item) => {
            if (error || item == null) {
                res.send({ error });
            } else {
                if (item.baoCaoTen && app.parse(item.baoCaoTen, []).length > 0) {
                    app.parse(item.baoCaoTen, []).forEach(file => app.deleteFile(app.assetPath + '/baoCaoDiNuocNgoai' + file));
                    const folderPath = app.assetPath + '/baoCaoDiNuocNgoai/' + item.shcc;
                    if (app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath).length == 0) app.fs.rmdirSync(folderPath);
                }
                app.model.qtDiNuocNgoai.delete({ id: req.body.id }, (error) => {
                    app.tccbSaveCRUD(req.session.user.email, 'D', 'Đi nước ngoài');
                    res.send({ error });
                });
            }
        });
    });

    app.get('/api/qua-trinh/di-nuoc-ngoai/download-excel/:filter/:searchTerm', app.permission.check('qtDiNuocNgoai:read'), (req, res) => {
        let searchTerm = req.params.searchTerm;
        if (searchTerm == 'null') searchTerm = '';
        app.model.qtDiNuocNgoai.download(req.params.filter, searchTerm, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('dinuocngoai');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'NGÀY QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'SỐ QĐ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'F1', value: 'HỌ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'TÊN', bold: true, border: '1234' },
                        { cell: 'H1', value: 'GIỚI TÍNH', bold: true, border: '1234' },
                        { cell: 'I1', value: 'NGÀY SINH', bold: true, border: '1234' },
                        { cell: 'J1', value: 'CHỨC DANH NGHỀ NGHIỆP', bold: true, border: '1234' },
                        { cell: 'K1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NƯỚC ĐẾN', bold: true, border: '1234' },
                        { cell: 'N1', value: 'VIẾT TẮT', bold: true, border: '1234' },
                        { cell: 'O1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'P1', value: 'NGÀY ĐI', bold: true, border: '1234' },
                        { cell: 'Q1', value: 'NGÀY VỀ', bold: true, border: '1234' },
                        { cell: 'R1', value: 'CHI PHÍ', bold: true, border: '1234' },
                        { cell: 'S1', value: 'GHI CHÚ', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.ngayQuyetDinh ? app.date.dateTimeFormat(new Date(item.ngayQuyetDinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.soQuyetDinh });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.phai == '01' ? 'Nam' : 'Nữ' });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.danhSachQuocGia });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.tenMucDich });
                        cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.noiDung });
                        cells.push({ cell: 'P' + (index + 2), alignment: 'center', border: '1234', value: item.ngayDi ? app.date.dateTimeFormat(new Date(item.ngayDi), item.ngayDiType ? item.ngayDiType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'Q' + (index + 2), alignment: 'center', border: '1234', value: (item.ngayVe != null && item.ngayVe != -1) ? app.date.dateTimeFormat(new Date(item.ngayVe), item.ngayVeType ? item.ngayVeType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'R' + (index + 2), border: '1234', value: item.chiPhi });
                        cells.push({ cell: 'S' + (index + 2), border: '1234', value: item.ghiChu });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'dinuocngoai.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
    app.get('/api/qua-trinh/tiep-nhan-ve-nuoc/download-excel/:filter/:searchTerm', app.permission.check('qtDiNuocNgoai:read'), (req, res) => {
        let searchTerm = req.params.searchTerm;
        if (searchTerm == 'null') searchTerm = '';
        app.model.qtDiNuocNgoai.download(req.params.filter, searchTerm, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('DANH SACH VE NUOC');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc }

                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'NGÀY QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'SỐ QĐ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'F1', value: 'HỌ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'TÊN', bold: true, border: '1234' },
                        { cell: 'H1', value: 'GIỚI TÍNH', bold: true, border: '1234' },
                        { cell: 'I1', value: 'NGÀY SINH', bold: true, border: '1234' },
                        { cell: 'J1', value: 'CHỨC DANH NGHỀ NGHIỆP', bold: true, border: '1234' },
                        { cell: 'K1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NƯỚC ĐẾN', bold: true, border: '1234' },
                        { cell: 'N1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'O1', value: 'NGÀY VỀ', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.ngayQdTiepNhan ? app.date.dateTimeFormat(new Date(item.ngayQdTiepNhan), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.soQdTiepNhan });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.phai == '01' ? 'Nam' : 'Nữ' });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.danhSachQuocGia });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.tenNoiDungTiepNhan });
                        cells.push({ cell: 'O' + (index + 2), alignment: 'center', border: '1234', value: item.ngayVeNuoc ? app.date.dateTimeFormat(new Date(item.ngayVeNuoc), 'dd/mm/yyyy') : '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'DANH SACH VE NUOC.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/di-nuoc-ngoai/thong-ke-muc-dich', app.permission.orCheck('qtDiNuocNgoai:read', 'staff:login'), (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtDiNuocNgoai.download(filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                res.send({ error, items: page.rows });
            }
        });
    });

    app.get('/api/di-nuoc-ngoai/download/:shcc/:fileName', app.permission.orCheck('qtDiNuocNgoai:read', 'staff:login'), (req, res) => {
        const { shcc, fileName } = req.params;
        const dir = app.path.join(app.assetPath, `/baoCaoDiNuocNgoai/${shcc}`);

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

    app.createFolder(app.path.join(app.assetPath, '/baoCaoDiNuocNgoai'));

    app.uploadHooks.add('baoCaoDiNuocNgoaiStaffFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => baoCaoDiNuocNgoaiStaffFile(req, fields, files, params, done), done, 'staff:login'));

    const baoCaoDiNuocNgoaiStaffFile = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('baoCaoDiNuocNgoaiStaffFile') && files.baoCaoDiNuocNgoaiStaffFile && files.baoCaoDiNuocNgoaiStaffFile.length > 0) {
            const srcPath = files.baoCaoDiNuocNgoaiStaffFile[0].path,
                shcc = fields.userData[0].substring('baoCaoDiNuocNgoaiStaffFile'.length + 1),
                originalFilename = files.baoCaoDiNuocNgoaiStaffFile[0].originalFilename,
                filePath = '/' + shcc + '/' + (new Date().getTime()).toString() + '_' + originalFilename,
                destPath = app.assetPath + '/baoCaoDiNuocNgoai' + filePath,
                validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg'],
                baseNamePath = app.path.extname(srcPath);
            if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                done({ error: 'Định dạng tập tin không hợp lệ!' });
                app.deleteFile(srcPath);
            } else {
                app.createFolder(
                    app.path.join(app.assetPath, '/baoCaoDiNuocNgoai/' + shcc)
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
    app.put('/api/qua-trinh/di-nuoc-ngoai/delete-file', app.permission.orCheck('qtDiNuocNgoai:write', 'staff:login'), (req, res) => {
        const shcc = req.body.shcc,
            file = req.body.file;
        const filePath = app.path.join(app.assetPath, '/baoCaoDiNuocNgoai', file);
        if (app.fs.existsSync(filePath)) {
            app.deleteFile(filePath, () => {
                const folderPath = app.assetPath + '/baoCaoDiNuocNgoai/' + shcc;
                if (app.fs.existsSync(folderPath) && app.fs.readdirSync(folderPath).length == 0) app.fs.rmdirSync(folderPath);
                res.send({ error: null });
            });
        } else {
            res.send({ error: 'Không tìm thấy đề tài' });
        }
    });
};

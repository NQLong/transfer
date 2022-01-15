module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3021: { title: 'Quá trình nghiên cứu khoa học', link: '/user/tccb/qua-trinh/nghien-cuu-khoa-hoc', icon: 'fa-wpexplorer', backgroundColor: '#f03a88', groupIndex: 4 },
        },
    };
    app.permission.add(
        { name: 'qtNghienCuuKhoaHoc:read', menu },
        { name: 'qtNghienCuuKhoaHoc:write' },
        { name: 'qtNghienCuuKhoaHoc:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/:id', app.permission.check('qtNghienCuuKhoaHoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghien-cuu-khoa-hoc', app.permission.check('qtNghienCuuKhoaHoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/group_nckh/:loaiDoiTuong/:ma', app.permission.check('qtNghienCuuKhoaHoc:read'), app.templates.admin);

    // Hook ready -----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyQtNghienCuuKhoaHoc', {
        ready: () => app.dbConnection && app.model && app.model.qtNghienCuuKhoaHoc,
        run: () => app.model.qtNghienCuuKhoaHoc.count((error, number) => {
            if (error == null) {
                number = Number(number);
                app.model.setting.setValue({ number: isNaN(number) ? 0 : number });
            }
        }),
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/nghien-cuu-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('qtNghienCuuKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            mscb = req.query.mscb ? req.query.mscb : '',
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { maDonVi, fromYear, toYear, loaiHocVi, maSoCanBo } = req.query.filter ? req.query.filter : { maDonVi: '', fromYear: null, toYear: null, loaiHocVi: '', maSoCanBo: '' };
        const filter = `%${fromYear ? fromYear : ''}%${toYear ? toYear : ''}%${loaiHocVi ? loaiHocVi : ''}%${maDonVi ? maDonVi : ''}%${maSoCanBo ? maSoCanBo : ''}%%`;
        app.model.qtNghienCuuKhoaHoc.searchPage(pageNumber, pageSize, searchTerm, mscb, filter, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghien-cuu-khoa-hoc/group/page/:pageNumber/:pageSize', app.permission.check('qtNghienCuuKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            mscb = req.query.mscb ? req.query.mscb : '',
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { maDonVi, fromYear, toYear, loaiHocVi, maSoCanBo } = req.query.filter ? req.query.filter : { maDonVi: '', fromYear: null, toYear: null, loaiHocVi: '', maSoCanBo: '' };
        const filter = `%${fromYear ? fromYear : ''}%${toYear ? toYear : ''}%${loaiHocVi ? loaiHocVi : ''}%${maDonVi ? maDonVi : ''}%${maSoCanBo ? maSoCanBo : ''}%%`;
        app.model.qtNghienCuuKhoaHoc.groupPage(pageNumber, pageSize, searchTerm, mscb, filter, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghien-cuu-khoa-hoc/group_nckh/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtNghienCuuKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtNghienCuuKhoaHoc.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.post('/api/qua-trinh/nckh', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghienCuuKhoaHoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/nckh', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghienCuuKhoaHoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/nckh', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghienCuuKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/nckh', app.permission.check('staff:login'), (req, res) => {
        console.log(req);
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNghienCuuKhoaHoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nckh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            console.log(req.session);
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
        if (req.session.user) {
            app.model.qtNghienCuuKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtNghienCuuKhoaHoc.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/nckh/download-mau', app.permission.check('staff:login'), (req, res) => {
        const workbook = app.excel.create(),
            worksheet = workbook.addWorksheet('NCKH');
        new Promise(resolve => {
            let cells = [
                { cell: 'A1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                { cell: 'B1', value: 'Tên đề tài', bold: true, border: '1234' },
                { cell: 'C1', value: 'Mã số và cấp quản lý', bold: true, border: '1234' },
                { cell: 'D1', value: 'Kinh phí', bold: true, border: '1234' },
                { cell: 'E1', value: 'Vai trò', bold: true, border: '1234' },
                { cell: 'F1', value: 'Ngày sinh', bold: true, border: '1234' },
                { cell: 'G1', value: 'Format thời gian bắt đầu', bold: true, border: '1234' },
                { cell: 'H1', value: 'Thời gian bắt đầu', bold: true, border: '1234' },
                { cell: 'I1', value: 'Format thời gian kết thúc', bold: true, border: '1234' },
                { cell: 'J1', value: 'Thời gian kết thúc', bold: true, border: '1234' },
                { cell: 'K1', value: 'Format thời gian kết thúc', bold: true, border: '1234' },
                { cell: 'L1', value: 'Thời gian nghiệm thu', bold: true, border: '1234' },
                { cell: 'M1', value: 'Tổng thời gian thực hiện (tháng)', bold: true, border: '1234' },
                { cell: 'A2', value: '001.000x', bold: true, border: '1234' },
                { cell: 'B2', value: 'Đây là tên đề tài', bold: true, border: '1234' },
                { cell: 'C2', value: 'Đây là mã số và cấp quản lý', bold: true, border: '1234' },
                { cell: 'D2', value: '900000', bold: true, border: '1234' },
                { cell: 'E2', value: 'Đây là vai trò', bold: true, border: '1234' },
                { cell: 'F2', value: '01/01/1970', bold: true, border: '1234' },
                { cell: 'G2', value: 'Nhập \'yyyy\' hoặc \'mm/yyyy\' hoặc \'dd/mm/yyyy\'', bold: true, border: '1234' },
                { cell: 'H2', value: 'Tương ứng với cột định dạng bắt đầu', bold: true, border: '1234' },
                { cell: 'I2', value: 'Nhập \'yyyy\' hoặc \'mm/yyyy\' hoặc \'dd/mm/yyyy\'', bold: true, border: '1234' },
                { cell: 'J2', value: 'Tương ứng với cột định dạng kết thúc', bold: true, border: '1234' },
                { cell: 'K2', value: 'Nhập \'yyyy\' hoặc \'mm/yyyy\' hoặc \'dd/mm/yyyy\'', bold: true, border: '1234' },
                { cell: 'L2', value: 'Tương ứng với cột định dạng nghiệm thu', bold: true, border: '1234' },
                { cell: 'M2', value: '5', bold: true, border: '1234' },
            ];

            resolve(cells);
        }).then((cells) => {
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, 'MauDuLieuNCKH.xlsx');
        }).catch((error) => {
            res.send({ error });
        });

    });

    const qtNCKHImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'NCKHDataFile' && files.NCKHDataFile && files.NCKHDataFile.length) {
                const srcPath = files.NCKHDataFile[0].path;
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
                    let tenDeTai = worksheet.getCell('A' + index).value ? worksheet.getCell('A' + index).value.toString().trim() : '',
                        maSoCapQuanLy = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '',
                        vaiTro = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '',
                        batDau = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value : '',
                        batDauType = worksheet.getCell('D' + index).value ? 'mm/yyyy' : '',
                        ketThuc = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value : '',
                        ketThucType = worksheet.getCell('E' + index).value ? 'mm/yyyy' : '',
                        ngayNghiemThu = worksheet.getCell('F' + index).value ? worksheet.getCell('F' + index).value : '',
                        ngayNghiemThuType = worksheet.getCell('F' + index).value ? 'mm/yyyy' : '',
                        kinhPhi = worksheet.getCell('G' + index).value ? worksheet.getCell('G' + index).value.toString().trim() : '',
                        ketQua = worksheet.getCell('H' + index).value ? worksheet.getCell('H' + index).value.toString().trim() : '';

                    items.push({ tenDeTai, maSoCapQuanLy, vaiTro, batDau, batDauType, ketThuc, ketThucType, ngayNghiemThu, ngayNghiemThuType, kinhPhi, ketQua });
                } else {
                    done({ items });
                    break;
                }
            }

        }).catch(error => done({ error }));
    };

    app.uploadHooks.add('NCKHDataFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => qtNCKHImportData(fields, files, done), done, 'staff:login'));

    // const qtNghienCuuKhoaHocUploadFile = (req, fields, files, params, done) => {
    //     if (files.NCKHFile && files.NCKHFile.length > 0) {
    //         console.log('Hook:');
    //         const srcPath = files.NCKHFile[0].path;
    //         app.excel.readFile(srcPath, workbook => {
    //             if (workbook) {
    //                 const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
    //                 const handleUpload = (index = 5) => {
    //                     if (index == totalRow + 1) {
    //                         app.deleteFile(srcPath);
    //                         done({ element });
    //                     } else {
    //                         if (worksheet.getCell('A' + index).value && worksheet.getCell('B' + index).value && worksheet.getCell('C' + index).value) {
    //                             let newData = {
    //                                 shcc: worksheet.getCell('A' + index).value,
    //                                 tenDeTai: worksheet.getCell('B' + index).value,
    //                                 maSoCapQuanLy: worksheet.getCell('C' + index).value,
    //                                 kinhPhi: worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value : '',
    //                                 vaiTro: worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value : '',
    //                                 ngaySinh: worksheet.getCell('F' + index).value ? new Date(worksheet.getCell('F' + index).value).getTime() : null,
    //                                 batDauType: worksheet.getCell('G' + index).value ? worksheet.getCell('G' + index).value : 'dd/mm/yyyy',
    //                                 batDau: worksheet.getCell('H' + index).value ? T.dateToText(worksheet.getCell('H' + index).value, getCell('G' + index).value) : null,
    //                                 ketThucType: worksheet.getCell('I' + index).value ? worksheet.getCell('I' + index).value : 'dd/mm/yyyy',
    //                                 ketThuc: worksheet.getCell('J' + index).value ? T.dateToText(worksheet.getCell('J' + index).value, getCell('I' + index).value) : null,
    //                                 thoiGian: worksheet.getCell('M' + index).value ? Number(worksheet.getCell('M' + index).value) : null,
    //                                 ngayNghiemThuType: worksheet.getCell('K' + index).value ? worksheet.getCell('K' + index).value : 'dd/mm/yyyy',
    //                                 ngayNghiemThu: worksheet.getCell('L' + index).value ? T.dateToText(worksheet.getCell('L' + index).value, getCell('I' + index).value) : null
    //                             }
    //                             element.push(newData);
    //                         }
    //                         handleUpload(index + 1);
    //                     }
    //                 };
    //                 handleUpload();
    //             } else {
    //                 app.deleteFile(srcPath);
    //                 done({ error: 'Error' });
    //             }
    //         });
    //     }
    // }

    app.get('/api/qua-trinh/nghien-cuu-khoa-hoc/download-template', app.permission.check('staff:login'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Qua_trinh_NCKH_Template');
        const defaultColumns = [
            { header: 'TÊN ĐỀ TÀI', key: 'tenDeTai', width: 40 },
            { header: 'MÃ SỐ VÀ CẤP QUẢN LÝ', key: 'maSoCapQuanLy', width: 30 },
            { header: 'VAI TRÒ', key: 'vaiTro', width: 15 },
            { header: 'BẮT ĐẦU (mm/yyyy)', key: 'batDau', width: 20, style: { numFmt: 'mm/yyyy' } },
            { header: 'KẾT THÚC (mm/yyyy)', key: 'ketThuc', width: 20, style: { numFmt: 'mm/yyyy' } },
            { header: 'NGHIỆM THU (mm/yyyy)', key: 'ngayNghiemThu', width: 20, style: { numFmt: 'mm/yyyy' } },
            { header: 'KINH PHÍ', key: 'kinhPhi', width: 15 },
            { header: 'KẾT QUẢ', key: 'ketQua', width: 15 },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        app.excel.attachment(workBook, res, 'Qua_trinh_NCKH_Template.xlsx');
    });
    // app.uploadHooks.add('qtNghienCuuKhoaHocUploadFile', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => qtNghienCuuKhoaHocUploadFile(req, fields, files, params, done), done, 'staff:login'));
};

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
            1031: { title: 'Đi nước ngoài', subTitle: 'Công tác, đào tạo, du lịch, ...', link: '/user/di-nuoc-ngoai', icon: 'fa-globe', backgroundColor: '#4297ff', groupIndex: 0 },
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

    app.put('/api/qua-trinh/di-nuoc-ngoai', app.permission.check('qtDiNuocNgoai:write'), (req, res) => {
        app.model.qtDiNuocNgoai.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Đi nước ngoài');
            res.send({ error, item });
        });
    });

    app.delete('/api/qua-trinh/di-nuoc-ngoai', app.permission.check('qtDiNuocNgoai:write'), (req, res) => {
        app.model.qtDiNuocNgoai.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Đi nước ngoài');
            res.send(error);
        });
    });

    app.get('/api/qua-trinh/di-nuoc-ngoai/download-excel/:filter', app.permission.check('qtDiNuocNgoai:read'), (req, res) => {
        app.model.qtDiNuocNgoai.download(req.params.filter, (err, result) => {
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
                        { cell: 'J1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'K1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'NƯỚC ĐẾN', bold: true, border: '1234' },
                        { cell: 'M1', value: 'VIẾT TẮT', bold: true, border: '1234' },
                        { cell: 'N1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'O1', value: 'NGÀY ĐI', bold: true, border: '1234' },
                        { cell: 'P1', value: 'NGÀY VỀ', bold: true, border: '1234' },
                        { cell: 'Q1', value: 'CHI PHÍ', bold: true, border: '1234' },
                        { cell: 'R1', value: 'GHI CHÚ', bold: true, border: '1234' },
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
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : ''});
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.danhSachQuocGia });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.tenMucDich });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.noiDung });
                        cells.push({ cell: 'O' + (index + 2), alignment: 'center', border: '1234', value: item.ngayDi ? app.date.dateTimeFormat(new Date(item.ngayDi), item.ngayDiType ? item.ngayDiType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'P' + (index + 2), alignment: 'center', border: '1234', value: (item.ngayVe != null && item.ngayVe != -1) ? app.date.dateTimeFormat(new Date(item.ngayVe), item.ngayVeType ? item.ngayVeType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'Q' + (index + 2), border: '1234', value: item.chiPhi });
                        cells.push({ cell: 'R' + (index + 2), border: '1234', value: item.ghiChu });
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
    app.get('/api/qua-trinh/tiep-nhan-ve-nuoc/download-excel/:filter', app.permission.check('qtDiNuocNgoai:read'), (req, res) => {
        app.model.qtDiNuocNgoai.download(req.params.filter, (err, result) => {
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
                        { cell: 'J1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'K1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'NƯỚC ĐẾN', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'N1', value: 'NGÀY VỀ', bold: true, border: '1234' },
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
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : ''});
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.danhSachQuocGia });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.noiDungTiepNhan });
                        cells.push({ cell: 'N' + (index + 2), alignment: 'center', border: '1234', value: item.ngayVeNuoc ? app.date.dateTimeFormat(new Date(item.ngayVeNuoc), 'dd/mm/yyyy') : '' });
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
};

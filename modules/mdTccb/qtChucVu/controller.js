module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3004: { title: 'Quá trình chức vụ', link: '/user/tccb/qua-trinh/chuc-vu', icon: 'fa-black-tie', backgroundColor: '#c77a2e', color: 'black', groupIndex: 0 },
        },
    };
    app.permission.add(
        { name: 'qtChucVu:read', menu },
        { name: 'qtChucVu:write' },
        { name: 'qtChucVu:delete' },
    );
    app.get('/user/tccb/qua-trinh/chuc-vu/:stt', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/chuc-vu/group/:shcc', app.permission.check('qtChucVu:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/qua-trinh/chuc-vu/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, list_cv, gioiTinh } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, list_cv: null, gioiTinh: null };
        app.model.qtChucVu.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/group/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, list_cv, gioiTinh } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, list_cv: null, gioiTinh: null };
        app.model.qtChucVu.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), (req, res) => {
        app.model.qtChucVu.getByShcc(req.query.shcc, (error, items) => res.send({ error, items }));
    });


    // app.get('/api/tccb/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), (req, res) => {
    //     app.model.qtChucVu.getAll((error, items) => res.send({ error, items }));
    // });

    app.post('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) => {
        app.model.qtChucVu.create(req.body.data, (error, item) => res.send({ error, item }));
    });
    

    app.put('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.update({ stt: req.body.stt }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.delete({ stt: req.body.stt }, (error) => res.send(error)));

    // app.post('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
    //     if (req.body.data && req.session.user) {
    //         const data = req.body.data;
    //         app.model.qtChucVu.create(data, (error, item) => res.send({ error, item }));
    //     } else {
    //         res.send({ error: 'Invalstt parameter!' });
    //     }
    // });

    // app.put('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
    //     if (req.body.changes && req.session.user) {
    //         app.model.qtChucVu.get({ stt: req.body.stt }, (error, item) => {
    //             if (error || item == null) {
    //                 res.send({ error: 'Not found!' });
    //             } else {
    //                 if (item.email === req.session.user.email) {
    //                     const changes = req.body.changes;
    //                     app.model.qtChucVu.update({ stt: req.body.stt }, changes, (error, item) => res.send({ error, item }));
    //                 } else {
    //                     res.send({ error: 'Not found!' });
    //                 }
    //             }
    //         });
    //     } else {
    //         res.send({ error: 'Invalstt parameter!' });
    //     }
    // });

    // app.delete('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
    //     if (req.session.user) {
    //         app.model.qtChucVu.get({ stt: req.body.stt }, (error, item) => {
    //             if (error || item == null) {
    //                 res.send({ error: 'Not found!' });
    //             } else {
    //                 if (item.email === req.session.user.email) {
    //                     app.model.qtChucVu.delete({ stt: req.body.stt }, (error) => res.send(error));
    //                 } else {
    //                     res.send({ error: 'Not found!' });
    //                 }
    //             }
    //         });
    //     } else {
    //         res.send({ error: 'Invalstt parameter!' });
    //     }
    // });

    app.get('/api/tccb/qua-trinh/chuc-vu-by-shcc/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtChucVu.getByShcc(req.params.shcc, (error, item) => {
            if (item && item.rows.length > 0) res.send({ error, item: item.rows });
        });
    });

    app.get('/api/qua-trinh/chuc-vu/download-excel/:list_shcc/:list_dv/:fromYear/:toYear/:timeType/:list_cv/:gioiTinh', app.permission.check('qtChucVu:read'), (req, res) => {
        let { list_dv, fromYear, toYear, list_shcc, timeType, list_cv, gioiTinh } = req.params ? req.params : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, list_cv: null, gioiTinh: null };
        if (list_shcc == 'null') list_shcc = null;
        if (list_dv == 'null') list_dv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (list_cv == 'null') list_cv = null;
        if (gioiTinh == 'null') gioiTinh = null;
        app.model.qtChucVu.download(list_dv, fromYear, toYear, list_shcc, timeType, list_cv, gioiTinh, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('chucvu');
                new Promise(resolve => {
                    let cells = [
                    // Table name: QT_CHUC_VU { stt, shcc, maChucVu, maDonVi, maBoMon, soQd, ngayRaQd, chucVuChinh, thoiChucVu, soQdThoiChucVu, ngayThoiChucVu, ngayRaQdThoiChucVu }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'NGÀY QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'SỐ CV', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'F1', value: 'HỌ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'TÊN', bold: true, border: '1234' },
                        { cell: 'H1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'I1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'J1', value: 'NƠI ĐẾN', bold: true, border: '1234' },
                        { cell: 'K1', value: 'VIẾT TẮT', bold: true, border: '1234' },
                        { cell: 'L1', value: 'LÝ DO ĐI', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NGÀY ĐI', bold: true, border: '1234' },
                        { cell: 'N1', value: 'NGÀY VỀ', bold: true, border: '1234' },
                        { cell: 'O1', value: 'KINH PHÍ', bold: true, border: '1234' },
                        { cell: 'P1', value: 'GHI CHÚ', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.ngayQuyetDinh ? app.date.dateTimeFormat(new Date(item.ngayQuyetDinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.soCv });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.danhSachTinh });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenMucDich });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.lyDo });
                        cells.push({ cell: 'M' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'N' + (index + 2), alignment: 'center', border: '1234', value: (item.ketThuc != null && item.ketThuc != -1) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.kinhPhi });
                        cells.push({ cell: 'P' + (index + 2), border: '1234', value: item.ghiChu });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'chucvu.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });
};
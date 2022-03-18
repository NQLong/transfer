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
        app.model.qtChucVu.download(list_shcc, list_dv, fromYear, toYear, timeType, list_cv, gioiTinh, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                let newRows = [];
                for (let idx = 0; idx < result.rows.length; idx++) {
                    if (result.rows[idx].soChucVuKiemNhiem == 0 && !result.rows[idx].itemChinh) continue;
                    newRows.push(result.rows[idx]);
                }
                let maxSoLuongKiemNhiem = 0;
                for (let idx = 0; idx < newRows.length; idx++) {
                    let value = newRows[idx].soChucVuKiemNhiem;
                    if (value > maxSoLuongKiemNhiem) {
                        maxSoLuongKiemNhiem = value;
                    }
                }
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('chucvu');
                new Promise(resolve => {
                    let cells = [
                    // Table name: QT_CHUC_VU { stt, shcc, maChucVu, maDonVi, maBoMon, soQd, ngayRaQd, chucVuChinh, thoiChucVu, soQdThoiChucVu, ngayThoiChucVu, ngayRaQdThoiChucVu }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                        { cell: 'D1', value: 'NGÀY THÁNG NĂM SINH', bold: true, border: '1234' },
                        { cell: 'E1', value: 'GIỚI TÍNH', bold: true, border: '1234' },
                        { cell: 'F1', value: 'ĐƠN VỊ CÔNG TÁC', bold: true, border: '1234' },
                        { cell: 'G1', value: 'CHỨC VỤ CHÍNH', bold: true, border: '1234' },
                        { cell: 'H1', value: 'HỆ SỐ PHỤ CẤP', bold: true, border: '1234' },
                        { cell: 'I1', value: 'SỐ QĐ BỔ NHIỆM', bold: true, border: '1234' },
                        { cell: 'J1', value: 'NGÀY RA QĐ', bold: true, border: '1234' },
                    ];
                    for (let idx = 0, col = 10; idx < maxSoLuongKiemNhiem; idx++) {
                        cells.push({ cell: String.fromCharCode(65 + col) + '1', value: 'CHỨC VỤ KIÊM NHIỆM ' + (idx + 1).toString(), bold: true, border: '1234' });
                        cells.push({ cell: String.fromCharCode(65 + col + 1) + '1', value: 'ĐƠN VỊ CÔNG TÁC', bold: true, border: '1234' });
                        cells.push({ cell: String.fromCharCode(65 + col + 2) + '1', value: 'HỆ SỐ PHỤ CẤP', bold: true, border: '1234' });
                        cells.push({ cell: String.fromCharCode(65 + col + 3) + '1', value: 'SỐ QĐ BỔ NHIỆM', bold: true, border: '1234' });
                        cells.push({ cell: String.fromCharCode(65 + col + 4) + '1', value: 'NGÀY RA QĐ', bold: true, border: '1234' });
                        col += 5;
                    }
                    newRows.forEach((item, index) => {
                        let danhSachChinh = null, chucVuChinh = null, ngayRaQdChinh = null, soQdChinh = null, heSoPhuCap = null;
                        if (item.itemChinh) {
                            danhSachChinh = item.itemChinh.split('??');
                            chucVuChinh = danhSachChinh[0].trim();
                            // donViChinh = danhSachChinh[1].trim();
                            // boMonChinh = danhSachChinh[2].trim();
                            ngayRaQdChinh = Number(danhSachChinh[3].trim());
                            soQdChinh = danhSachChinh[4].trim();
                            heSoPhuCap = parseFloat(danhSachChinh[5].trim());
                        }
                        let hoTen = item.ho + ' ' + item.ten;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                        cells.push({ cell: 'D' + (index + 2), alignment: 'center', border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.gioiTinh == '01' ? 'Nam' : 'Nữ' });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: chucVuChinh });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: heSoPhuCap });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: soQdChinh });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: ngayRaQdChinh ? app.date.dateTimeFormat(new Date(ngayRaQdChinh), 'dd/mm/yyyy') : '' });
                        let idx = 0, col = 10;
                        if (item.soChucVuKiemNhiem > 0) {
                            let danhSachChucVuKiemNhiem = item.danhSachChucVuKiemNhiem.split('??');
                            let danhSachSoQdKiemNhiem = item.danhSachSoQdKiemNhiem.split('??');
                            let danhSachNgayQdKiemNhiem = item.danhSachNgayQdKiemNhiem.split('??');
                            let danhSachHeSoPhuCapKiemNhiem = item.danhSachHeSoPhuCapKiemNhiem.split('??');
                            let danhSachDonViKiemNhiem = item.danhSachDonViKiemNhiem.split('??');
                            for (; idx < item.soChucVuKiemNhiem; idx++) {
                                cells.push({ cell: String.fromCharCode(65 + col) + (index + 2), border: '1234', value: danhSachChucVuKiemNhiem[idx].trim()});
                                cells.push({ cell: String.fromCharCode(65 + col + 1) + (index + 2), border: '1234', value: danhSachDonViKiemNhiem[idx].trim()});
                                cells.push({ cell: String.fromCharCode(65 + col + 2) + (index + 2), border: '1234', value: parseFloat(danhSachHeSoPhuCapKiemNhiem[idx].trim())});
                                cells.push({ cell: String.fromCharCode(65 + col + 3) + (index + 2), border: '1234', value: danhSachSoQdKiemNhiem[idx].trim()});
                                cells.push({ cell: String.fromCharCode(65 + col + 4) + (index + 2), border: '1234', value: danhSachNgayQdKiemNhiem[idx].trim() ? app.date.dateTimeFormat(new Date(Number(danhSachNgayQdKiemNhiem[idx].trim())), 'dd/mm/yyyy') : ''});
                                col += 5;
                            }
                        }
                        for (; idx < maxSoLuongKiemNhiem; idx++) {
                            cells.push({ cell: String.fromCharCode(65 + col) + (index + 2), border: '1234', value: '' });
                            cells.push({ cell: String.fromCharCode(65 + col + 1) + (index + 2), border: '1234', value: '' });
                            cells.push({ cell: String.fromCharCode(65 + col + 2) + (index + 2), border: '1234', value: '' });
                            cells.push({ cell: String.fromCharCode(65 + col + 3) + (index + 2), border: '1234', value: '' });
                            cells.push({ cell: String.fromCharCode(65 + col + 4) + (index + 2), border: '1234', value: '' });
                            col += 5;
                        }
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
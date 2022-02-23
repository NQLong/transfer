module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9501: { title: 'Danh sách bài viết khoa học', link: '/user/khcn/qua-trinh/bai-viet-khoa-hoc', icon: 'fa-quote-right', backgroundColor: '#23a0b0' },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1014: { title: 'Bài viết khoa học', link: '/user/bai-viet-khoa-hoc', icon: 'fa-quote-right', backgroundColor: '#23a0b0', groupIndex: 4 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBaiVietKhoaHoc:read', menu },
        { name: 'qtBaiVietKhoaHoc:write' },
        { name: 'qtBaiVietKhoaHoc:delete' },
    );
    app.get('/user/khcn/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/khcn/qua-trinh/bai-viet-khoa-hoc/group/:shcc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/bai-viet-khoa-hoc', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtBaiVietKhoaHoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
    app.delete('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, xuatBanRange } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, xuatBanRange: null };
        app.model.qtBaiVietKhoaHoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, xuatBanRange, searchTerm, (error, page) => {
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

    app.get('/api/khcn/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, xuatBanRange } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, xuatBanRange: null };
        app.model.qtBaiVietKhoaHoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, xuatBanRange, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/khcn/qua-trinh/bai-viet-khoa-hoc/group/page/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, xuatBanRange } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, xuatBanRange: null };
        app.model.qtBaiVietKhoaHoc.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, xuatBanRange, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/qua-trinh/bai-viet-khoa-hoc/download-excel/:list_shcc/:list_dv/:fromYear/:toYear/:xuatBanRange', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
        let { list_shcc, list_dv, fromYear, toYear, xuatBanRange } = req.params ? req.params : { list_shcc: null, list_dv: null, toYear: null, xuatBanRange: null };
        if (list_shcc == 'null') list_shcc = null;
        if (list_dv == 'null') list_dv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (xuatBanRange == 'null') xuatBanRange = null;
        app.model.qtBaiVietKhoaHoc.download(list_shcc, list_dv, fromYear, toYear, xuatBanRange, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('baivietkhoahoc');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ và tên cán bộ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên tác giả', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Năm xuất bản', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Tên bài viết', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Tên tạp chí', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Số hiệu ISSN', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Sản phẩm', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Điểm IF', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Phạm vi xuất bản', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoTen = item.hoCanBo + ' ' + item.tenCanBo;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenTacGia });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.namXuatBan });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenBaiViet });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenTapChi });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.soHieuIssn });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.sanPham });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.diemIf });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.quocTe ? (item.quocTe == 0 ? 'Trong nước' : item.quocTe == 1 ? 'Quốc tế' : 'Trong và ngoài nước') : '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'baivietkhoahoc.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });
};
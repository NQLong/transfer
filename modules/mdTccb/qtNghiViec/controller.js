module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3030: { title: 'Cán bộ Nghỉ việc', link: '/user/tccb/qua-trinh/nghi-viec', icon: 'fa-user-times', backgroundColor: '#2a99b8', groupIndex: 0 },
        },
    };
    app.permission.add(
        { name: 'qtNghiViec:read', menu },
        { name: 'qtNghiViec:write' },
        { name: 'qtNghiViec:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/nghi-viec/page/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = req.query.condition || '';
        let filter = app.stringify(req.query.filter || {});
        app.model.qtNghiViec.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:write'), (req, res) => {
        let data = req.body.data;
        const create = (index = 0) => {
            if (index > data.listShcc.length - 1) {
                app.tccbSaveCRUD(req.session.user.email, 'U', 'Nghỉ việc');
                res.send({ item: 'Success' });
            }
            app.model.qtNghiViec.create({ ...data, shcc: data.listShcc[index] }, (error, item) => {
                if (error) {
                    res.send({ error });
                    return;
                }
                app.model.canBo.update({ shcc: item.shcc }, { ngayNghi: data.ngayNghi }, () => {
                    create(index + 1);
                });
            });
        };
        create();
    });

    app.put('/api/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:write'), (req, res) => {
        let changes = req.body.changes;
        app.model.qtNghiViec.update({ ma: req.body.ma }, changes, (error, item) => {
            // console.log(item);
            if (item.shcc) {
                app.model.canBo.get({ shcc: item.shcc }, (error, canBo) => {
                    if (error || !canBo) res.send({ error, item });
                    else {
                        app.model.canBo.update({ shcc: item.shcc }, { ngayNghi: item.ngayNghi }, (error, canBo) => {
                            res.send({ error, item, isUpdatedStaff: canBo });
                        });
                    }
                });
            }
            else res.send({ error, item });
        });
    });

    app.delete('/api/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:delete'), (req, res) => {
        app.model.qtNghiViec.delete({ ma: req.body.ma }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Nghỉ việc');
            res.send({ error });
        });
    });


    app.get('/api/qua-trinh/nghi-viec/download-excel/:filter', app.permission.check('qtNghiViec:read'), (req, res) => {
        app.model.qtNghiViec.downloadExcel(req.params.filter, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Danh sách nghỉ việc');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'SỐ QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'LÝ DO NGHỈ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'F1', value: 'HỌ TÊN', bold: true, border: '1234' },
                        { cell: 'G1', value: 'GIỚI TÍNH', bold: true, border: '1234' },
                        { cell: 'H1', value: 'NGÀY SINH', bold: true, border: '1234' },
                        { cell: 'I1', value: 'CHỨC DANH NGHỀ NGHIỆP', bold: true, border: '1234' },
                        { cell: 'J1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'K1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NGÀY NGHỈ', bold: true, border: '1234' },
                        { cell: 'N1', value: 'GHI CHÚ', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.soQuyetDinh || '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.tenLyDo || '' });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenHocVi || '' });

                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.shcc || '' });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hoTen?.toUpperCase() || `${item.hoCanBo} ${item.tenCanBo}` });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.phai == '01' ? 'Nam' : 'Nữ' });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep || '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucVu || '' });

                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenDonVi || '' });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.noiDung || '' });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.ngayNghi ? app.date.dateTimeFormat(new Date(item.ngayNghi), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.ghiChu || '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'NGHIVIEC.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });

};
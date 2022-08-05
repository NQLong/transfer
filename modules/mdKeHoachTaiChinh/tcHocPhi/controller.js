module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5003: { title: 'Quản lý học phí', link: '/user/finance/hoc-phi' },
        },
    };

    const menuStatistic = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5006: { title: 'Thống kê', link: '/user/finance/statistic' },
        },
    };

    app.permission.add(
        { name: 'tcHocPhi:read', menu },
        { name: 'tcHocPhi:manage', menu },
        { name: 'tcHocPhi:manage', menu: menuStatistic },
        'tcHocPhi:write', 'tcHocPhi:delete', 'tcHocPhi:export'
    );

    app.permissionHooks.add('staff', 'addRolesTcHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcHocPhi:manage', 'tcHocPhi:write', 'tcHocPhi:delete', 'tcHocPhi:read');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/hoc-phi', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:manage'), app.templates.admin);
    app.get('/user/finance/statistic', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/import-hoc-phi', app.permission.check('tcHocPhi:manage'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/page/:pageNumber/:pageSize', app.permission.orCheck('tcHocPhi:read', 'student:login'), async (req, res) => {
        let { pageNumber, pageSize } = req.params;
        let searchTerm = `%${req.query.searchTerm || ''}%`;
        let filter = req.query.filter || {};
        if (!filter.namHoc || !filter.hocKy) {
            const settings = await getSettings();
            if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
            if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
        }
        const { namHoc, hocKy } = filter;
        filter = app.stringify(filter, '');
        let mssv = '';
        if (!req.session.user.permissions.includes('tcHocPhi:read')) mssv = req.session.user.data.mssv;

        app.model.tcHocPhi.searchPage(parseInt(pageNumber), parseInt(pageSize), mssv, searchTerm, filter, (error, page) => {
            if (error || !page) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, totalpaid: totalPaid, totalcurrent: totalCurrent } = page;
                const pageCondition = searchTerm;
                res.send({
                    page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, settings: { namHoc, hocKy, totalPaid, totalCurrent } }
                });
            }
        });
    });

    app.get('/api/finance/hoc-phi-transactions/:mssv', app.permission.orCheck('tcHocPhi:manage'), async (req, res) => {
        try {
            const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await getSettings(),
                mssv = req.params.mssv;
            let sinhVien = await app.model.fwStudents.get({ mssv });
            if (!sinhVien) throw 'Not found student!';
            else {
                const items = await app.model.tcHocPhiTransaction.getAll({
                    customerId: mssv, hocKy, namHoc
                });
                res.send({ items, sinhVien, hocKy, namHoc });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/user/hoc-phi', app.permission.orCheck('tcHocPhi:read', 'student:login'), async (req, res) => {
        try {
            const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await getSettings();
            const user = req.session.user, permissions = user.permissions;
            let mssv = '';
            if (!permissions.includes('tcHocPhi:read')) {
                mssv = user.data.mssv;
                const khoa = await app.model.dmDonVi.get({ ma: user.data.khoa }, 'ten');
                user.data.tenKhoa = khoa.ten;
            } else mssv = req.query.mssv;
            const [hocPhi, hocPhiDetail] = await Promise.all([app.model.tcHocPhi.get({ mssv, namHoc, hocKy }), app.model.tcHocPhiDetail.getAll({ mssv, namHoc, hocKy })]);
            for (const item of hocPhiDetail) {
                const loaiPhi = await app.model.tcLoaiPhi.get({ id: item.loaiPhi });
                if (loaiPhi) {
                    item.tenLoaiPhi = loaiPhi.ten;
                }
            }
            res.send({ hocPhi, hocPhiDetail });
        } catch (error) {
            console.error('ERROR Get student fee: ', error);
            res.send({ error });
        }
    });

    app.get('/api/finance/user/get-all-hoc-phi', app.permission.orCheck('student:login', 'tcHocPhi:read'), async (req, res) => {
        try {
            const user = req.session.user, permissions = user.permissions;
            let mssv = '';
            if (!permissions.includes('tcHocPhi:read')) {
                mssv = user.data.mssv;
            } else mssv = req.query.mssv;
            const data = await app.model.tcHocPhi.getAllFeeOfStudent(mssv);
            const { rows: hocPhiAll, hocphidetailall: hocPhiDetailAll } = data;
            res.send({ hocPhiAll: hocPhiAll.groupBy('namHoc'), hocPhiDetailAll: hocPhiDetailAll.groupBy('namHoc') });
        } catch (error) {
            res.send({ error });
        }

    });

    app.put('/api/finance/hoc-phi', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const { item: { mssv, namHoc, hocKy }, changes } = req.body;
            delete changes['congNo'];
            let item = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (item) {
                const hocPhiCu = item.hocPhi;
                item.hocPhi = changes.hocPhi;
                let congNo = await getCongNo(item);
                changes.congNo = congNo;
                const updateItem = await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, changes);
                if (updateItem) {
                    const logItem = {
                        mssv: mssv,
                        hocKy: hocKy,
                        namHoc: namHoc,
                        duLieuCu: JSON.stringify({ hocPhi: hocPhiCu }),
                        duLieuMoi: JSON.stringify({ hocPhi: item.hocPhi })
                    };
                    app.tcHocPhiSaveLog(req.session.user.email, 'U', logItem);
                    item.congNo = congNo;
                    res.send({ item });
                } else throw 'Lỗi cập nhật học phí';
            } else throw 'Không tồn tại học phí';
        } catch (error) {
            res.send({ error });
        }

    });

    app.post('/api/finance/hoc-phi/multiple', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const ngayTao = Date.now();
            const dataMergeMssv = data.groupBy('mssv');
            let dataHocPhi = {};
            for (const sinhVien of Object.keys(dataMergeMssv)) {
                for (let index = 0; index < dataMergeMssv[sinhVien].length; index++) {
                    let { mssv, namHoc, hocKy } = dataMergeMssv[sinhVien][index];
                    const condition = { mssv, namHoc, hocKy };
                    let sumHocPhi = dataMergeMssv[sinhVien].filter(item => item.hocKy == hocKy && item.namHoc == namHoc).reduce((sum, item) => sum + parseInt(item.soTien), 0);
                    dataHocPhi = await app.model.tcHocPhi.get(condition);
                    if (dataHocPhi) {
                        let allTracsactionsCurrent = await app.model.tcHocPhiTransaction.getAll({ customerId: mssv, namHoc, hocKy });
                        const newCongNo = sumHocPhi - allTracsactionsCurrent.reduce((sumCurrentCongNo, item) => sumCurrentCongNo + parseInt(item.amount || 0), 0);
                        dataHocPhi = await app.model.tcHocPhi.update(condition, { hocPhi: sumHocPhi, ngayTao, congNo: newCongNo });
                    } else {
                        dataHocPhi = await app.model.tcHocPhi.create({ ...condition, hocPhi: sumHocPhi, congNo: sumHocPhi, ngayTao });
                    }
                    if (!dataHocPhi) throw 'Cập nhật học phí lỗi!';
                }

            }
            for (const khoanPhi of data) {
                let { mssv, soTien, loaiPhi, namHoc, hocKy } = khoanPhi;
                if (!khoanPhi.ngayTao) khoanPhi.ngayTao = ngayTao;
                const currentLoaiPhi = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi });
                if (!currentLoaiPhi) {
                    await app.model.tcHocPhiDetail.create({ ...khoanPhi });
                } else {
                    await app.model.tcHocPhiDetail.update({ mssv, namHoc, hocKy, loaiPhi }, { soTien, ngayTao: khoanPhi.ngayTao });
                }
            }
            res.send({ item: dataHocPhi });
        } catch (error) {
            console.error('Error import', error);
            res.send({ error });
        }
    });

    const getCongNo = async (item) => {
        const { mssv, hocKy, namHoc, hocPhi } = item;
        const items = await app.model.tcHocPhiTransaction.getAll({
            customerId: mssv, hocKy, namHoc
        });
        const congNo = hocPhi - items.reduce((partialSum, item) => partialSum + parseInt(item.amount), 0);
        return congNo;
    };

    //Hook upload -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('TcHocPhiData', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcHocPhiImportData(fields, files, done), done, 'tcHocPhi:write')
    );

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    app.get('/api/finance/huong-dan-dong-hoc-phi', app.permission.orCheck('tcHocPhi:manage', 'student:login'), async (req, res) => {
        const { hocPhiHuongDan } = await getSettings();
        res.send({ hocPhiHuongDan });
    });

    const tcHocPhiImportData = async (fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcHocPhiData' && files.TcHocPhiData && files.TcHocPhiData.length) {
            const srcPath = files.TcHocPhiData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const duplicateDatas = [];
                    let index = 2;
                    try {
                        while (true) {
                            if (!worksheet.getCell('A' + index).value) {
                                done({ items, duplicateDatas });
                                break;
                            } else {
                                const namHoc = worksheet.getCell('A' + index).value;
                                const hocKy = (worksheet.getCell('B' + index).value || 'HK').replace('HK', '');
                                let loaiPhi = worksheet.getCell('D' + index).value;
                                const soTien = worksheet.getCell('E' + index).value;
                                const mssv = worksheet.getCell('C' + index).value?.toString().trim() || '';
                                const itemLoaiPhi = await app.model.tcLoaiPhi.get({ ten: loaiPhi });
                                loaiPhi = itemLoaiPhi.id;
                                const row = { namHoc, hocKy, mssv, soTien, loaiPhi, tenLoaiPhi: itemLoaiPhi.ten };
                                if (mssv) {
                                    //check MSSV
                                    let student = await app.model.fwStudents.get({ mssv });
                                    if (student) {
                                        let hoTenSinhVien = `${student.ho} ${student.ten}`,
                                            tmpRow = { ...row, hoTenSinhVien };
                                        let hocPhi = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi });
                                        if (hocPhi) {
                                            const { soTien: curFee } = hocPhi;
                                            tmpRow = { ...tmpRow, curFee };
                                            duplicateDatas.push(mssv);
                                        }
                                        items.push(tmpRow);
                                    }
                                }
                                index++;

                            }
                        }
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    const yearDatas = () => {
        return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
    };

    const termDatas = ['HK1', 'HK2', 'HK3'];

    //Export xlsx
    app.get('/api/finance/hoc-phi/download-template', app.permission.check('tcHocPhi:export'), async (req, res) => {
        let loaiPhiData = await app.model.tcLoaiPhi.getAll({ kichHoat: 1 });
        loaiPhiData = loaiPhiData.map(item => item.ten);
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Hoc_phi_Template');
        const defaultColumns = [
            { header: 'NĂM HỌC', key: 'namHoc', width: 20 },
            { header: 'HỌC KỲ', key: 'hocKy', width: 20 },
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'LOẠI PHÍ', key: 'loaiPhi', width: 20 },
            { header: 'SỐ TIỀN', key: 'soTien', width: 25, style: { numFmt: '###,###' } },
        ];
        ws.columns = defaultColumns;
        const { dataRange: years } = workBook.createRefSheet('NAM_HOC', yearDatas());
        const { dataRange: terms } = workBook.createRefSheet('HOC_KY', termDatas);
        const { dataRange: type } = workBook.createRefSheet('LOAI_PHI', loaiPhiData);
        const rows = ws.getRows(2, 1000);
        rows.forEach((row) => {
            row.getCell('namHoc').dataValidation = { type: 'list', allowBlank: true, formulae: [years] };
            row.getCell('hocKy').dataValidation = { type: 'list', allowBlank: true, formulae: [terms] };
            row.getCell('loaiPhi').dataValidation = { type: 'list', allowBlank: true, formulae: [type] };
        });
        app.excel.attachment(workBook, res, 'Hoc_phi_Template.xlsx');
    });

    app.get('/api/finance/hoc-phi/download-excel', app.permission.check('tcHocPhi:export'), async (req, res) => {
        try {
            let filter = app.parse(req.query.filter, {});
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }
            filter = app.stringify(filter, '');
            let data = await app.model.tcHocPhi.searchPage(1, 1000000, '', '', filter);
            const list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet(`${settings.hocPhiNamHoc}_${settings.hocPhiHocKy}`);
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ VÀ TÊN LÓT', key: 'ho', width: 30 },
                { header: 'TÊN', key: 'ten', width: 10 },
                { header: 'GIỚI TÍNH', key: 'gioiTinh', width: 10 },
                { header: 'NGÀY SINH', key: 'ngaySinh', width: 10 },
                { header: 'BẬC ĐÀO TẠO', key: 'bacDaoTao', width: 10 },
                { header: 'HỆ ĐÀO TẠO', key: 'heDaoTao', width: 10 },
                { header: 'KHOA/BỘ MÔN', key: 'donVi', width: 20 },
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 10 },
                { header: 'TÊN NGÀNH HỌC', key: 'tenNganh', width: 20 },
                { header: 'HỌC KỲ', key: 'term', width: 10 },
                { header: 'NĂM HỌC', key: 'year', width: 20 },
                { header: 'SỐ TIỀN THU (VND)', key: 'hocPhi', width: 15 },
                { header: 'ĐÃ THU (VND)', key: 'congNo', width: 15 },
                { header: 'THỜI GIAN ĐÓNG', key: 'thoiGian', width: 20 },
                { header: 'MÃ HOÁ ĐƠN', key: 'idTrans', width: 20 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            // ws.getRow(1).height = 0;
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };
            list.forEach((item, index) => {
                ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(index + 2).font = { name: 'Times New Roman' };
                ws.getCell('A' + (index + 2)).value = index + 1;
                ws.getCell('B' + (index + 2)).value = item.mssv;
                ws.getCell('C' + (index + 2)).value = item.ho.toUpperCase();
                ws.getCell('D' + (index + 2)).value = item.ten.toUpperCase();
                ws.getCell('E' + (index + 2)).value = item.gioiTinh == 1 ? 'Nam' : 'Nữ';
                ws.getCell('F' + (index + 2)).value = app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy');
                ws.getCell('G' + (index + 2)).value = item.tenBacDaoTao;
                ws.getCell('H' + (index + 2)).value = item.tenLoaiHinhDaoTao;
                ws.getCell('I' + (index + 2)).value = item.tenKhoa;
                ws.getCell('J' + (index + 2)).value = item.maNganh;
                ws.getCell('K' + (index + 2)).value = item.tenNganh;
                ws.getCell('L' + (index + 2)).value = settings.hocPhiHocKy;
                ws.getCell('M' + (index + 2)).value = `${settings.hocPhiNamHoc} - ${parseInt(settings.hocPhiNamHoc) + 1}`;
                ws.getCell('N' + (index + 2)).value = item.hocPhi.toString().numberDisplay();
                ws.getCell('O' + (index + 2)).value = (parseInt(item.hocPhi) - parseInt(item.congNo)).toString().numberDisplay();
                ws.getCell('P' + (index + 2)).value = item.lastTransaction ? app.date.dateTimeFormat(new Date(Number(item.lastTransaction)), 'HH:MM:ss dd/mm/yyyy') : '';
                ws.getCell('Q' + (index + 2)).value = item.lastTransactionId;
                ws.getCell('L' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('M' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('N' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('O' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('P' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'center' };
                ws.getCell('E' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'center' };
                ws.getCell('F' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'center' };

            });

            // Sheet thống kê học phí
            filter = app.parse(filter, {});
            let dataTransaction = await app.model.tcHocPhi.downloadExcel(app.stringify({
                namHoc: filter.namHoc,
                hocKy: filter.hocKy
            }, ''));
            const listTransaction = dataTransaction.rows;
            const thongKe = workBook.addWorksheet('Thống kê học phí');
            thongKe.columns = [
                { header: 'ROW LABELS', key: 'label', width: 40 },
                { header: 'SỐ LƯỢNG CẦN THU', key: 'totalCurrent', width: 30 },
                { header: 'TỔNG SỐ TIỀN CẦN THU', key: 'totalCurrentMoney', width: 30 },
                { header: 'SỐ LƯỢNG ĐÃ ĐÓNG ĐỦ', key: 'totalPaid', width: 30 },
                { header: 'TỔNG SỐ TIỀN ĐÃ THU', key: 'totalPaidMoney', width: 30 }
            ];

            thongKe.addRow({
                label: `NH: ${filter.namHoc} - ${Number(filter.namHoc) + 1}, HK ${filter.hocKy}`
            }).font = { 'bold': true };

            let tableTotalCurrent = 0, tableTotalPaid = 0, tableTotalCurrentMoney = 0, tableTotalPaidMoney = 0,
                groupLoaiHinh = listTransaction.groupBy('tenLoaiHinhDaoTao'),
                index = 3;

            Object.keys(groupLoaiHinh).forEach(loaiHinh => {
                thongKe.addRow({
                    label: loaiHinh !== 'null' ? loaiHinh : 'Loại hình đào tạo (trống)',
                    totalCurrent: groupLoaiHinh[loaiHinh].length,
                });


                let groupNganh = groupLoaiHinh[loaiHinh].groupBy('tenNganh'),
                    loaiHinhTotalCurMoney = 0, loaiHinhTotalPaid = 0, loaiHinhTotalPaidMoney = 0;

                Object.keys(groupNganh).forEach(nganh => {

                    let money = groupNganh[nganh].reduce((result = {}, item = {}) => {
                        result.totalCurrentMoney += item.hocPhi;

                        if (item.congNo === 0) {
                            result.totalPaid++;
                        }
                        else result.totalUnPaidMoney += item.congNo;
                        return result;
                    }, {
                        totalCurrentMoney: 0,
                        totalUnPaidMoney: 0,
                        totalPaid: 0,
                    });

                    thongKe.addRow({
                        label: nganh !== 'null' ? nganh : 'Ngành đào tạo (trống)',
                        totalCurrent: groupNganh[nganh].length,
                        totalCurrentMoney: money.totalCurrentMoney,
                        totalPaidMoney: money.totalCurrentMoney - money.totalUnPaidMoney,
                        totalPaid: money.totalPaid,

                    });

                    loaiHinhTotalCurMoney += money.totalCurrentMoney;
                    loaiHinhTotalPaid += money.totalPaid;
                    loaiHinhTotalPaidMoney += money.totalCurrentMoney - money.totalUnPaidMoney;

                    tableTotalCurrent += groupNganh[nganh].length;
                });

                tableTotalCurrentMoney += loaiHinhTotalCurMoney;
                tableTotalPaid += loaiHinhTotalPaid;
                tableTotalPaidMoney += loaiHinhTotalPaidMoney;

                thongKe.getRow(index).font = { 'bold': true };
                thongKe.getRow(index).getCell('totalCurrentMoney').value = loaiHinhTotalCurMoney;
                thongKe.getRow(index).getCell('totalPaid').value = loaiHinhTotalPaid;
                thongKe.getRow(index).getCell('totalPaidMoney').value = loaiHinhTotalPaidMoney;

                index += Object.keys(groupNganh).length + 1;
            });

            thongKe.getRow(2).getCell('totalCurrent').value = tableTotalCurrent;
            thongKe.getRow(2).getCell('totalCurrentMoney').value = tableTotalCurrentMoney;
            thongKe.getRow(2).getCell('totalPaid').value = tableTotalPaid;
            thongKe.getRow(2).getCell('totalPaidMoney').value = tableTotalPaidMoney;

            let fileName = `HOC_PHI_NH_${settings.hocPhiNamHoc}_${parseInt(settings.hocPhiNamHoc) + 1}_HK${settings.hocPhiHocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    // //Email notify -------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/finance/email-nhac-nho', app.permission.check('tcHocPhi:write'), async (req, res) => {
    //     try {
    //         const config = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'email', 'emailPassword', 'hocPhiEmailNhacNhoTitle', 'hocPhiEmailNhacNhoEditorHtml', 'hocPhiEmailNhacNhoEditorText'),
    //             { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = config;
    //         let data = await app.model.tcHocPhi.getAll({
    //             statement: 'namHoc = :namHoc AND hocKy = :hocKy AND congNo > 0',
    //             parameter: { namHoc, hocKy }
    //         });
    //         if (!data || !data.length) throw 'Không tìm thấy dữ liệu sinh viên nợ';
    //         data = data.map(item => ({ ...item, email: `${item.mssv}@hcmussh.edu.vn` }));
    //         let listEmail = data.map(item => item.email);

    //         let i = 0;
    //         while (data.length) {
    //             const item = data[i];
    //             let mailTitle = config.hocPhiEmailNhacNhoTitle.replaceAll('{nam_hoc}', `${namHoc} - ${parseInt(namHoc) + 1}`)
    //                 .replaceAll('{hoc_ky}', hocKy)
    //                 .replaceAll('{ho_ten}', item.hoTen)
    //                 .replaceAll('{mssv}', item.mssv)
    //                 .replaceAll('{cong_no}', item.congNo)
    //                 ,
    //                 mailText = config.hocPhiEmailNhacNhoEditorText.replaceAll('{nam_hoc}', `${namHoc} - ${parseInt(namHoc) + 1}`)
    //                     .replaceAll('{hoc_ky}', hocKy)
    //                     .replaceAll('{ho_ten}', item.hoTen)
    //                     .replaceAll('{mssv}', item.mssv)
    //                     .replaceAll('{cong_no}', item.congNo),
    //                 mailHtml = config.hocPhiEmailNhacNhoEditorHtml.replaceAll('{nam_hoc}', `${namHoc} - ${parseInt(namHoc) + 1}`)
    //                     .replaceAll('{hoc_ky}', hocKy)
    //                     .replaceAll('{ho_ten}', item.hoTen)
    //                     .replaceAll('{mssv}', item.mssv)
    //                     .replaceAll('{cong_no}', item.congNo);
    //             await app.email.normalSendEmail(config.email, config.emailPassword, '', '', listEmail.splice(0, 50), mailTitle, mailText, mailHtml);
    //         }
    //         res.send({ data });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });

    const countGroupBy = (array, key) => {
        let data = array.groupBy(key);
        Object.keys(data).forEach(item => {
            data[item] = data[item].length;
        });
        return data;
    };

    app.get('/api/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            let mssv = req.params.mssv,
                { namHoc, hocKy } = req.query;
            namHoc = parseInt(namHoc);
            hocKy = parseInt(hocKy);
            if (!mssv || !Number.isInteger(namHoc) || !Number.isInteger(hocKy)) throw { errorMessage: 'Dữ liệu học phí không hợp lệ' };
            const hocPhi = await app.model.tcHocPhi.get({ mssv, hocKy, namHoc });
            if (!hocPhi) throw { errorMessage: 'Không tìm thấy dữ liệu học phí' };
            res.send({ hocPhi });
        } catch (error) {
            res.send({ error });
        }
    });

    //Statistic -------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/statistic', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let filter = app.parse(req.query.filter, {});
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }
            filter = app.stringify(filter);
            const data = await app.model.tcHocPhi.getStatistic(filter);

            let dataByStudents = data.rows,
                dataTransactions = data.transactions;
            let dataByDate = dataTransactions.map(item => ({ ...item, 'date': app.date.viDateFormat(new Date(Number(item.ngayDong))) }));
            let totalStudents = dataByStudents.length,
                totalByDate = countGroupBy(dataByDate, 'date'),
                totalTransactions = dataTransactions.length,
                totalCurrentMoney = dataTransactions.reduce((sum, item) => sum + parseInt(item.khoanDong), 0),
                amountByDepartment = countGroupBy(dataTransactions, 'tenNganh'),
                amountByBank = countGroupBy(dataTransactions, 'nganHang'),
                amountByEduLevel = countGroupBy(dataByStudents, 'tenBacDaoTao'),
                amountByEduMethod = countGroupBy(dataByStudents, 'loaiHinhDaoTao'),
                amountPaid = dataByStudents.filter(item => item.congNo == 0).length,
                amountNotPaid = totalStudents - amountPaid;
            const statistic = { totalStudents, totalTransactions, amountByBank, amountByEduLevel, amountByEduMethod, amountPaid, amountNotPaid, totalCurrentMoney, amountByDepartment, totalByDate };
            res.send({ statistic, settings });
        } catch (error) {
            res.send({ error });
        }


    });

};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5005: { title: 'Danh sách giao dịch', link: '/user/finance/danh-sach-giao-dich' },
        },
    };

    app.permissionHooks.add('staff', 'addRolesTcGiaoDich', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:export', 'tcGiaoDich:write');
            resolve();
        } else resolve();
    }));

    app.permission.add(
        { name: 'tcGiaoDich:write', menu }, 'tcGiaoDich:export', 'tcGiaoDich:manage', 'tcGiaoDich:check'
    );

    app.get('/user/finance/danh-sach-giao-dich', app.permission.check('tcGiaoDich:write'), app.templates.admin);


    app.get('/api/finance/danh-sach-giao-dich/page/:pageNumber/:pageSize', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();
            const namHoc = filter.namHoc || settings.hocPhiNamHoc;
            const hocKy = filter.hocKy || settings.hocPhiHocKy;
            filter.tuNgay = filter.tuNgay || '';
            filter.denNgay = filter.denNgay || '';
            const filterData = app.utils.stringify({ ...filter, namHoc, hocKy });
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcHocPhiTransaction.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter, settings: { namHoc, hocKy } }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/danh-sach-giao-dich/list-ngan-hang', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            const searchTerm = req.query.condition;
            const list = await app.model.tcHocPhiTransaction.listBank(searchTerm || '');
            res.send({ items: list.rows.map(item => item.bank) });
        } catch (error) {
            res.send({ error });
        }
    });

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    app.get('/api/finance/danh-sach-giao-dich/download-psc', app.permission.check('tcGiaoDich:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter, {});
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }

            const tuNgay = filter.tuNgay && parseInt(filter.tuNgay),
                denNgay = filter.denNgay && parseInt(filter.denNgay);
            filter = app.utils.stringify(filter, '');
            let data = await app.model.tcHocPhiTransaction.downloadPsc(filter);
            const list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet(`${settings.hocPhiNamHoc}_${settings.hocPhiHocKy}`);
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'Mssv', key: 'mssv', width: 15 },
                { header: 'Họ Tên', key: 'hoTen', width: 30 },
                { header: 'Ngày hóa đơn', key: 'ngayHoaDon', width: 30 },
                { header: 'Số tiền', key: 'soTien', width: 30 },
                { header: 'Khoa', key: 'khoa', width: 30 },
                { header: 'Hệ', key: 'he', width: 30 },
                { header: 'Ngành', key: 'nganh', width: 30 },
                { header: 'Khóa', key: 'khoas', width: 30 },
                { header: 'Số series', key: 'soSeries', width: 30 },
                { header: 'Số hóa đơn', key: 'soHoaDon', width: 30 },
                { header: 'Học kỳ', key: 'hocKy', width: 30 },
                { header: 'Năm học', key: 'namHoc', width: 30 },
                { header: 'Nội dung thu', key: 'noiDungThu', width: 30 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };
            list.filter(item => (!Number.isInteger(tuNgay) || parseInt(item.ngayDong) >= tuNgay) && (!Number.isInteger(denNgay) || parseInt(item.ngayDong) <= denNgay)).forEach((item, index) => {
                const ngayDong = item.ngayDong ? new Date(Number(item.ngayDong)) : null;
                ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(index + 2).font = { name: 'Times New Roman' };
                ws.getCell('A' + (index + 2)).value = index + 1;
                ws.getCell('B' + (index + 2)).value = item.mssv;
                ws.getCell('C' + (index + 2)).value = `${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`.trim();
                ws.getCell('D' + (index + 2)).value = ngayDong ? app.date.dateTimeFormat(ngayDong, 'dd/mm/yyyy') : '';
                ws.getCell('E' + (index + 2)).value = item.khoanDong.toString().numberDisplay();
                ws.getCell('F' + (index + 2)).value = item.tenKhoa;
                ws.getCell('G' + (index + 2)).value = item.tenLoaiHinhDaoTao;
                ws.getCell('H' + (index + 2)).value = item.tenNganh;
                ws.getCell('I' + (index + 2)).value = item.namTuyenSinh || '';
                ws.getCell('J' + (index + 2)).value = `${item.nganHang}/${ngayDong ? `${('0' + (ngayDong.getMonth() + 1)).slice(-2)}${ngayDong.getFullYear().toString().slice(-2)}` : ''}`;
                ws.getCell('K' + (index + 2)).value = ('000000' + item.R).slice(-7);
                ws.getCell('L' + (index + 2)).value = 'HK0' + settings.hocPhiHocKy;
                ws.getCell('M' + (index + 2)).value = `${settings.hocPhiNamHoc} - ${parseInt(settings.hocPhiNamHoc) + 1}`;
                ws.getCell('N' + (index + 2)).value = `Tạm thu học phí học kỳ 1 NH${settings.hocPhiNamHoc}-${parseInt(settings.hocPhiNamHoc) + 1}`;
            });
            let fileName = `HOC_PHI_NH_${settings.hocPhiNamHoc}_${parseInt(settings.hocPhiNamHoc) + 1}_HK${settings.hocPhiHocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.status(401).send({ error });
        }
    });


    app.post('/api/finance/danh-sach-giao-dich', app.permission.check('tcGiaoDich:check'), async (req, res) => {
        try {
            let { soTien, sinhVien, namHoc, hocKy, ghiChu } = req.body;
            soTien = parseInt(soTien);
            hocKy = parseInt(hocKy);
            namHoc = parseInt(namHoc);
            if (!Number.isInteger(soTien) || !Number.isInteger(soTien) || !Number.isInteger(soTien) || !sinhVien)
                throw 'Dữ liệu không hợp lệ.';
            const hocPhi = await app.model.tcHocPhi.get({ mssv: sinhVien, namHoc, hocKy });
            if (!hocPhi) throw 'Dữ liệu học phí sinh viên không tồn tại.';
            if (!hocPhi.congNo) throw 'Sinh viên không có công nợ.';
            const timeStamp = new Date().getTime();
            const manualTransid = `${sinhVien}-${timeStamp}`;
            const result = await app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, '', manualTransid, timeStamp, sinhVien, '', '', soTien, '');
            //: (namhoc, hocky, ebank, transid, transdate, customerid, billid, serviceid, eamount, echecksum, done)
            if (!result?.outBinds?.ret)
                throw {};

            await app.model.tcHocPhiTransaction.update({ transId: manualTransid }, { ghiChu });

            await app.model.tcHocPhiLog.create({
                namHoc, hocKy,
                mssv: sinhVien,
                email: req.session.user.email,
                thaoTac: 'c',
                ngay: timeStamp,
                duLieuCu: app.utils.stringify({}),
                duLieuMoi: app.utils.stringify({ hocPhi: `${soTien}`, transId: manualTransid })
            });

            res.end();
        } catch (error) {
            res.send({ error });
        }

    });
    //app.permission.check('tcGiaoDich:cancel'),
    app.post('/api/finance/danh-sach-giao-dich/huy', app.permission.orCheck('tcGiaoDich:cancel'), async (req, res) => {
        try {
            let { ghiChu, transId } = req.body;
            let email = req.session.user.email;
            if (!email) {
                return res.send({ error: 'Không thể thực hiện hủy giao dịch.' });
            }

            const giaoDich = await app.model.tcHocPhiTransaction.get({ transId });
            if (!giaoDich) {
                return res.send({ error: 'Dữ liệu không hợp lệ.' });
            }
            if (giaoDich.status == 0) {
                return res.send({ error: 'Giao dịch đã được hủy trước đó.' });
            }

            const hocPhi = await app.model.tcHocPhi.get({ mssv: giaoDich.customerId, namHoc: giaoDich.namHoc, hocKy: giaoDich.hocKy });
            if (!hocPhi) {
                return res.send({ error: 'Dữ liệu không hợp lệ.' });
            }

            await app.model.tcHocPhiTransaction.update({ transId }, { ghiChu, status: 0 });

            const soTien = parseInt(hocPhi.congNo) + parseInt(giaoDich.amount);
            await app.model.tcHocPhi.update({ mssv: hocPhi.mssv, namHoc: hocPhi.namHoc, hocKy: hocPhi.hocKy }, { congNo: soTien });

            await app.model.tcHocPhiLog.create({
                namhoc: hocPhi.namHoc, hocKy: hocPhi.hocKy,
                mssv: hocPhi.mssv,
                email: email,
                thaoTac: 'd',
                ngay: new Date().getTime(),
                duLieuCu: app.utils.stringify({ congNo: `${hocPhi.congNo}`, transId: transId }),
                duLieuMoi: app.utils.stringify({ congNo: `${soTien}` })
            });

            res.end();
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/finance/danh-sach-giao-dich/stat', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            // let condition = {
            //     statement: '( (maPl = :maPl OR ma = 33 OR ma = 32) AND kichHoat = 1 )',
            //     paramater: { maPl: 1 }
            // };
            let data = app.utils.parse(req.query.data);

            // const soLoaiPhi = data.loaiPhi.split(',').length;
            const initNhomNganh = async (list) => {
                await Promise.all(list.map(async item => {
                    const nganh = await app.model.tcNhomNganh.getAll({ nhom: item.id }, '*', 'id');
                    if (!nganh.length) {
                        item.subItem = await app.model.tcNhom.getAll({ nhomCha: item.id }, '*', 'heSo');
                        await initNhomNganh(item.subItem);
                    } else {
                        item.subItem = nganh;
                        nganh.forEach(async item => {
                            const statistic = await app.model.tcLoaiPhi.getStatistic(app.utils.stringify({ ...data, nganh: item.nganh }));
                            const transactionStatistic = await app.model.tcHocPhiTransaction.getStatistic(app.utils.stringify({ ...data, nganh: item.nganh }));
                            item.statistic = statistic;
                            item.transactionStatistic = transactionStatistic.outBinds;
                        });
                    }
                }));
            };
            const list = await app.model.tcNhom.getAll({ hocKy: data.hocKy, namHoc: data.namHoc, nhomCha: null }, '*', 'heSo');
            await initNhomNganh(list);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thống kê');
            const addedHeader = [];
            const writeExcel = async (list, config, ws) => {
                for (const item of list) {
                    if (item.subItem) {
                        formatHeader(config.index);
                        ws.getCell(`A${config.index}`).value = item.ten;
                        config.index++;
                        await writeExcel(item.subItem, config, ws);
                        config.index++;
                    } else {
                        const nganh = await app.model.dtNganhDaoTao.get({ maNganh: item.nganh });
                        ws.getCell(`A${config.index}`).value = nganh.tenNganh;
                        ws.getCell(`B${config.index}`).value = item.statistic.tongsinhvien;
                        ws.getCell(`C${config.index}`).value = item.statistic.tongsinhviendadong;
                        ws.getCell(`D${config.index}`).value = item.transactionStatistic.tongsogiaodich;
                        ws.getCell(`E${config.index}`).value = item.transactionStatistic.ret;
                        let currentColumn = 'F';
                        for (const statItem of item.statistic.rows) {
                            if (!addedHeader.some(header => statItem.loaiPhi == header.key)) {
                                addedHeader.push({ key: statItem.loaiPhi, column: currentColumn });
                                addHeader({ columns: [{ text: 'Số lượng' }, { text: 'Đã đóng' }, { text: 'Số tiền' }], main: { text: statItem.ten } }, ws, currentColumn);
                                currentColumn = String.fromCharCode(currentColumn.charCodeAt() + 3);
                            }
                            const header = addedHeader.find(header => header.key == statItem.loaiPhi);
                            ws.getCell(`${header.column}${config.index}`).value = statItem.soLuong;
                        }
                        item.statistic.dadong.forEach(statItem => {
                            const header = addedHeader.find(header => header.key == statItem.loaiPhi);
                            ws.getCell(`${String.fromCharCode(header.column.charCodeAt() + 1)}${config.index}`).value = statItem.soLuong;
                            ws.getCell(`${String.fromCharCode(header.column.charCodeAt() + 2)}${config.index}`).value = statItem.soTien;
                        });
                        config.index++;
                    }
                }
            };
            const formatHeader = (index) => {
                ws.getRow(index).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(index).font = {
                    name: 'Times New Roman',
                    family: 4,
                    size: 12,
                    bold: true,
                    color: { argb: 'FF000000' }
                };
            };
            const addHeader = (columnConfig, ws, startAt) => {
                ws.mergeCells(`${startAt}1:${String.fromCharCode(startAt.charCodeAt() + columnConfig.columns.length - 1)}1`);
                ws.getCell(`${startAt}1`).value = columnConfig.main.text;
                columnConfig.columns.forEach((column, index) => {
                    ws.getCell(`${String.fromCharCode(startAt.charCodeAt() + index)}2`).value = column.text;
                });
            };
            ws.columns = [
                { header: 'Hệ', key: 'stt', width: 35 },
                { header: 'TQSL', key: 'TQSL', width: 10 },
                { header: 'TQDD', key: 'TQDD', width: 10 },
            ];
            formatHeader(1);
            formatHeader(2);
            ws.mergeCells('A1:A2');
            ws.getCell('A1').value = 'HỆ';
            ws.mergeCells('B1:C1');
            ws.getCell('B1').value = 'Tổng quan';
            ws.getCell('B2').value = 'số lượng';
            ws.getCell('C2').value = 'Đã đóng';
            addHeader({ columns: [{ text: 'So lượng' }, { text: 'So tiền' }], main: { text: 'Giao dich' } }, ws, 'D');
            await writeExcel(list, { index: 3 }, ws);
            let fileName = 'Thống kê.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.send({ error });
        }
    });


    app.assignRoleHooks.addRoles('tcThemGiaoDich', { id: 'tcGiaoDich:check', text: 'Quản lý giao dịch: Thêm giao dịch' });

    app.assignRoleHooks.addHook('tcThemGiaoDich', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'tcThemGiaoDich' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('tcThemGiaoDich').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleQuanLyThemGiaoDich', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:manage', 'tcGiaoDich:check', 'tcGiaoDich:cancel');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyThemGiaoDich', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tcThemGiaoDich');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tcGiaoDich:check') {
                app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:check');
            }
        });
        resolve();
    }));

    app.assignRoleHooks.addRoles('tcHuyGiaoDich', { id: 'tcGiaoDich:cancel', text: 'Quản lý giao dịch: Hủy giao dịch' });

    app.assignRoleHooks.addHook('tcHuyGiaoDich', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'tcHuyGiaoDich' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('tcHuyGiaoDich').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyHuyGiaoDich', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tcHuyGiaoDich');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tcGiaoDich:cancel') {
                app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:cancel');
            }
        });
        resolve();
    }));
};
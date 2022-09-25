module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5005: { title: 'Danh sách giao dịch', link: '/user/finance/danh-sach-giao-dich' },
        },
    };

    app.permissionHooks.add('staff', 'addRolesTcGiaoDich', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:read', 'tcGiaoDich:export', 'tcGiaoDich:write');
            resolve();
        } else resolve();
    }));

    app.permission.add({ name: 'tcGiaoDich:read', menu }, 'tcGiaoDich:export', 'tcGiaoDich:write', 'tcGiaoDich:check');

    app.get('/user/finance/danh-sach-giao-dich', app.permission.check('tcGiaoDich:read'), app.templates.admin);


    app.get('/api/finance/danh-sach-giao-dich/page/:pageNumber/:pageSize', app.permission.check('tcGiaoDich:read'), async (req, res) => {
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

    app.get('/api/finance/danh-sach-giao-dich/list-ngan-hang', app.permission.check('tcGiaoDich:read'), async (req, res) => {
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
            
            await app.model.tcHocPhiTransaction.update({transId: manualTransid}, {ghiChu});
                
            await app.model.tcHocPhiLog.create({
                namHoc, hocKy,
                mssv: sinhVien,
                email: req.session.user.email,
                thaoTac: 'c',
                ngay: timeStamp,
                duLieuCu: app.utils.stringify({}),
                duLieuMoi: app.utils.stringify({ hocPhi: `${soTien}`, transId: manualTransid })
            });

            res.send();
        } catch (error) {
            res.send({ error });
        }

    });
//app.permission.check('tcGiaoDich:cancel'),
    app.post('/api/finance/danh-sach-giao-dich/huy',  async (req, res) => {
        try {
            let {ghiChu, transId } = req.body;
            const giaoDich = await app.model.tcHocPhiTransaction.get({transId});
            if (!giaoDich) throw 'Dữ liệu không hợp lệ.';
            const hocPhi = await app.model.tcHocPhi.get({ mssv: giaoDich.customerId, namHoc: giaoDich.namHoc, hocKy: giaoDich.hocKy });
            if (!hocPhi) throw 'Dữ liệu không hợp lệ.';
            await app.model.tcHocPhiTransaction.update({transId}, {ghiChu, status: 0});
            let soTien = hocPhi.congNo + giaoDich.amount;
            await app.model.tcHocPhi.update({mssv: hocPhi.mssv, namHoc: hocPhi.namHoc, hocKy: hocPhi.hocKy}, {congNo: soTien});
            const timeStamp = new Date().getTime();
            await app.model.tcHocPhiLog.create({
                namhoc: hocPhi.namHoc, hocKy: hocPhi.hocKy,
                mssv: hocPhi.mssv,
                email: req.session.user.email,
                thaoTac: 'd',
                ngay: timeStamp,
                duLieuCu: app.utils.stringify({ congNo: `${hocPhi.congNo}`, transId: transId }),
                duLieuMoi: app.utils.stringify({ congNo: `${soTien}`})
            });

            res.send();
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/finance/danh-sach-giao-dich/stat', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            let condition = {
                statement: '( (maPl = :maPl OR ma = 33 OR ma = 32) AND kichHoat = 1 )',
                paramater: { maPl: 1 }
            };
            let data = app.utils.parse(req.query.data);
            const soLoaiPhi = data.loaiPhi.split(',').length;

            let result = await app.model.dmDonVi.getAll(condition, 'ma,ten', 'ma');
            result = await Promise.all(result.map(async khoa => ({ ...khoa, nganh: await app.model.dtNganhDaoTao.getAll({ kichHoat: 1, khoa: khoa.ma }, 'maNganh, tenNganh') })));
            result = result.filter(khoa => khoa.nganh.length > 0);
            await Promise.all(result.map((khoa) => Promise.all(khoa.nganh.map(async (nganh) => {
                nganh.statistic = await app.model.tcLoaiPhi.getStatistic(app.utils.stringify({ nganh: nganh.maNganh, ...data }));
                nganh.statistic = nganh.statistic.rows;
                nganh.transactionStatistic = await app.model.tcHocPhiTransaction.getStatistic(app.utils.stringify({ nganh: nganh.maNganh, ...data }));
                nganh.transactionStatistic = nganh.transactionStatistic.outBinds;
            }))));
            const all = await app.model.tcLoaiPhi.getStatistic(app.utils.stringify(data));
            const allTransaction = await app.model.tcHocPhiTransaction.getStatistic(app.utils.stringify(data));
            result.splice(0, 0, { ten: 'Tổng quát', nganh: [{ tenNganh: '', statistic: all.rows || [], transactionStatistic: allTransaction.outBinds }], });
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thống kê');
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };
            let index = 1;
            for (const khoa of result) {

                ws.getCell('A' + (index)).value = khoa.ten;
                ws.getCell('A' + (++index)).value = 'Ngành';
                ws.getCell(`B${index}`).value = 'Loại phí';
                ws.getCell(`C${index}`).value = 'Số lượng dự kiến';
                ws.getCell(`D${index}`).value = 'Số tiền dự kiến';
                ws.getCell(`E${index}`).value = 'Số lượng đã đóng';
                ws.getCell(`F${index}`).value = 'Số tiền đã đóng';
                ws.getCell(`G${index}`).value = 'Số lượng giao dịch';
                ws.getCell(`H${index++}`).value = 'Số tiền giao dịch';
                khoa.nganh.forEach((nganh, i) => {
                    ws.mergeCells(`A${index + soLoaiPhi * i}:A${index + soLoaiPhi * (i + 1) - 1}`);
                    ws.mergeCells(`G${index + soLoaiPhi * i}:G${index + soLoaiPhi * (i + 1) - 1}`);
                    ws.mergeCells(`H${index + soLoaiPhi * i}:H${index + soLoaiPhi * (i + 1) - 1}`);
                    ws.getCell(`A${index + soLoaiPhi * i}`).value = nganh.tenNganh;
                    console.log(nganh);
                    ws.getCell(`G${index + soLoaiPhi * i}`).value = nganh.transactionStatistic.tongsogiaodich;
                    ws.getCell(`H${index + soLoaiPhi * i}`).value = nganh.transactionStatistic.ret || 0;


                    nganh.statistic.forEach((item, k) => {
                        ws.getCell(`B${index + soLoaiPhi * i + k}`).value = item.ten;
                        ws.getCell(`C${index + soLoaiPhi * i + k}`).value = item.soLuongDuKien;
                        ws.getCell(`D${index + soLoaiPhi * i + k}`).value = item.soTienDuKien;
                        ws.getCell(`E${index + soLoaiPhi * i + k}`).value = item.soLuongDaDong;
                        ws.getCell(`F${index + soLoaiPhi * i + k}`).value = item.soTienDaDong;
                    });
                });
                index += khoa.nganh.length * soLoaiPhi + 2;
            }

            let fileName = 'Thống kê.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};
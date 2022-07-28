module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5005: { title: 'Danh sách giao dịch', link: '/user/finance/danh-sach-giao-dich' },
        },
    };

    app.permissionHooks.add('staff', 'addRolesTcGiaoDich', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:read');
            resolve();
        } else resolve();
    }));

    app.permission.add({ name: 'tcGiaoDich:read', menu }, 'tcGiaoDich:export');
    app.get('/user/finance/danh-sach-giao-dich', app.permission.check('tcGiaoDich:read'), app.templates.admin);


    app.get('/api/finance/danh-sach-giao-dich/page/:pageNumber/:pageSize', app.permission.check('tcGiaoDich:read'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();
            const namHoc = filter.namHoc || settings.hocPhiNamHoc;
            const hocKy = filter.hocKy || settings.hocPhiHocKy;
            filter.tuNgay = filter.tuNgay || '';
            filter.denNgay = filter.denNgay || '';
            const filterData = app.stringify({ ...filter, namHoc, hocKy });
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
            let filter = app.parse(req.query.filter, {});
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }

            const tuNgay = filter.tuNgay && parseInt(filter.tuNgay),
                denNgay = filter.denNgay && parseInt(filter.denNgay);
            filter = app.stringify(filter, '');
            let data = await app.model.tcHocPhiTransaction.downloadPsc(filter);
            const list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet(`${settings.hocPhiNamHoc}_${settings.hocPhiHocKy}`);
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ TÊN', key: 'ho', width: 30 },
                { header: 'Ngày hóa đơn', key: 'ngatHoaDon', width: 30 },
                { header: 'Số tiền', key: 'soTien', width: 30 },
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
                ws.getCell('C' + (index + 2)).value = `${item.ho.toUpperCase()} ${item.ten.toUpperCase()}`.trim();
                ws.getCell('D' + (index + 2)).value = ngayDong ? app.date.dateTimeFormat(ngayDong, 'dd/mm/yyyy') : '';
                ws.getCell('E' + (index + 2)).value = item.khoanDong.toString().numberDisplay();
                ws.getCell('F' + (index + 2)).value = `${item.nganHang}/${ngayDong ? `${('0' + (ngayDong.getMonth() + 1)).slice(-2)}${ngayDong.getFullYear().toString().slice(-2)}` : ''}`;
                ws.getCell('G' + (index + 2)).value = ('000000' + item.R).slice(-7);
                ws.getCell('H' + (index + 2)).value = 'HK0' + settings.hocPhiHocKy;
                ws.getCell('I' + (index + 2)).value = `${settings.hocPhiNamHoc} - ${parseInt(settings.hocPhiNamHoc) + 1}`;
                ws.getCell('J' + (index + 2)).value = `Tạm thu học phí học kỳ 1 NH${settings.hocPhiNamHoc}-${parseInt(settings.hocPhiNamHoc) + 1}`;
            });
            let fileName = `HOC_PHI_NH_${settings.hocPhiNamHoc}_${parseInt(settings.hocPhiNamHoc) + 1}_HK${settings.hocPhiHocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            res.send({ error });
        }
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5003: { title: 'Học phí', link: '/user/finance/hoc-phi' },
        },
    };

    app.permission.add(
        { name: 'tcHocPhi:read', menu }, 'tcHocPhi:write', 'tcHocPhi:delete',
    );

    app.get('/user/finance/hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/hoc-phi', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/import-hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);

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

    app.get('/api/finance/hoc-phi-transactions/:mssv', app.permission.orCheck('tcHocPhi:read'), async (req, res) => {
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

    app.get('/api/finance/huong-dan-dong-hoc-phi', app.permission.orCheck('tcHocPhi:read', 'student:login'), async (req, res) => {
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

    app.get('/api/finance/hoc-phi/download-template', app.permission.check('tcHocPhi:write'), async (req, res) => {
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

};
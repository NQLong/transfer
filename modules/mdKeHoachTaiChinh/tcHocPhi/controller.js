module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5002: { title: 'Học phí', link: '/user/finance/hoc-phi' },
        },
    };
    app.permission.add(
        { name: 'tcHocPhi:read', menu },
        { name: 'tcHocPhi:write' },
        { name: 'tcHocPhi:delete' },
    );

    app.get('/user/finance/hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/import-hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    //APIs----------------------------------------------------------------------------------
    app.get('/api/finance/page/:pageNumber/:pageSize', app.permission.check('tcHocPhi:read'), async (req, res) => {
        let { pageNumber, pageSize } = req.params;
        let searchTerm = `%${req.query.searchTerm || ''}%`;
        const { namHoc, hocKy } = await getTerm();
        let filter = app.stringify(app.clone(req.query.filter || {}, { namHoc, hocKy }), '');
        app.model.tcHocPhi.searchPage(parseInt(pageNumber), parseInt(pageSize), searchTerm, filter, (error, page) => {
            if (error || !page) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({
                    page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }
                });
            }
        });
    });

    app.get('/api/finance/hoc-phi-transactions/:mssv', app.permission.check('tcHocPhi:read'), async (req, res) => {
        const { namHoc, hocKy } = await getTerm(),
            mssv = req.params.mssv;
        app.model.fwStudents.get({ mssv }, (error, sinhVien) => {
            if (error) res.send({ error });
            else if (!sinhVien) res.send({ error: 'Sinh viên không tồn tại' });
            else {
                app.model.tcHocPhiTransaction.getAll({
                    customerId: mssv, hocKy, namHoc
                }, (error, items) => res.send({ error, items, sinhVien, hocKy, namHoc }));
            }
        });
    });


    //Hook upload -----------------------------------------------------------------------------------------
    app.uploadHooks.add('TcHocPhiData', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcHocPhiImportData(fields, files, done), done, 'tcHocPhi:write')
    );

    const getTerm = async () =>
        await app.model.tcSetting.getValue(['namHoc', 'hocKy']);


    const tcHocPhiImportData = async (fields, files, done) => {
        const { namHoc, hocKy } = await getTerm();
        let worksheet = null;
        console.log(done);
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcHocPhiData' && files.TcHocPhiData && files.TcHocPhiData.length) {
                const srcPath = files.TcHocPhiData[0].path;
                const workbook = app.excel.create();
                workbook.xlsx.readFile(srcPath).then(() => {
                    app.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    worksheet ? resolve() : reject('Invalid excel file!');
                });
            }
        }).then(() => {
            const items = [];
            const init = (index = 2) => {
                if (!worksheet.getCell('A' + index).value) {
                    done({ items, term: { namHoc, hocKy } });
                    return;
                } else {
                    const mssv = worksheet.getCell('A' + index).value?.toString().trim() || '';
                    //TODO: check mssv
                    // const profile = await app.model.dmKhenThuongLoaiDoiTuong.getAll((error, items) => resolve((items || []).map(item => item.ma + ':' + item.ten))));
                    if (!mssv) {
                        init(index + 1);
                        return;
                    }
                    const hocPhi = worksheet.getCell('B' + index).value;
                    const congNo = worksheet.getCell('C' + index).value;
                    const row = {
                        mssv: mssv,
                        hocPhi: hocPhi,
                        congNo: congNo,
                    };
                    items.push(row);
                    init(index + 1);
                }
            };
            init();
        });
    };

    app.get('/api/finance/hoc-phi/download-template', app.permission.check('tcHocPhi:write'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Hoc_phi_Template');
        const defaultColumns = [
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'HỌC PHÍ', key: 'hocPhi', width: 25, style: { numFmt: '###,###' } },
            { header: 'CÔNG NỢ', key: 'congNo', width: 25, style: { numFmt: '###,###' } },
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        app.excel.attachment(workBook, res, 'Hoc_phi_Template.xlsx');
    });
};
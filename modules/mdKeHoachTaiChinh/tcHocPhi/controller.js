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
        const { namHoc, hocKy } = await app.model.tcSetting.getValue(['namHoc', 'hocKy']);
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
        const { namHoc, hocKy } = await app.model.tcSetting.getValue(['namHoc', 'hocKy']),
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
    app.uploadHooks.add('TcHocPhiImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcHocPhiImportData(fields, files, done), done, 'tcHocPhi:write'));

    const tcHocPhiImportData = (fields, files, done) => {
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
            // let data = [];
            // const init = (index = 2) => {
            //     if (!worksheet.getCell('A' + index).value) return;
            //     else {
            //         let row = {
            //             mssv: worksheet.getCell('A' + index).value?.toString().trim() || '',
            //             hocPhi: worksheet.getCell('B' + index).value?.toString(),
            //             congNo: worksheet.getCell('C' + index).value,
            //         };
            //     }
            // };  
        });
    };
};
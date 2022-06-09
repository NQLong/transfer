module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5002: { title: 'Học phí', link: '/user/finance/hoc-phi' },
        },
    };
    const menuStudent = {
        parentMenu: app.parentMenu.user,
        menus: {
            1098: { title: 'Học phí', link: '/user/hoc-phi' },
        },
    };
    app.permission.add({ name: 'tcHocPhi:read', menu }, { name: 'student:login', menu: menuStudent }, 'tcHocPhi:write', 'tcHocPhi:delete');

    app.get('/user/finance/hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/hoc-phi', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/import-hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/page/:pageNumber/:pageSize', app.permission.orCheck('tcHocPhi:read', 'student:login'), async (req, res) => {
        let { pageNumber, pageSize } = req.params;
        let searchTerm = `%${req.query.searchTerm || ''}%`;
        let namHoc = req.query?.settings?.namHoc;
        let hocKy = req.query?.settings?.hocKy;
        if (!namHoc || !hocKy) {
            const settings = await getSettings();
            if (!namHoc) namHoc = settings.hocPhiNamHoc;
            if (!hocKy) hocKy = settings.hocPhiHocKy;
        }
        let filter = app.stringify(app.clone(req.query.filter || {}, { namHoc, hocKy }), '');
        let mssv = '';
        if (!req.session.user.permissions.includes('tcHocPhi:read')) mssv = req.session.user.data.mssv;

        app.model.tcHocPhi.searchPage(parseInt(pageNumber), parseInt(pageSize), mssv, searchTerm, filter, (error, page) => {
            if (error || !page) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({
                    page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, settings: { namHoc, hocKy } }
                });
            }
        });
    });

    app.get('/api/finance/hoc-phi-transactions/:mssv', app.permission.check('tcHocPhi:read'), async (req, res) => {
        const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await getSettings(),
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

    app.put('/api/finance/hoc-phi', app.permission.check('tcHocPhi:write'), (req, res) => {
        const { item: { mssv, namHoc, hocKy }, changes } = req.body;
        delete changes['congNo'];
        app.model.tcHocPhi.get({ mssv, namHoc, hocKy }, (error, item) => {
            if (!error && item) {
                const hocPhiCu = item.hocPhi;
                item.hocPhi = changes['hocPhi'];
                getCongNo(item, ({ congNo }) => {
                    changes['congNo'] = congNo;
                    app.model.tcHocPhi.update({ mssv }, changes, (error, item) => {
                        const logItem = {
                            mssv: mssv,
                            hocKy: hocKy,
                            namHoc: namHoc,
                            duLieuCu: JSON.stringify({ hocPhi: hocPhiCu }),
                            duLieuMoi: JSON.stringify({ hocPhi: item.hocPhi })
                        };
                        app.tcHocPhiSaveLog(req.session.user.email, 'U', logItem);
                        res.send({ error, item });
                    });
                });
            }
        });
    });

    app.post('/api/finance/hoc-phi/upload', app.permission.check('tcHocPhi:write'), async (req, res) => {
        const data = req.body.upload;
        const curFees = data.map(obj => obj.curFee);
        const tmpData = data.map(obj => {
            delete obj['congNo'];
            delete obj['hoTenSinhVien'];
            delete obj['curFee'];
            obj['ngayTao'] = Date.now();
            return obj;
        });
        if (tmpData && tmpData.length > 0) {
            let idx = 0;
            const setCongNo = (index) => {
                const item = data[index];
                if (!item) {
                    app.model.tcHocPhi.insertAndUpdate(tmpData, (err, result) => {
                        if (err) {
                            res.send({ error: err });
                        } else {
                            tmpData.forEach((item, idx) => {
                                const logItem = {
                                    mssv: item.mssv,
                                    hocKy: item.hocKy,
                                    namHoc: item.namHoc,
                                    duLieuCu: JSON.stringify({ hocPhi: curFees[idx] }),
                                    duLieuMoi: JSON.stringify({ hocPhi: item.hocPhi })
                                };
                                const cud = curFees[idx] >= 0 ? 'U' : 'C';
                                app.tcHocPhiSaveLog(req.session.user.email, cud, logItem);
                            });
                            res.send({ result });
                        }
                    });
                    return;
                }
                getCongNo(item, ({ congNo }) => {
                    item['congNo'] = congNo;
                    idx++;
                    setCongNo(idx);
                });
            };
            setCongNo(idx);
        } else {
            res.send({});
        }
    });

    const getCongNo = (item, done) => {
        const { mssv, hocKy, namHoc, hocPhi } = item;
        app.model.tcHocPhiTransaction.getAll({
            customerId: mssv, hocKy, namHoc
        }, (error, items) => {
            if (!error) {
                //calculate cong no
                const congNo = hocPhi - items.reduce((partialSum, item) => partialSum + parseInt(item.amount), 0);
                done({ congNo });
            }
        });
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
            const duplicateDatas = [];
            const init = (index = 2) => {
                if (!worksheet.getCell('A' + index).value) {
                    done({ items, duplicateDatas });
                    return;
                } else {
                    const namHoc = worksheet.getCell('A' + index).value;
                    const hocKy = (worksheet.getCell('B' + index).value || 'HK').replace('HK', '');
                    const hocPhi = worksheet.getCell('D' + index).value;
                    const mssv = worksheet.getCell('C' + index).value?.toString().trim() || '';
                    const row = { namHoc, hocKy, mssv, hocPhi };
                    if (!mssv) {
                        init(index + 1);
                        return;
                    }
                    let hoTenSinhVien = '';
                    //check MSSV
                    app.model.fwStudents.get({ mssv }, (error, item) => {
                        if (error || !item) {
                            items.push(row);
                            init(index + 1);
                        } else {
                            hoTenSinhVien = `${item.ho} ${item.ten}`;
                            let tmpRow = { ...row, hoTenSinhVien };
                            app.model.tcHocPhi.get({ mssv, namHoc, hocKy }, (error, item) => {
                                if (!error && item) {
                                    const { hocPhi: curFee } = item;
                                    tmpRow = { ...tmpRow, curFee };
                                    duplicateDatas.push(mssv);
                                }
                                items.push(tmpRow);
                                init(index + 1);
                            });

                        }
                    });
                }
            };
            init();
        });
    };

    const yearDatas = () => {
        return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
    };

    const termDatas = ['HK1', 'HK2', 'HK3'];

    app.get('/api/finance/hoc-phi/download-template', app.permission.check('tcHocPhi:write'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Hoc_phi_Template');
        const defaultColumns = [
            { header: 'NĂM HỌC', key: 'namHoc', width: 20 },
            { header: 'HỌC KỲ', key: 'hocKy', width: 20 },
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'HỌC PHÍ', key: 'hocPhi', width: 25, style: { numFmt: '###,###' } },
        ];
        ws.columns = defaultColumns;
        const { dataRange: years } = workBook.createRefSheet('NAM_HOC', yearDatas());
        const { dataRange: terms } = workBook.createRefSheet('HOC_KY', termDatas);
        const rows = ws.getRows(2, 1000);
        rows.forEach((row) => {
            row.getCell('namHoc').dataValidation = { type: 'list', allowBlank: true, formulae: [years] };
            row.getCell('hocKy').dataValidation = { type: 'list', allowBlank: true, formulae: [terms] };
        });
        app.excel.attachment(workBook, res, 'Hoc_phi_Template.xlsx');
    });
};
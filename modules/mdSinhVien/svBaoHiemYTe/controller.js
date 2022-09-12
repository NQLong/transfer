module.exports = app => {

    app.get('/api/student/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            const user = req.session.user,
                { mssv } = user.data;
            const item = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/student/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            const user = req.session.user,
                { mssv, emailTruong } = user.data,
                thoiGian = Date.now();
            const data = req.body.data;

            // temp
            const mapperDienDong = {
                12: 23,
                15: 41
            }, mapperSoTien = {
                15: 704025,
                12: 563220,
                0: 0
            };

            let currentBhyt = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
            if (currentBhyt) {
                if (new Date(currentBhyt.thoiGian).getFullYear() != new Date().getFullYear()) {
                    let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong }));
                    if (!item) res.send({ error: 'Lỗi hệ thống' });
                    else {
                        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                        if (mapperDienDong[data.dienDong]) {
                            app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong], ngayTao: thoiGian });
                            let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                            const { hocPhi, congNo } = currentFee;
                            app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                                hocPhi: parseInt(hocPhi) + mapperSoTien[data.dienDong],
                                congNo: parseInt(congNo) + mapperSoTien[data.dienDong],
                                ngayTao: thoiGian
                            });
                        }
                        res.end();
                    }
                } else res.send({ warning: 'Sinh viên đã đăng ký BHYT cho năm nay!' });
            } else {
                let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong }));
                if (!item) res.send({ error: 'Lỗi hệ thống' });
                else {
                    let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                    app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong] });
                    let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                    const { hocPhi, congNo } = currentFee;
                    app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                        hocPhi: parseInt(hocPhi) + mapperSoTien[data.dienDong],
                        congNo: parseInt(congNo) + mapperSoTien[data.dienDong],
                        ngayTao: thoiGian
                    });
                    res.end();
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/student/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user, curYear = new Date().getFullYear(), changes = req.body.changes;
            const item = await app.model.svBaoHiemYTe.get({ mssv: user.studentId, namDangKy: curYear });
            switch (parseInt(item.dienDong)) {
                case 0: {
                    let maBhxhHienTai = changes.maBhxhHienTai.toString();
                    if (maBhxhHienTai.length > 10) return res.send({ error: 'Invalid parameter!' });
                    else {
                        let { id, matSauThe, matTruocThe } = item;
                        if (id && matSauThe && matTruocThe) {
                            await app.model.svBaoHiemYTe.update({ id: item.id }, { maBhxhHienTai, thoiGianHoanThanh: new Date().getTime() });
                            return res.end();
                        } else return res.send({ error: 'Vui lòng bổ sung hình ảnh thẻ BHYT' });
                    }
                }
                case 12:
                case 15: {
                    let coBhxh = changes.coBhxh;
                    if (coBhxh == 1) {
                        let { maBhxhHienTai, benhVienDangKy, giaHan } = changes;
                        if (maBhxhHienTai.length > 10) return res.send({ error: 'Invalid parameter!' });
                        else {
                            let { id, matSauThe, matTruocThe } = item;
                            if (giaHan == 0) {
                                if (matTruocThe) {
                                    let destFolder = app.path.join(app.assetPath, '/bhyt/front', curYear, user.studentId);
                                    app.fs.deleteFolder(destFolder);
                                }
                                if (matSauThe) {
                                    let destFolder = app.path.join(app.assetPath, '/bhyt/back', curYear, user.studentId);
                                    app.fs.deleteFolder(destFolder);
                                }
                                await app.model.svBaoHiemYTe.update({ id }, { maBhxhHienTai, thoiGianHoanThanh: new Date().getTime(), benhVienDangKy, matTruocThe: '', matSauThe: '', giaHan });
                                return res.end();
                            }
                            else if (giaHan == 1 && matSauThe && matTruocThe) {
                                await app.model.svBaoHiemYTe.update({ id }, { maBhxhHienTai, thoiGianHoanThanh: new Date().getTime(), benhVienDangKy, giaHan });
                                return res.end();
                            } else return res.send({ error: 'Vui lòng bổ sung thông tin chính xác!' });
                        }
                    } else if (coBhxh == 0) {
                        let { data, dataChuHo, dataThanhVien } = changes;
                        const { benhVienDangKy } = data;

                        await Promise.all([
                            app.model.svBaoHiemYTe.update({ id: item.id }, {
                                maBhxhHienTai: '', matTruocThe: '', matSauThe: '', benhVienDangKy, thoiGianHoanThanh: new Date().getTime()
                            }),
                            app.model.svBhytPhuLucChuHo.create({
                                mssv: user.studentId, idDangKy: item.id, ...dataChuHo
                            }),
                            ...dataThanhVien.map(i => app.model.svBhytPhuLucThanhVien.create({ ...i, mssv: user.studentId, idDangKy: item.id }))
                        ]);
                        res.end();
                    }
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt'));
    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt/front'));
    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt/back'));

    app.uploadHooks.add('uploadBhytSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadImage(req, fields, files, params, done), done, 'student:login'));

    const uploadImage = async (req, fields, files, params, done) => {
        try {
            if (fields.userData && fields.userData.length && fields.userData[0].startsWith('BHYTSV_FRONT:') && files.BHYTSV_FRONT && files.BHYTSV_FRONT.length) {
                let user = req.session.user, [curYear, id] = fields.userData[0].substring('BHYTSV_FRONT:'.length).split('_');
                let item = await app.model.svBaoHiemYTe.get({ id });
                if (item && item.mssv == user.studentId) {
                    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt/front', curYear));

                    let destFolder = app.path.join(app.assetPath, '/bhyt/front', curYear, user.studentId);

                    app.fs.deleteFolder(destFolder);
                    app.fs.createFolder(destFolder);

                    let srcPath = files.BHYTSV_FRONT[0].path,
                        fileName = app.path.basename(srcPath),
                        destPath = app.path.join(destFolder, fileName);
                    await app.fs.rename(srcPath, destPath);
                    await app.model.svBaoHiemYTe.update({ id }, { matTruocThe: fileName });
                    done && done({ image: `/api/student/get-front-bhyt?t=${(new Date().getTime()).toString().slice(-8)}` });
                }
            } else if (fields.userData && fields.userData.length && fields.userData[0].startsWith('BHYTSV_BACK:') && files.BHYTSV_BACK && files.BHYTSV_BACK.length) {
                let user = req.session.user, [curYear, id] = fields.userData[0].substring('BHYTSV_BACK:'.length).split('_');
                let item = await app.model.svBaoHiemYTe.get({ id });
                if (item && item.mssv == user.studentId) {
                    app.fs.createFolder(app.path.join(app.assetPath, '/bhyt/back', curYear));

                    let destFolder = app.path.join(app.assetPath, '/bhyt/back', curYear, user.studentId);

                    app.fs.deleteFolder(destFolder);
                    app.fs.createFolder(destFolder);

                    let srcPath = files.BHYTSV_BACK[0].path,
                        fileName = app.path.basename(srcPath),
                        destPath = app.path.join(destFolder, fileName);
                    await app.fs.rename(srcPath, destPath);
                    await app.model.svBaoHiemYTe.update({ id }, { matSauThe: fileName });
                    done && done({ image: `/api/student/get-back-bhyt?t=${(new Date().getTime()).toString().slice(-8)}` });
                }
            }
        } catch (error) {
            done && done({ error });
        }
    };

    app.get('/api/student/get-front-bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user, curYear = new Date().getFullYear();
            const item = await app.model.svBaoHiemYTe.get({ mssv: user.studentId, namDangKy: curYear });
            if (!item || (item && !item.matTruocThe)) res.send({ error: 'No value returned' });
            else {
                let matTruocThe = item.matTruocThe,
                    path = app.path.join(app.assetPath, '/bhyt/front', curYear.toString(), user.studentId, matTruocThe);
                if (app.fs.existsSync(path)) res.sendFile(path);
                else res.send({ error: 'No value returned' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student/get-back-bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user, curYear = new Date().getFullYear();
            const item = await app.model.svBaoHiemYTe.get({ mssv: user.studentId, namDangKy: curYear });
            if (!item || (item && !item.matSauThe)) res.send({ error: 'No value returned' });
            else {
                let matSauThe = item.matSauThe,
                    path = app.path.join(app.assetPath, '/bhyt/back', curYear.toString(), user.studentId, matSauThe);
                if (app.fs.existsSync(path)) res.sendFile(path);
                else res.send({ error: 'No value returned' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

};
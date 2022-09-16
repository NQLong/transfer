module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1016: { title: 'Thông tin cá nhân sinh viên', link: '/user/sinh-vien/info', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 }
        }
    };

    const menuHocPhi = {
        parentMenu: app.parentMenu.hocPhi,
        // menus: {
        //     1016: { title: 'Thông tin cá nhân sinh viên', link: '/user/sinh-vien/info', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 }
        // }
    };

    const menuStudents = {
        parentMenu: app.parentMenu.students,
        menus: {
            6101: { title: 'Danh sách sinh viên', link: '/user/students/list', icon: 'fa-users', backgroundColor: '#eb9834' }
        }
    };


    app.permission.add(
        { name: 'student:login', menu },
        { name: 'student:login', menu: menuHocPhi },
        { name: 'student:manage', menu: menuStudents },
        { name: 'student:write' },
        { name: 'student:delete' }
    );

    app.permissionHooks.add('staff', 'addRoleStudent', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'student:manage', 'student:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/sinh-vien/info', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/students/list', app.permission.check('student:manage'), app.templates.admin);
    app.get('/user/students/item/:mssv', app.permission.check('student:manage'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------------------
    app.get('/api/user/sinh-vien/edit/item', app.permission.check('student:login'), async (req, res) => {
        try {
            let mssv = req.session.user?.studentId || '';
            const item = await app.model.fwStudents.get({ mssv });
            if (!item.image) {
                let user = await app.model.fwUser.get({ email: item.emailTruong });
                item.image = user?.image;
            }
            const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');

            let dataHocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy }, 'congNo');
            if (dataHocPhi.congNo) item.chuaDongHocPhi = true;
            else item.chuaDongHocPhi = false;
            //TODO: Get baohiemyte
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/students/page/:pageNumber/:pageSize', app.permission.check('student:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.fwStudents.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/students/item/:mssv', app.permission.check('student:manage'), (req, res) => {
        const mssv = req.params.mssv;
        app.model.fwStudents.get({ mssv }, (error, sinhVien) => {
            res.send({ items: sinhVien, error });
        });
    });

    app.put('/api/students/item/:mssv', app.permission.check('student:write'), (req, res) => {
        const mssv = req.params.mssv;
        const changes = req.body.changes;
        app.model.fwStudents.update({ mssv }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/students/:mssv', app.permission.check('student:delete'), (req, res) => {
        app.model.fwStudents.delete({ mssv: req.params.mssv }, (error) => res.send({ error }));
    });

    app.put('/api/user/student', app.permission.check('student:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            const changes = req.body.changes;
            app.model.fwStudents.get({ mssv: req.session.user.studentId }, (error, sinhVien) => {
                if (!sinhVien) {
                    changes.mssv = req.session.user.studentId;
                    app.model.fwStudents.create(changes, (error, item) => {
                        res.send({ error, item });
                    });
                } else {
                    app.model.fwStudents.update({ mssv: req.session.user.studentId }, changes, (error, item) => {
                        res.send({ error, item });
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    const password = 'ctsvussh@2022';
    app.post('/api/students-login-test', app.permission.orCheck('student:write', 'tcSetting:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const validEmails = ['ctsv05@hcmussh.edu.vn'];
            if (!validEmails.includes(data.email)) throw 'Email sinh viên không hợp lệ';
            if (data.pass != password) throw 'Sai mật khẩu!';
            const sinhVien = await app.model.fwStudents.get({ emailTruong: data.email });
            if (sinhVien) {
                const user = { email: sinhVien.emailTruong, lastName: sinhVien.ho, firstName: sinhVien.ten, active: 1, isStudent: 1, studentId: sinhVien.mssv };
                app.updateSessionUser(req, user, () => {
                    !app.isDebug && req.session.save();
                    res.send({ user });
                });
            } else {
                throw 'Sinh viên test không tồn tại!';
            }
        } catch (error) {
            res.send({ error });
        }

    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, '/img/sinhVien'));
    app.fs.createFolder(app.path.join(app.assetPath, 'image-card'));

    app.uploadHooks.add('uploadAnhThe', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadAnhThe(req, fields, files, params, done), done, 'student:login'));

    const uploadAnhThe = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('CardImage') && files.CardImage && files.CardImage.length) {
            try {
                let srcPath = files.CardImage[0].path;
                if (files.CardImage[0].size > 1000 * 1000) {
                    app.fs.deleteImage(srcPath);
                    done && done({ error: 'Vui lòng upload ảnh kích thước nhỏ hơn 1MB!' });
                } else {
                    let srcPath = files.CardImage[0].path;
                    let image = await app.jimp.read(srcPath);
                    let extPath = app.path.extname(srcPath);

                    await image.resize(113.386, 151.181); // ảnh 3 x 4

                    app.fs.unlinkSync(srcPath);
                    let user = req.session.user;
                    const folderPath = app.path.join(app.assetPath, 'image-card', user.data.namTuyenSinh.toString());
                    app.fs.createFolder(folderPath);
                    let filePath = app.path.join(folderPath, `${user.studentId}${extPath}`);
                    app.fs.deleteFile(filePath);
                    await image.writeAsync(filePath);
                    // await app.fs.rename(srcPath, filePath);
                    await app.model.fwStudents.update({ mssv: user.studentId }, { anhThe: `${user.studentId}${extPath}` });
                    done && done({ image: '/api/student/get-anh-the' });
                }
            } catch (error) {
                done && done({ error });
            }
        }
    };

    app.get('/api/student/get-anh-the', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user;
            let item = await app.model.fwStudents.get({ mssv: user.studentId }, 'anhThe');
            const path = app.path.join(app.assetPath, 'image-card', user.data.namTuyenSinh.toString(), item.anhThe);

            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                res.send({ error: 'No valid file' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    const uploadSinhVienImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('SinhVienImage:') && files.SinhVienImage && files.SinhVienImage.length) {
            app.uploadComponentImage(req, 'sinhVien', app.model.fwStudents, { mssv: fields.userData[0].substring('SinhVienImage:'.length) }, files.SinhVienImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSinhVienImage(req, fields, files, params, done), done, 'student:login'));

    const initSyll = async (req, res, next) => {
        try {
            const source = app.path.join(__dirname, 'resource', 'syll2022.docx');
            const user = req.session.user;
            const now = new Date().yyyymmdd();
            let data = await app.model.fwStudents.getData(user.studentId);
            data = data.rows[0];
            data.ngaySinh = app.date.viDateFormat(new Date(data.ngaySinh));
            data.cmndNgayCap = app.date.viDateFormat(new Date(data.cmndNgayCap));
            if (data.ngayVaoDang) {
                data.dav = 'X';
                data.ngayVaoDang = app.date.viDateFormat(new Date(data.ngayVaoDang));
            } else {
                data.ngayVaoDang = '';
                data.dav = '';
            }
            if (data.ngayVaoDoan) {
                data.dov = 'X';
                data.ngayVaoDoan = app.date.viDateFormat(new Date(data.ngayVaoDoan));
            } else {
                data.dov = '';
                data.ngayVaoDoan = '';
            }
            data.ngaySinhCha = new Date(data.ngaySinhCha).getFullYear();
            data.ngaySinhMe = new Date(data.ngaySinhMe).getFullYear();
            data.thuongTru = (data.soNhaThuongTru ? data.soNhaThuongTru + ', ' : '')
                + (data.xaThuongTru ? data.xaThuongTru + ', ' : '')
                + (data.huyenThuongTru ? data.huyenThuongTru + ', ' : '')
                + (data.tinhThuongTru ? data.tinhThuongTru : '');

            data.thuongTruCha = (data.soNhaThuongTruCha ? data.soNhaThuongTruCha + ', ' : '')
                + (data.xaThuongTruCha ? data.xaThuongTruCha + ', ' : '')
                + (data.huyenThuongTruCha ? data.huyenThuongTruCha + ', ' : '')
                + (data.tinhThuongTruCha ? data.tinhThuongTruCha : '');

            data.thuongTruMe = (data.soNhaThuongTruMe ? data.soNhaThuongTruMe + ', ' : '')
                + (data.xaThuongTruMe ? data.xaThuongTruMe + ', ' : '')
                + (data.huyenThuongTruMe ? data.huyenThuongTruMe + ', ' : '')
                + (data.tinhThuongTruMe ? data.tinhThuongTruMe : '');

            data.lienLac = (data.soNhaLienLac ? data.soNhaLienLac + ', ' : '')
                + (data.xaLienLac ? data.xaLienLac + ', ' : '')
                + (data.huyenLienLac ? data.huyenLienLac + ', ' : '')
                + (data.tinhLienLac ? data.tinhLienLac : '');

            data.yyyy = now.substring(0, 4);
            data.mm = now.substring(4, 6);
            data.dd = now.substring(6, 8);
            data.image = '';
            const qrCode = require('qrcode');
            let qrCodeImage = app.path.join(app.assetPath, '/qr-syll', data.mssv + '.png');
            app.fs.createFolder(app.path.join(app.assetPath, '/qr-syll'));
            await qrCode.toFile(qrCodeImage, JSON.stringify({ mssv: data.mssv, updatedAt: data.lastModified }));
            data.qrCode = qrCodeImage;
            app.docx.generateFileHasImage(source, data, async (error, buffer) => {
                if (error)
                    res.send({ error });
                else {
                    app.fs.createFolder(app.path.join(app.assetPath, 'so-yeu-ly-lich'));
                    app.fs.createFolder(app.path.join(app.assetPath, 'so-yeu-ly-lich', new Date().getFullYear().toString()));

                    const filePdfPath = app.path.join(app.assetPath, 'so-yeu-ly-lich', new Date().getFullYear().toString(), data.mssv + '.pdf');
                    const toPdf = require('office-to-pdf');
                    const pdfBuffer = await toPdf(buffer);
                    app.fs.writeFileSync(filePdfPath, pdfBuffer);

                    app.fs.deleteFile(qrCodeImage);
                    next(data, pdfBuffer);
                }
            });
        } catch (error) {
            res.send({ error });
        }
    };

    app.get('/api/students-sent-syll', app.permission.check('student:login'), async (req, res) => {
        await initSyll(req, res, async (data, pdfBuffer) => {
            let emailData = await app.model.svSetting.getEmail();
            if (emailData.index == 0) return res.send({ error: 'Không có email no-reply-ctsv nào đủ lượt gửi nữa!' });
            let { ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml } = await app.model.svSetting.getValue('ctsvEmailGuiLyLichTitle', 'ctsvEmailGuiLyLichEditorText', 'ctsvEmailGuiLyLichEditorHtml', 'defaultEmail', 'defaultPassword');
            [ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml] = [ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml].map(item => item?.replaceAll('{ten}', `${data.hoTen}`));
            app.email.normalSendEmail(emailData.email, emailData.password, data.emailTruong, '', ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml, [{ filename: `SYLL_${data.mssv}_${data.dd}/${data.mm}/${data.yyyy}.pdf`, content: pdfBuffer, encoding: 'base64' }], () => {
                // Success callback
                app.model.svSetting.updateLimit(data.index);
                res.end();
            }, (error) => {
                // Error callback
                res.send({ error });
            });
        });
    });

    app.get('/api/students-download-syll', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user,
                { studentId, data } = user;

            const filePath = app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString(), studentId + '.pdf');
            if (app.fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                initSyll(req, res, () => res.sendFile(filePath));
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/student/get-syll', app.permission.check('student:write'), async (req, res) => {
        try {
            let { mssv, namTuyenSinh } = req.query;
            if (parseInt(namTuyenSinh) < new Date().getFullYear()) return res.send({ error: 'Không thuộc đối tượng nhập học!' });
            const filePath = app.path.join(app.assetPath, 'so-yeu-ly-lich', namTuyenSinh?.toString() || new Date().getFullYear().toString(), mssv.toString() + '.pdf');
            if (app.fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.send({ error: 'No valid file!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};

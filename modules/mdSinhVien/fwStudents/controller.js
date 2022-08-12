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
        if (staff.maDonVi && ['34', '33', '32'].includes(staff.maDonVi)) {
            app.permissionHooks.pushUserPermission(user, 'student:read', 'student:write', 'student:delete', 'student:manage');
            resolve();
        } else if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'student:manage');
            resolve();
        } else resolve();
    }));


    app.get('/user/sinh-vien/info', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/students/list', app.permission.check('student:manage'), app.templates.admin);
    app.get('/user/students/item/:mssv', app.permission.check('student:manage'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------------------
    app.get('/api/user/sinh-vien/edit/item', app.permission.check('student:login'), async (req, res) => {
        try {
            let mssv = req.session.user.data?.mssv.trim() || '';
            const item = await app.model.fwStudents.get({ mssv });
            if (!item.image) {
                let user = await app.model.fwUser.get({ email: item.emailTruong });
                item.image = user.image;
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/students/page/:pageNumber/:pageSize', app.permission.check('student:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender } = (req.query.filter && req.query.filter != '%%%%%%%%%%%%%%%%%%') ? req.query.filter : { listFaculty: null, listFromCity: null, listEthnic: null, listNationality: null, listReligion: null, listLoaiHinhDaoTao: null, listLoaiSinhVien: null, listTinhTrangSinhVien: null, gender: null };
        app.model.fwStudents.searchPage(pageNumber, pageSize, listFaculty, listFromCity, listEthnic, listNationality, listReligion, listLoaiHinhDaoTao, listLoaiSinhVien, listTinhTrangSinhVien, gender, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
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
    app.post('/api/students-login-test', app.permission.check('student:write'), async (req, res) => {
        try {
            let data = req.body.data;
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

    const uploadSinhVienImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('SinhVienImage:') && files.SinhVienImage && files.SinhVienImage.length) {
            app.uploadComponentImage(req, 'sinhVien', app.model.fwStudents, { mssv: fields.userData[0].substring('SinhVienImage:'.length) }, files.SinhVienImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSinhVienImage(req, fields, files, params, done), done, 'student:login'));

    app.get('/api/students-download-syll', app.permission.check('student:login'), async (req, res) => {
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
                    const toPdf = require('office-to-pdf');
                    const pdfBuffer = await toPdf(buffer);
                    app.fs.deleteFile(qrCodeImage);
                    let { ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml, defaultEmail, defaultPassword } = await app.model.svSetting.getValue('ctsvEmailGuiLyLichTitle', 'ctsvEmailGuiLyLichEditorText', 'ctsvEmailGuiLyLichEditorHtml', 'defaultEmail', 'defaultPassword');
                    app.email.normalSendEmail(defaultEmail, defaultPassword, data.emailTruong, data.emailCaNhan, ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml, [{ filename: `SYLL_${data.mssv}_${data.dd}/${data.mm}/${data.yyyy}.pdf`, content: pdfBuffer, encoding: 'base64' }], () => {
                        // Success callback
                    }, () => {
                        // Error callback
                    });
                }
            });
        } catch (error) {
            res.send({ error });
        }

    });
};

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
    app.get('/user/students/import', app.permission.check('developer:login'), app.templates.admin);
    app.get('/user/students/item/:mssv', app.permission.check('student:manage'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------------------
    app.get('/api/user/sinh-vien/edit/item', app.permission.check('student:login'), async (req, res) => {
        try {
            let mssv = req.session.user.data?.mssv.trim() || '';
            const item = await app.model.fwStudents.get({ mssv });
            if (!item.image) {
                let user = await app.model.fwUser.get({ email: item.emailTruong });
                item.image = user?.image;
            }
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

    const uploadSinhVienImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('SinhVienImage:') && files.SinhVienImage && files.SinhVienImage.length) {
            app.uploadComponentImage(req, 'sinhVien', app.model.fwStudents, { mssv: fields.userData[0].substring('SinhVienImage:'.length) }, files.SinhVienImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSinhVienImage(req, fields, files, params, done), done, 'student:login'));

    app.get('/api/students-sent-syll', app.permission.check('student:login'), async (req, res) => {
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
                    let { ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml, defaultEmail, defaultPassword } = await app.model.svSetting.getValue('ctsvEmailGuiLyLichTitle', 'ctsvEmailGuiLyLichEditorText', 'ctsvEmailGuiLyLichEditorHtml', 'defaultEmail', 'defaultPassword');
                    app.email.normalSendEmail(defaultEmail, defaultPassword, data.emailTruong, '', ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml, [{ filename: `SYLL_${data.mssv}_${data.dd}/${data.mm}/${data.yyyy}.pdf`, content: pdfBuffer, encoding: 'base64' }], () => {
                        // Success callback
                        console.log('Send SYLL success');
                    }, () => {
                        // Error callback
                        console.log('Send SYLL failed');
                    });
                }
            });
        } catch (error) {
            res.send({ error });
        }

    });

    app.uploadHooks.add('FwSinhVienImport', (req, fields, files, params, done) =>
        app.permission.has(req, () => sinhVienImportHandler(fields, files, done), done, 'developer:login'));


    const sinhVienImportHandler = async (fields, files, done) => {
        const khuVucMapper = {
            '1': 'KV1',
            '2': 'KV2',
            '2NT': 'KV2-NT',
            '3': 'KV3',
        };
        const maPhuongThuc = [];
        const validateRow = async (row) => {
            const sinhVien = await app.model.fwStudents.get({ mssv: row.mssv });
            if (sinhVien) throw `Sinh viên ${row.mssv} đã tồn tại`;

            const nganh = await app.model.dtNganhDaoTao.get({ maNganh: row.maNganh });
            if (!nganh) throw `Sinh viên ${row.mssv}-${row.cmnd} có mã ngành không hợp lệ (${row.maNganh})`;

            row.nganh = nganh;
            row.khuVuc = khuVucMapper[row.khuVuc];

            if (row.doiTuong == 0 || !row.doiTuong) row.doiTuong = '00';
            if (!maPhuongThuc.includes(row.maPhuongThuc)) {
                maPhuongThuc.push(row.maPhuongThuc);
                if (!await app.model.dmPhuongThucTuyenSinh.get({ ma: row.maPhuongThuc })) {
                    await app.model.dmPhuongThucTuyenSinh.create({ ma: row.maPhuongThuc, kichHoat: 1, ten: row.phuongThuc });
                }
            }
        };
        let worksheet = null, lastModified = new Date().getTime();
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'FwSinhVienImport' && files.FwSinhVienImport && files.FwSinhVienImport.length) {
            const srcPath = files.FwSinhVienImport[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const errors = [];
                    let sum = 0;
                    let index = 2;
                    try {
                        while (true) {
                            if (!worksheet.getCell('A' + index).value) {
                                break;
                            } else {
                                const
                                    mssv = `${worksheet.getCell('A' + index).value}`.trim(),
                                    cmnd = `${worksheet.getCell('B' + index).value}`.trim(),
                                    ho = worksheet.getCell('C' + index).value,
                                    ten = worksheet.getCell('D' + index).value,
                                    maNganh = worksheet.getCell('F' + index).value,
                                    toHop = worksheet.getCell('H' + index).value,
                                    maPhuongThuc = worksheet.getCell('I' + index).value,
                                    phuongThuc = worksheet.getCell('J' + index).value,
                                    diemXetTuyen = worksheet.getCell('K' + index).value,
                                    diemThi = worksheet.getCell('O' + index).value,
                                    gioiTinh = worksheet.getCell('M' + index).value,
                                    ngaySinh = worksheet.getCell('N' + index).value,
                                    khuVuc = worksheet.getCell('P' + index).value,
                                    doiTuong = worksheet.getCell('Q' + index).value,
                                    emailTruong = worksheet.getCell('R' + index).value;
                                const row = { mssv, phuongThuc, diemThi, cmnd, ho, ten, maNganh, toHop, maPhuongThuc, diemXetTuyen, gioiTinh, ngaySinh, khuVuc, doiTuong, emailTruong, nganh: {} };
                                await validateRow(row);
                                index++;
                                items.push(row);
                            }
                        }
                    } catch (error) {
                        return done({ error });
                    }
                    await Promise.all(items.map(async row => {
                        try {
                            const ngaySinhData = row.ngaySinh.split('/');
                            const ngaySinh = new Date(`${ngaySinhData[1]}-${ngaySinhData[0]}-${ngaySinhData[2]}`);
                            const isCLC = row.maNganh.toLowerCase().includes('clc');
                            const res = await app.model.fwStudents.create({
                                ho: row.ho, ten: row.ten, ngaySinh: ngaySinh.getTime(),
                                gioiTinh: row.gioiTinh.toLowerCase() == 'nam' ? 1 : 2, loaiSinhVien: 'L1', maNganh: row.maNganh,
                                tinhTrang: 3, emailTruong: row.emailTruong, khoa: row.nganh.khoa, phuongThucTuyenSinh: row.maPhuongThuc,
                                maKhoa: isCLC ? 'CLC2022' : 'DHCQ2022', loaiHinhDaoTao: isCLC ? 'CLC' : 'CQ',
                                cmnd: row.cmnd, namTuyenSinh: 2022, mssv: row.mssv, bacDaoTao: 'DH', doiTuongTuyenSinh: row.doiTuong,
                                khuVucTuyenSinh: row.khuVuc, lastModified, canEdit: 1, diemThi: row.diemThi
                            });
                            sum += 1;
                            return res;
                        } catch (error) {
                            console.error(error);
                            row.error = error;
                            errors.push(row);
                        }
                    }));
                    done({ errors, sum });

                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    app.get('/api/students-download-syll', app.permission.check('student:login'), async (req, res) => {
        try {
            let user = req.session.user,
                { studentId, data } = user;

            const filePath = app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString(), studentId + '.pdf');
            if (app.fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.send({ error: 'No valid file' });
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

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
        { name: 'student:delete' },
        'student:export'
    );

    app.permissionHooks.add('staff', 'addRoleStudent', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'student:manage', 'student:write', 'student:export', 'student:dashboard');
            resolve();
        } else resolve();
    }));


    app.get('/user/sinh-vien/info', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/students/list', app.permission.check('student:manage'), app.templates.admin);
    app.get('/user/students/import', app.permission.check('developer:login'), app.templates.admin);
    app.get('/user/students/profile/:mssv', app.permission.check('student:manage'), app.templates.admin);

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

    app.get('/api/students/page/:pageNumber/:pageSize', app.permission.orCheck('student:manage', 'tcHocPhi:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.fwStudents.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.get('/api/students/item/:mssv', app.permission.check('student:manage'), (req, res) => {
        const mssv = req.params.mssv;
        app.model.fwStudents.get({ mssv }, (error, sinhVien) => {
            res.send({ items: sinhVien, error });
        });
    });

    app.put('/api/students/item/:mssv', app.permission.check('student:write'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            const changes = req.body.changes;
            changes.gioiTinh = parseInt(changes.gioiTinh);
            let items = await app.model.fwStudents.update({ mssv }, changes);
            res.send({ items });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }

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
                    app.fs.unlinkSync(srcPath);
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

    app.get('/api/student/anh-the/:mssv', app.permission.check('student:write'), async (req, res) => {
        try {
            let mssv = req.params.mssv;
            let stud = await app.model.fwStudents.get({ mssv }, 'anhThe,namTuyenSinh');
            const path = app.path.join(app.assetPath, 'image-card', stud.namTuyenSinh.toString(), stud.anhThe);

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

    app.get('/api/students/download-image-card', app.permission.check('student:manage'), async (req, res) => {
        try {
            const outDir = app.path.join(app.assetPath, 'image-card', `${new Date().getFullYear()}.zip`),
                srcDir = app.path.join(app.assetPath, 'image-card', (new Date().getFullYear()).toString());
            app.fs.deleteFile(outDir);
            await app.fs.zipDirectory(srcDir, outDir);
            res.download(outDir, `ANH_THE_SV_${new Date().getFullYear()}.zip`);
        } catch (error) {
            res.send({ error });
        }
    });
    const qrCode = require('qrcode');
    const toPdf = require('office-to-pdf');
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
            data.diemThi = Number(data.diemThi).toFixed(2);
            data.ngaySinhCha = data.ngaySinhCha ? new Date(data.ngaySinhCha).getFullYear() : '';
            data.tenCha = data.tenCha || '';
            data.ngheNghiepCha = data.ngheNghiepCha || '';
            data.sdtCha = data.sdtCha || '';
            data.ngaySinhMe = data.ngaySinhMe ? new Date(data.ngaySinhMe).getFullYear() : '';
            data.tenMe = data.tenMe || '';
            data.ngheNghiepMe = data.ngheNghiepMe || '';
            data.sdtMe = data.sdtMe || '';
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
        await initSyll(req, res, async () => {
            res.send({ error: 'Close mail temporary' });
        });
        //     let emailData = await app.model.svSetting.getEmail();
        //     if (emailData.index == 0) return res.send({ error: 'Không có email no-reply-ctsv nào đủ lượt gửi nữa!' });
        //     let { ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml } = await app.model.svSetting.getValue('ctsvEmailGuiLyLichTitle', 'ctsvEmailGuiLyLichEditorText', 'ctsvEmailGuiLyLichEditorHtml', 'defaultEmail', 'defaultPassword');
        //     [ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml] = [ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml].map(item => item?.replaceAll('{ten}', `${data.hoTen}`));
        //     app.email.normalSendEmail(emailData.email, emailData.password, data.emailTruong, '', ctsvEmailGuiLyLichTitle, ctsvEmailGuiLyLichEditorText, ctsvEmailGuiLyLichEditorHtml, [{ filename: `SYLL_${data.mssv}_${data.dd}/${data.mm}/${data.yyyy}.pdf`, content: pdfBuffer, encoding: 'base64' }], () => {
        //         // Success callback
        //         app.model.svSetting.updateLimit(data.index);
        //         res.end();
        //     }, (error) => {
        //         // Error callback
        //         res.send({ error });
        //     });
        // });
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
            if (app.fs.existsSync(filePath)) res.download(filePath, `SYLL_${studentId}.pdf`);
            else initSyll(req, res, () => res.download(filePath, `SYLL_${studentId}.pdf`));
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

    app.get('/api/students/nam-tuyen-sinh', app.permission.orCheck('student:write', 'tcHocPhi:write'), async (req, res) => {
        try {
            const data = await app.model.fwStudents.getNamTuyenSinhList();
            res.send({ items: data.rows || [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/students/download-excel', app.permission.check('student:export'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            const data = await app.model.fwStudents.downloadExcel(searchTerm || '', filter),
                list = data.rows;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');

            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(list[0]).map(key => ({ header: key.toString(), key, width: 20 }))];
            list.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            let fileName = 'ALL_STUDENT_DATA.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};

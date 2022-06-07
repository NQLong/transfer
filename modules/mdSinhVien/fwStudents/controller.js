module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1016: { title: 'Thông tin cá nhân sinh viên', link: '/user/sinh-vien/info', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 }
        }
    };

    const menuStudents = {
        parentMenu: app.parentMenu.students,
        menus: {
            6101: { title: 'Danh sách sinh viên', link: '/user/students/list', icon: 'fa-users', backgroundColor: '#eb9834' }
        }
    };

    app.permission.add(
        { name: 'student:login', menu },
        { name: 'student:read', menu: menuStudents },
        { name: 'student:write' },
        { name: 'student:delete' }
    );
    app.get('/user/sinh-vien/info', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/students/list', app.permission.check('student:read'), app.templates.admin);
    app.get('/user/students/item/:mssv', app.permission.check('student:write'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------------------
    app.get('/api/user/sinh-vien/edit/item', app.permission.check('student:login'), (req, res) => {
        let studentId = req.session.user.studentId ? req.session.user.studentId.trim() : '';
        app.model.fwStudents.get({ mssv: studentId }, (error, sinhVien) => {
            if (error || !sinhVien) {
                res.send({ error: 'Không tìm thấy thông tin sinh viên!' });
            } else {
                res.send({ item: Object.assign(sinhVien, { image: req.session.user.image }) });
            }
        });
    });

    app.get('/api/students/page/:pageNumber/:pageSize', app.permission.check('student:read'), (req, res) => {
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

    app.get('/api/students/:mssv', app.permission.check('student:read'), (req, res) => {
        const mssv = req.params.mssv;
        app.model.fwStudents.get({ mssv }, (error, sinhVien) => {
            if (error) res.send({ error });
            else app.model.fwUser.get({ studentId: mssv }, (e1, data) => {
                res.send({ items: Object.assign(sinhVien, { image: data ? data.image : null }) });
            });
        });
    });

    app.put('/api/students/:mssv', app.permission.check('student:write'), (req, res) => {
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

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/sinhVien'));

    const uploadSinhVienImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('SinhVienImage:') && files.SinhVienImage && files.SinhVienImage.length) {
            app.uploadComponentImage(req, 'sinhVien', app.model.fwUser, { studentId: fields.userData[0].substring('SinhVienImage:'.length) }, files.SinhVienImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadSinhVienImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSinhVienImage(req, fields, files, params, done), done, 'student:login'));
};

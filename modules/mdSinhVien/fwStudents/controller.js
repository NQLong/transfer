module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1016: { title: 'Thông tin cá nhân sinh viên', link: '/user/sinh-vien/info', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'student:login', menu },
    );
    app.get('/user/sinh-vien/info', app.permission.check('student:login'), app.templates.admin);

    //API
    app.get('/api/user/sinh-vien/edit/item', app.permission.check('student:login'), (req, res) => {
        let studentId = req.session.user.studentId ? req.session.user.studentId.trim() : '';
        app.model.fwStudents.get({ mssv: studentId }, (error, sinhVien) => {
            if (error || !sinhVien) {
                res.send({ error: 'Không tìm thấy thông tin sinh viên!' });
            } else {
                res.send({ item: sinhVien });
            }
        });
    });

    app.put('/api/user/student', app.permission.check('student:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            const changes = req.body.changes;
            app.model.fwStudents.get({mssv: req.session.user.studentId}, (error, sinhVien) => {
                if (!sinhVien) {
                    changes.mssv = req.session.user.studentId;
                    app.model.fwStudents.create(changes, (error, item) => {
                        res.send({error, item});
                    });
                } else {    
                    app.model.fwStudents.update({mssv: req.session.user.studentId}, changes, (error, item) => {
                        res.send({error, item});
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};
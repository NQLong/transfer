module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6102: { title: 'Cấu hình', link: '/user/students/setting', pin: true, icon: 'fa-sliders' },
        },
    };

    const menuDashboad = {
        parentMenu: app.parentMenu.students,
        menus: {
            6105: { title: 'Dashboard', link: '/user/students/dashboard', pin: true, icon: 'fa-tachometer', backgroundColor: '#319DA0' },
        },
    };

    app.permission.add(
        { name: 'student:manage', menu },
        { name: 'student:manage', menu: menuDashboad },
    );

    app.get('/user/students/dashboard', app.permission.check('student:manage'), app.templates.admin);

    app.get('/user/students/setting', app.permission.check('student:manage'), app.templates.admin);

    app.get('/api/students/dashboard', app.permission.check('student:manage'), async (req, res) => {
        try {
            const data = await app.model.fwStudents.getAll({
                statement: 'namTuyenSinh = :namTuyenSinh AND loaiHinhDaoTao IN (:loaiHinh)',
                parameter: {
                    namTuyenSinh: new Date().getFullYear(),
                    loaiHinh: ['CQ', 'CLC']
                }
            }, '*', 'ngayNhapHoc DESC,ten,ho');
            const dataFee = await app.model.tcHocPhi.getAll({
                statement: 'hocPhi != :hocPhi AND congNo <= 0',
                parameter: {
                    hocPhi: 11000000
                }
            });
            const listThaoTac = await app.model.svNhapHoc.getAll({ thaoTac: 'A' }, 'mssv,email', 'email');
            res.send({ data, dataFee, listThaoTac });
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/students/setting/keys', app.permission.orCheck('student:manage', 'student:login'), async (req, res) => {
        try {
            const { keys } = req.query;
            const items = await app.model.svSetting.getValue(...keys);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/students/setting/all', app.permission.check('student:manage'), async (req, res) => {
        app.model.svSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.put('/api/students/setting', app.permission.check('student:manage'), async (req, res) => {
        const { changes } = req.body;
        app.model.svSetting.setValue(changes, error => res.send({ error }));
    });
};
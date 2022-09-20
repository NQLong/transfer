module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7502: {
                title: 'Loại học viên',
                link: '/user/sau-dai-hoc/loai-hoc-vien',
                groupIndex: 3
            }
        },
    };

    app.permission.add(
        { name: 'sdhLoaiHocVien:read', menu },
        { name: 'sdhLoaiHocVien:write' },
        { name: 'sdhLoaiHocVien:delete' },
    );
    app.get('/user/sau-dai-hoc/loai-hoc-vien', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', '', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLoaiHocVien:read', 'sdhLoaiHocVien:write', 'sdhLoaiHocVien:delete', 'staff:login');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    let dataTest = {
        totalItem: 4,
        pageSize: 50,
        pageTotal: 1,
        pageNumber: 1,
        list: [
            {
                ma: 1,
                ten: 'Học viên trúng tuyển',
                kichHoat: 1
            },
            {
                ma: 2,
                ten: 'Học viên chính thức',
                kichHoat: 1
            },
        ]
    };

    app.put('/api/sau-dai-hoc/loai-hoc-vien', app.permission.check('staff:login'), (req, res) => {
        const changes = req.body.changes;
        let result = [];
        console.log("edit before",dataTest)
        dataTest.list.forEach(element => {
            if (element.ma == parseInt(changes.ma) || element.ma == parseInt(req.body.ma)) {
                element.ten = changes.ten ? changes.ten : element.ten;
                element.kichHoat = parseInt(changes.kichHoat);
            }
            result.push(element);
        });
        dataTest = { ...dataTest, list: [...result] };
        console.log("edit",dataTest)

        res.send({ err: '', page: dataTest });



    });

    app.delete('/api/sau-dai-hoc/loai-hoc-vien', app.permission.check('staff:login'), (req, res) => {
        const changes = req.body.ma;
        const rs1 = dataTest.list.filter(element => element.ma != parseInt(changes));
        console.log('delete before', dataTest);
        dataTest = { ...dataTest, list: [...rs1] };
        console.log('delete', dataTest);

        res.send({ err: '', page: dataTest });

    });

    app.post('/api/sau-dai-hoc/loai-hoc-vien', app.permission.check('staff:login'), (req, res) => {
        const changes = req.body.changes;
        console.log("create before",dataTest);

        dataTest = { ...dataTest, list: [...dataTest.list, { ma: parseInt(changes.ma), ten: changes.ten, kichHoat: parseInt(changes.kichHoat) }] };
        console.log("create",dataTest);
        res.send({ err: '', page: dataTest });

    });

    app.get('/api/sau-dai-hoc/loai-hoc-vien/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        res.send({ err: '', page: dataTest });
    });



};
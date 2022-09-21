module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7515: {
                title: 'Loại quyết định',
                link: '/user/sau-dai-hoc/loai-quyet-dinh',
                groupIndex: 3
            }
        },
    };

    app.permission.add(
        { name: 'sdhLoaiQuyetDinh:read', menu },
        { name: 'sdhLoaiQuyetDinh:write' },
        { name: 'sdhLoaiQuyetDinh:delete' },
    );
    app.get('/user/sau-dai-hoc/loai-quyet-dinh', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesLoaiQuyetDinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLoaiQuyetDinh:read', 'sdhLoaiQuyetDinh:write', 'sdhLoaiQuyetDinh:delete', 'staff:login');
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
                ten: 'Quyết định trúng tuyển',
                kichHoat: 1
            },
            {
                ma: 2,
                ten: 'Quyết định chính thức',
                kichHoat: 1
            },
        ]
    };

    app.put('/api/sau-dai-hoc/loai-quyet-dinh', app.permission.check('staff:login'), (req, res) => {
        const changes = req.body.changes;
        let result = [];
        console.log('edit before',changes, dataTest);
        dataTest.list.forEach(element => {
            if (element.ma == parseInt(changes.ma) || element.ma == parseInt(req.body.ma)) {
                element.ten = changes.ten ? changes.ten : element.ten;
                element.kichHoat = parseInt(changes.kichHoat);
            }
            result.push(element);
        });
        
        dataTest = { ...dataTest, list: [...result] };
        console.log('edit after',result,dataTest);

        res.send({ err: '', page: dataTest });



    });

    app.delete('/api/sau-dai-hoc/loai-quyet-dinh', app.permission.check('staff:login'), (req, res) => {
        const changes = req.body.ma;
        const rs1 = dataTest.list.filter(element => element.ma != parseInt(changes));
        console.log('delete before', dataTest);
        dataTest = { ...dataTest, list: [...rs1] };
        console.log('delete', dataTest);

        res.send({ err: '', page: dataTest });

    });

    app.post('/api/sau-dai-hoc/loai-quyet-dinh', app.permission.check('staff:login'), (req, res) => {
        const changes = req.body.changes;
        dataTest = { ...dataTest, list: [...dataTest.list, { ma: parseInt(changes.ma), ten: changes.ten, kichHoat: parseInt(changes.kichHoat) }] };
        res.send({ err: '', page: dataTest });

    });

    app.get('/api/sau-dai-hoc/loai-quyet-dinh/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        res.send({ err: '', page: dataTest });
    });

    console.log('global', dataTest);

};
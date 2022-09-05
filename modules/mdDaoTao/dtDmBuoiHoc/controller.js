module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            8017: {
                title: 'Buổi Học', groupIndex: 2,
                link: '/user/dao-tao/buoi-hoc'
            },
        },
    };

    app.permission.add(
        { name: 'dtDmBuoiHoc:read', menu },
        { name: 'dtDmBuoiHoc:manage', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtDmBuoiHoc:write' },
        { name: 'dtDmBuoiHoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtDmBuoiHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmBuoiHoc:read', 'dtDmBuoiHoc:write');
            resolve();
        } else resolve();
    }));


    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/user/dao-tao/buoi-hoc', app.permission.check('dtDmBuoiHoc:read'), app.templates.admin);

    app.get('/api/dao-tao/buoi-hoc/all', app.permission.check('dtDmBuoiHoc:read'), async (req, res) => {
        try {
            let kichHoat = req.query.kichHoat;
            let condition = kichHoat? {kichHoat:1}:{};
            let items = await app.model.dtDmBuoiHoc.getAll(condition);
            let listLoaiHinh = await app.model.dmSvLoaiHinhDaoTao.getAll({}, 'ma,ten');
            let loaiHinhMapper = {};
            listLoaiHinh.forEach(loaiHinh => {
                loaiHinhMapper[loaiHinh.ma] = loaiHinh.ten;
            });
            items.forEach(item => {
                if (item.loaiHinh) {
                    let loaiHinh = item.loaiHinh.split(','); // ['CQ','VB2'] --> ['Chính quy','Văn bằng 2']
                    item.tenLoaiHinh = loaiHinh.map(item => loaiHinhMapper[item]);
                }
            });
            res.send({ items });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dao-tao/buoi-hoc', app.permission.check('dtDmBuoiHoc:write'), (req, res) => {
        app.model.dtDmBuoiHoc.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/buoi-hoc', app.permission.check('dtDmBuoiHoc:delete'), (req, res) => {
        app.model.dtDmBuoiHoc.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/dao-tao/buoi-hoc', app.permission.check('dtDmBuoiHoc:write'), (req, res) => {
        let changes = req.body.changes;
        app.model.dtDmBuoiHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dao-tao/buoi-hoc/item/:id', app.permission.check('dtDmBuoiHoc:write'), async (req, res) => {
        try {
            let item = await app.model.dtDmBuoiHoc.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};

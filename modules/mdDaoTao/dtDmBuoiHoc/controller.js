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
            app.permissionHooks.pushUserPermission(user, 'dtDmBuoiHoc:read', 'dtDmBuoiHoc:write', 'dtDmBuoiHoc:delete');
            resolve();
        } else resolve();
    }));


    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/user/dao-tao/buoi-hoc', app.permission.check('dtDmBuoiHoc:read'), app.templates.admin);

    app.get('/api/dao-tao/buoi-hoc/all', app.permission.check('dtDmBuoiHoc:read'), async (req, res) => {
        try {
            let items = await app.model.dtDmBuoiHoc.getAll();
            console.log(items);
            let listLoaiHinh = await app.model.dmSvLoaiHinhDaoTao.getAll({}, 'ma,ten');
            console.log(listLoaiHinh);
            items.forEach(item => {
                let loaiHinh = item.loaiHinh.split(',');
                console.log(loaiHinh);
            });

            res.send({items});

        } catch (error) {
            res.send({error});
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
};

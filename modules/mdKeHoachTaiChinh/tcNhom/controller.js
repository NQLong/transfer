module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5010: { title: 'Nhóm', link: '/user/finance/nhom' } },
    };
    app.permission.add(
        { name: 'tcNhom:read', menu: menu },
        { name: 'tcNhom:write' },
        { name: 'tcNhom:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesNhomNganh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcNhom:read', 'tcNhom:write', 'tcNhom:delete');
            resolve();
        } else resolve();
    }));



    app.get('/user/finance/nhom', app.permission.check('tcNhom:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/nhom/page/:pageNumber/:pageSize', app.permission.orCheck('tcNhom:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            const page = await app.model.tcNhom.getPage(pageNumber, pageSize, {
                statement: 'ten like :ten',
                parameter: { ten: `%${req.query.condition || ''}%` }
            },);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/nhom/item/:id', app.permission.orCheck('tcNhom:read'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (!id) throw 'Invalid params';
            const item = await app.model.tcNhom.get(req.params.id);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/finance/nhom', app.permission.check('tcNhom:write'), async (req, res) => {
        try {
            const { nganh, ...data } = req.body;
            data.heSo = 0;
            const latest = await app.model.tcNhom.get({ nhomCha: data.nhomCha || null }, 'id,heSo', 'id DESC');
            if (latest) data.heSo = latest.heSo + 1;
            data.namHoc = 2022;
            data.hocKy = 1;
            const nhom = await app.model.tcNhom.create(data);
            nhom.nganh = nganh?.length ? await app.model.tcNhomNganh.bulkCreate(nganh.map(nganh => ({ nhom: nhom.id, nganh }))) : [];
            return res.send({ nhom });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/finance/nhom', app.permission.check('tcNhom:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.tcNhom.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/finance/nhom', app.permission.check('tcNhom:delete'), (req, res) => {
        app.model.tcNhom.delete({ ma: req.body._id }, error => res.send({ error }));
    });
};
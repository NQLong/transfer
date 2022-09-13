module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6024: {
                title: 'Mục đích gửi SMS', link: '/user/truyen-thong/sms/muc-dich', groupIndex: 5, icon: 'fa-crosshairs'
            }
        }
    };
    app.permission.add(
        { name: 'fwSmsDmPurpose:manage', menu },
        { name: 'fwSmsDmPurpose:write' },
        { name: 'fwSmsDmPurpose:delete' }
    );

    app.get('/user/truyen-thong/sms/muc-dich', app.permission.check('fwSmsDmPurpose:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleSmsDmPurpose', (user) => new Promise(resolve => {
        app.model.fwSmsDmPurpose.getAll({ canBoThucHien: user.shcc, kichHoat: 1 }, 'id,ten', 'id ASC', (error, items) => {
            if (!error && items && items.length) {
                app.permissionHooks.pushUserPermission(user, 'fwSmsTemplate:read', 'fwSmsTemplateDraft:read', 'fwSmsTemplateDraft:write');
                resolve();
            } else resolve();
        });
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sms/purpose/page/:pageNumber/:pageSize', app.permission.check('fwSmsDmPurpose:manage'), async (req, res) => {
        try {
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            let page = await app.model.fwSmsDmPurpose.getPage(_pageNumber, _pageSize, {
                statement: 'lower(ten) LIKE :searchText',
                parameter: {
                    searchText: `%${searchTerm}%`
                }
            });
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sms/purpose/get-purpose', app.permission.check('fwSmsTemplateDraft:write'), async (req, res) => {
        try {
            const user = req.session.user,
                shcc = user.shcc;
            let items = await app.model.fwSmsDmPurpose.getAll({ canBoThucHien: shcc });
            res.send({ list: items.map(item => ({ id: item.id, text: item.ten })) });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/sms/purpose/item/:id', app.permission.orCheck('fwSmsDmPurpose:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.fwSmsDmPurpose.get({ id: req.params.id }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/sms/purpose', app.permission.check('fwSmsDmPurpose:write'), (req, res) => {
        app.model.fwSmsDmPurpose.create(req.body.data, (error, item) => res.send({ error, item }));
    }
    );

    app.put('/api/sms/purpose', app.permission.check('fwSmsDmPurpose:write'), (req, res) =>
        app.model.fwSmsDmPurpose.update({ id: req.body.id }, req.body.changes || {}, (error, item) => res.send({ error, item })));

    app.delete('/api/sms/purpose', app.permission.check('fwSmsDmPurpose:delete'), (req, res) =>
        app.model.fwSmsDmPurpose.delete({ id: req.body.id }, error => res.send({ error })));
};
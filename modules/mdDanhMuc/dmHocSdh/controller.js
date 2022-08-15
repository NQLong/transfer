module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4027: {
                title: 'Bậc đào tạo',
                subTitle: 'Sau đại học',
                link: '/user/danh-muc/bac-sdh'
            }
        },
    };
    app.permission.add(
        { name: 'dmHocSdh:read', menu },
        { name: 'dmHocSdh:write' },
        { name: 'dmHocSdh:delete' },
    );
    app.get('/user/danh-muc/bac-sdh', app.permission.check('dmHocSdh:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleHocSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmHocSdh:read', 'dmHocSdh:write', 'dmHocSdh:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/bac-sdh/page/:pageNumber/:pageSize', app.permission.check('dmHocSdh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmHocSdh.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/bac-sdh/all', app.permission.check('dmHocSdh:read'), (req, res) => {
        app.model.dmHocSdh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/bac-sdh/item/:ma', app.permission.check('dmHocSdh:read'), (req, res) => {
        app.model.dmHocSdh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/bac-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.dmHocSdh.create(changes, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/danh-muc/bac-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.dmHocSdh.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/danh-muc/bac-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        app.model.dmHocSdh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
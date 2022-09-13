module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4103: {
                title: 'Khoa đào tạo, giảng dạy',
                subTitle: 'Sau đại học',
                link: '/user/danh-muc/khoa-sau-dai-hoc'
            },
        },
    };

    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7503: {
                title: 'Khoa đào tạo, giảng dạy',
                link: '/user/sau-dai-hoc/khoa-sau-dai-hoc',
                backgroundColor: '#1ca474'
            },
        },
    };
    app.permission.add(
        { name: 'dmKhoaSdh:read', menu },
        { name: 'dmKhoaSdh:write', menu: menuSdh },
        { name: 'dmKhoaSdh:delete' },
    );
    app.get('/user/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:read'), app.templates.admin);
    app.permissionHooks.add('staff', 'addRoleKhoaSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'dmKhoaSdh:read', 'dmKhoaSdh:write', 'dmKhoaSdh:delete');
            resolve();
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khoa-sau-dai-hoc/page/:pageNumber/:pageSize', app.permission.check('dmKhoaSdh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
            if (req.query.kichHoat) {
                condition.statement += ' AND kichHoat = :kichHoat';
                condition.parameter.kichHoat = req.query.kichHoat;
            }
        } else if (req.query.kichHoat) {
            condition = {
                statement: 'kichHoat = :kichHoat',
                parameter: { kichHoat: req.query.kichHoat }
            };
        }

        app.model.dmKhoaSauDaiHoc.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khoa-sau-dai-hoc/all', app.permission.check('dmKhoaSdh:read'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/khoa-sau-dai-hoc/item/:ma', app.permission.check('dmKhoaSdh:read'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:write'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:write'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:delete'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4107: {
                title: 'Khối kiến thức',
                link: '/user/sau-dai-hoc/khoi-kien-thuc',
                subTitle: 'Sau đại học'
            }
        }
    };
    app.permission.add(
        { name: 'sdhDmKhoiKienThuc:read', menu },
        { name: 'sdhDmKhoiKienThuc:write' },
        { name: 'sdhDmKhoiKienThuc:delete' }
    );

    app.get('/user/sau-dai-hoc/khoi-kien-thuc', app.permission.check('sdhDmKhoiKienThuc:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhKhoiKienThuc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmKhoiKienThuc:read', 'sdhDmKhoiKienThuc:write', 'sdhDmKhoiKienThuc:delete');
            resolve();
        } else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sau-dai-hoc/khoi-kien-thuc/page/:pageNumber/:pageSize', app.permission.check('sdhDmKhoiKienThuc:read'), async (req, res) => {
        try {
            let _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            let result = await app.model.sdhDmKhoiKienThuc.searchPage(_pageNumber, _pageSize, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sau-dai-hoc/khoi-kien-thuc/all', app.permission.check('sdhDmKhoiKienThuc:read'), (req, res) => {
        let searchTerm = `%${req.query.condition || ''}%`,
            khoiCha = req.query.khoiCha;
        app.model.sdhDmKhoiKienThuc.getAll({
            statement: '(:khoiCha = 0 OR khoiCha = :khoiCha) AND lower(ten) LIKE :searchTerm',
            parameter: {
                searchTerm, khoiCha: khoiCha ? parseInt(khoiCha) : 0
            }
        }, (error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/khoi-kien-thuc/item/:ma', app.permission.check('sdhDmKhoiKienThuc:read'), (req, res) => {
        app.model.sdhDmKhoiKienThuc.get({ ma: req.params.ma }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/sau-dai-hoc/khoi-kien-thuc', app.permission.check('sdhDmKhoiKienThuc:write'), (req, res) =>
        app.model.sdhDmKhoiKienThuc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/sau-dai-hoc/khoi-kien-thuc', app.permission.check('sdhDmKhoiKienThuc:write'), (req, res) => {
        let changes = req.body.changes;
        delete changes.ma;
        app.model.sdhDmKhoiKienThuc.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
    }
    );

    app.delete('/api/sau-dai-hoc/khoi-kien-thuc', app.permission.check('sdhDmKhoiKienThuc:delete'), (req, res) =>
        app.model.sdhDmKhoiKienThuc.delete({ ma: req.body.ma }, error => res.send({ error })));
};
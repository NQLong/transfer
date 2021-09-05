module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2162: { title: 'Quan hệ chủ hộ', link: '/user/danh-muc/quan-he-chu-ho' } },
    };
    app.permission.add(
        { name: 'dmQuanHeChuHo:read', menu },
        { name: 'dmQuanHeChuHo:write' },
        { name: 'dmQuanHeChuHo:delete' },
    );

    app.get('/user/danh-muc/quan-he-chu-ho', app.permission.check('dmQuanHeChuHo:read'), app.templates.admin);
    app.get('/user/danh-muc/quan-he-chu-ho/upload', app.permission.check('dmQuanHeChuHo:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/quan-he-chu-ho/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmQuanHeChuHo.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/danh-muc/quan-he-chu-ho', app.permission.check('dmQuanHeChuHo:write'), (req, res) => {
        const newItem = req.body.dmQuanHeChuHo;
        app.model.dmQuanHeChuHo.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Quan hệ chủ hộ ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmQuanHeChuHo.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/quan-he-chu-ho', app.permission.check('dmQuanHeChuHo:write'), (req, res) => {
        app.model.dmQuanHeChuHo.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/quan-he-chu-ho', app.permission.check('dmQuanHeChuHo:delete'), (req, res) => {
        app.model.dmQuanHeChuHo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
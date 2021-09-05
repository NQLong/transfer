module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2051: { title: 'Lương cơ sở', link: '/user/danh-muc/luong-co-so' } },
    };
    app.permission.add(
        { name: 'dmLuongCoSo:read', menu },
        { name: 'dmLuongCoSo:write' },
        { name: 'dmLuongCoSo:delete' },
    );

    app.get('/user/danh-muc/luong-co-so', app.permission.check('dmLuongCoSo:read'), app.templates.admin);
    app.get('/user/danh-muc/luong-co-so/upload', app.permission.check('dmLuongCoSo:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/luong-co-so/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        app.model.dmLuongCoSo.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.post('/api/danh-muc/luong-co-so', app.permission.check('dmLuongCoSo:write'), (req, res) => {
        const newItem = req.body.dmLuongCoSo;
        app.model.dmLuongCoSo.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Lương cơ sở ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmLuongCoSo.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/luong-co-so', app.permission.check('dmLuongCoSo:write'), (req, res) => {
        app.model.dmLuongCoSo.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/luong-co-so', app.permission.check('dmLuongCoSo:delete'), (req, res) => {
        app.model.dmLuongCoSo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
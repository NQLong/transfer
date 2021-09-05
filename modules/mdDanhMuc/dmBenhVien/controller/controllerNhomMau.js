module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2161: { title: 'Nhóm máu', link: '/user/danh-muc/nhom-mau' } },
    };
    app.permission.add(
        { name: 'dmNhomMau:read', menu },
        { name: 'dmNhomMau:write' },
        { name: 'dmNhomMau:delete' },
    );
    app.get('/user/danh-muc/nhom-mau', app.permission.check('dmNhomMau:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nhom-mau/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmNhomMau.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nhom-mau/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNhomMau.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nhom-mau/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNhomMau.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nhom-mau', app.permission.check('dmNhomMau:write'), (req, res) => {
        const newItem = req.body.dmNhomMau;
        app.model.dmNhomMau.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Nhóm máu ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmNhomMau.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/nhom-mau', app.permission.check('dmNhomMau:write'), (req, res) => {
        app.model.dmNhomMau.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/nhom-mau', app.permission.check('dmNhomMau:delete'), (req, res) => {
        app.model.dmNhomMau.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
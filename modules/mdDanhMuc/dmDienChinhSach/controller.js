module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2112: { title: 'Diện chính sách', link: '/user/danh-muc/dien-chinh-sach' } },
    };
    app.permission.add(
        { name: 'dmDienChinhSach:read', menu },
        { name: 'dmDienChinhSach:write' },
        { name: 'dmDienChinhSach:delete' },
    );

    app.get('/user/danh-muc/dien-chinh-sach', app.permission.check('dmDienChinhSach:read'), app.templates.admin);
    app.get('/user/danh-muc/dien-chinh-sach/upload', app.permission.check('dmDienChinhSach:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/dien-chinh-sach/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmDienChinhSach.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/dien-chinh-sach/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDienChinhSach.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/dien-chinh-sach/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmDienChinhSach.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/dien-chinh-sach', app.permission.check('dmDienChinhSach:write'), (req, res) => {
        const newItem = req.body.dmDienChinhSach;
        app.model.dmDienChinhSach.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Diện chính sách ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmDienChinhSach.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/dien-chinh-sach', app.permission.check('dmDienChinhSach:write'), (req, res) => {
        app.model.dmDienChinhSach.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/danh-muc/dien-chinh-sach', app.permission.check('dmDienChinhSach:delete'), (req, res) => {
        app.model.dmDienChinhSach.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

};
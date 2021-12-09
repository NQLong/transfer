module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.category,
    // };
    // app.permission.add(
    //     { name: 'dmNhomTaiSanCoDinh:read', menu },
    //     { name: 'dmNhomTaiSanCoDinh:write' },
    //     { name: 'dmNhomTaiSanCoDinh:delete' }
    // );
    app.get('/user/danh-muc/nhom-tai-san-co-dinh', app.permission.check('dmNhomTaiSanCoDinh:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nhom-tai-san-co-dinh/page/:pageNumber/:pageSize', app.permission.check('dmNhomTaiSanCoDinh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmNhomTaiSanCoDinh.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/nhom-tai-san-co-dinh/all', app.permission.check('dmNhomTaiSanCoDinh:read'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNhomTaiSanCoDinh.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nhom-tai-san-co-dinh/item/:ma', app.permission.check('dmNhomTaiSanCoDinh:read'), (req, res) => {
        app.model.dmNhomTaiSanCoDinh.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nhom-tai-san-co-dinh', app.permission.check('dmNhomTaiSanCoDinh:write'), (req, res) => {
        app.model.dmNhomTaiSanCoDinh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nhom-tai-san-co-dinh', app.permission.check('dmNhomTaiSanCoDinh:write'), (req, res) => {
        app.model.dmNhomTaiSanCoDinh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/nhom-tai-san-co-dinh', app.permission.check('dmNhomTaiSanCoDinh:delete'), (req, res) => {
        app.model.dmNhomTaiSanCoDinh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4080: { title: 'Chức danh khoa học', link: '/user/danh-muc/chuc-danh-khoa-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmChucDanhKhoaHoc:read', menu },
        { name: 'dmChucDanhKhoaHoc:write' },
        { name: 'dmChucDanhKhoaHoc:delete' },
    );
    app.get('/user/danh-muc/chuc-danh-khoa-hoc', app.permission.check('dmChucDanhKhoaHoc:read'), app.templates.admin);
    app.get('/user/danh-muc/chuc-danh-khoa-hoc/calendar/:ma', app.permission.check('dmChucDanhKhoaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chuc-danh-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmChucDanhKhoaHoc.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/chuc-danh-khoa-hoc/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmChucDanhKhoaHoc.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/chuc-danh-khoa-hoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmChucDanhKhoaHoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/chuc-danh-khoa-hoc', app.permission.check('dmChucDanhKhoaHoc:write'), (req, res) => {
        app.model.dmChucDanhKhoaHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/chuc-danh-khoa-hoc', app.permission.check('dmChucDanhKhoaHoc:write'), (req, res) => {
        app.model.dmChucDanhKhoaHoc.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/chuc-danh-khoa-hoc', app.permission.check('dmChucDanhKhoaHoc:delete'), (req, res) => {
        app.model.dmChucDanhKhoaHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2060: { title: 'Trình độ tin học', link: '/user/danh-muc/trinh-do-tin-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmTrinhDoTinHoc:read', menu },
        { name: 'dmTrinhDoTinHoc:write' },
        { name: 'dmTrinhDoTinHoc:delete' },
    );
    app.get('/user/danh-muc/trinh-do-tin-hoc', app.permission.check('dmTrinhDoTinHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/trinh-do-tin-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTrinhDoTinHoc.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/trinh-do-tin-hoc/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTrinhDoTinHoc.getAll(condition, (errors, items) => res.send({ errors, items }));
    });

    app.get('/api/danh-muc/trinh-do-tin-hoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTrinhDoTinHoc.get(req.params.ma, (errors, item) => res.send({ errors, item }));
    });

    app.post('/api/danh-muc/trinh-do-tin-hoc', app.permission.check('dmTrinhDoTinHoc:write'), (req, res) => {
        app.model.dmTrinhDoTinHoc.create(req.body.item, (errors, item) => res.send({ errors, item }));
    });

    app.put('/api/danh-muc/trinh-do-tin-hoc', app.permission.check('dmTrinhDoTinHoc:write'), (req, res) => {
        app.model.dmTrinhDoTinHoc.update({ ma: req.body.ma }, req.body.changes, (errors, items) => res.send({ errors, items }));
    });

    app.delete('/api/danh-muc/trinh-do-tin-hoc', app.permission.check('dmTrinhDoTinHoc:delete'), (req, res) => {
        app.model.dmTrinhDoTinHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
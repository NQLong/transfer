module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4074: { title: 'Học Phần', link: '/user/danh-muc/hoc-phan' },
        },
    };
    app.permission.add(
        { name: 'dmHocPhan:read', menu },
        { name: 'dmHocPhan:write' },
        { name: 'dmHocPhan:delete' },
    );
    app.get('/user/danh-muc/hoc-phan', app.permission.check('dmHocPhan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/hoc-phan/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmHocPhan.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/hoc-phan/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmHocPhan.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/hoc-phan/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHocPhan.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/hoc-phan', app.permission.check('dmHocPhan:write'), (req, res) => {
        app.model.dmHocPhan.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/hoc-phan', app.permission.check('dmHocPhan:write'), (req, res) => {
        app.model.dmHocPhan.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/hoc-phan', app.permission.check('dmHocPhan:delete'), (req, res) => {
        app.model.dmHocPhan.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
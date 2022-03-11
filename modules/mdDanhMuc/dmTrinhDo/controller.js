module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4074: { title: 'Trình độ', link: '/user/danh-muc/trinh-do' } },
    };
    app.permission.add(
        { name: 'dmTrinhDo:read', menu },
        { name: 'dmTrinhDo:write' },
        { name: 'dmTrinhDo:delete' },
    );
    app.get('/user/danh-muc/trinh-do', app.permission.check('dmTrinhDo:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/trinh-do/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmTrinhDo.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/trinh-do/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTrinhDo.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/trinh-do', app.permission.check('dmTrinhDo:write'), (req, res) => {
        const newItem = req.body.dmTrinhDo;
        app.model.dmTrinhDo.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Trình độ ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmTrinhDo.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.get('/api/danh-muc/trinh-do/item/:ma', app.permission.check('staff:login'), (req, res) => {
        app.model.dmTrinhDo.get({ ma: req.params.ma }, (error, item) => {
            res.send({ error, item });
        });
    });
    
    app.put('/api/danh-muc/trinh-do', app.permission.check('dmTrinhDo:write'), (req, res) => {
        app.model.dmTrinhDo.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/trinh-do', app.permission.check('dmTrinhDo:delete'), (req, res) => {
        app.model.dmTrinhDo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
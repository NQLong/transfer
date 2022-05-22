module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4090: { title: 'Lý do ngừng công tác', link: '/user/danh-muc/ly-do-ngung-cong-tac' } },
    };
    app.permission.add(
        { name: 'dmNghiViec:read', menu },
        { name: 'dmNghiViec:write' },
        { name: 'dmNghiViec:delete' },
    );
    app.get('/user/danh-muc/ly-do-ngung-cong-tac', app.permission.check('dmNghiViec:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ly-do-ngung-cong-tac/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmNghiViec.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ly-do-ngung-cong-tac/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNghiViec.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/ly-do-ngung-cong-tac', app.permission.check('dmNghiViec:write'), (req, res) => {
        const newItem = req.body.dmNghiViec;
        app.model.dmNghiViec.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Lý do ngừng công tác ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmNghiViec.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.get('/api/danh-muc/ly-do-ngung-cong-tac/item/:ma', app.permission.check('staff:login'), (req, res) => {
        app.model.dmNghiViec.get({ ma: req.params.ma }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/danh-muc/ly-do-ngung-cong-tac', app.permission.check('dmNghiViec:write'), (req, res) => {
        app.model.dmNghiViec.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/ly-do-ngung-cong-tac', app.permission.check('dmNghiViec:delete'), (req, res) => {
        app.model.dmNghiViec.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
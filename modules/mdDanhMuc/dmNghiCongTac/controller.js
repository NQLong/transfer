module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 52: { title: 'Nghỉ công tác', link: '/user/danh-muc/nghi-cong-tac' } },
    };
    app.permission.add(
        { name: 'dmNghiCongTac:read', menu },
        { name: 'dmNghiCongTac:write' },
        { name: 'dmNghiCongTac:delete' },
    );

    app.get('/user/danh-muc/nghi-cong-tac', app.permission.check('dmNghiCongTac:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nghi-cong-tac/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition ? req.query.condition : {};
        app.model.dmNghiCongTac.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nghi-cong-tac/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNghiCongTac.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nghi-cong-tac/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNghiCongTac.get({ ma: req.body.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nghi-cong-tac', app.permission.check('dmNghiCongTac:write'), (req, res) => {
        const newItem = req.body.dmNghiCongTac;
        app.model.dmNghiCongTac.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Nghỉ công tác' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmNghiCongTac.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/nghi-cong-tac', app.permission.check('dmNghiCongTac:write'), (req, res) => {
        app.model.dmNghiCongTac.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/nghi-cong-tac', app.permission.check('dmNghiCongTac:delete'), (req, res) => {
        app.model.dmNghiCongTac.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
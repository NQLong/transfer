module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2204: { title: 'Đối tượng miễn giảm học phí', link: '/user/danh-muc/doi-tuong-mghp' } },
    };
    app.permission.add(
        { name: 'dmDoiTuongMGHP:read', menu },
        { name: 'dmDoiTuongMGHP:write' },
        { name: 'dmDoiTuongMGHP:delete' },
    );

    app.get('/user/danh-muc/doi-tuong-mghp', app.permission.check('dmDoiTuongMGHP:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/doi-tuong-mghp/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(tiLe) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmDoiTuongMGHP.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/doi-tuong-mghp/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDoiTuongMGHP.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/doi-tuong-mghp/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmDoiTuongMGHP.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/doi-tuong-mghp', app.permission.check('dmDoiTuongMGHP:write'), (req, res) => {
        const newItem = req.body.dmDoiTuongMGHP;
        app.model.dmDoiTuongMGHP.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Đối tượng ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmDoiTuongMGHP.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/doi-tuong-mghp', app.permission.check('dmDoiTuongMGHP:write'), (req, res) => {
        app.model.dmDoiTuongMGHP.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/doi-tuong-mghp', app.permission.check('dmDoiTuongMGHP:delete'), (req, res) => {
        app.model.dmDoiTuongMGHP.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
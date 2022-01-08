module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2015: { title: 'Loại bằng cấp', link: '/user/danh-muc/loai-bang-cap' } },
    };
    app.permission.add(
        { name: 'dmLoaiBangCap:read', menu },
        { name: 'dmLoaiBangCap:write' },
        { name: 'dmLoaiBangCap:delete' },
    );

    app.get('/user/danh-muc/loai-bang-cap', app.permission.check('dmLoaiBangCap:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-bang-cap/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLoaiBangCap.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-bang-cap/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiBangCap.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-bang-cap/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiBangCap.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-bang-cap', app.permission.check('dmLoaiBangCap:write'), (req, res) => {
        const newItem = req.body.dmLoaiBangCap;
        app.model.dmLoaiBangCap.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Loại bằng cấp ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmLoaiBangCap.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/loai-bang-cap', app.permission.check('dmLoaiBangCap:write'), (req, res) => {
        app.model.dmLoaiBangCap.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/loai-bang-cap', app.permission.check('dmLoaiBangCap:delete'), (req, res) => {
        app.model.dmLoaiBangCap.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
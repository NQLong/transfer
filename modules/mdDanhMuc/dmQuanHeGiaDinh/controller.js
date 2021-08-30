module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2156: { title: 'Quan hệ gia đình', link: '/user/danh-muc/quan-he-gia-dinh' } },
    };
    app.permission.add(
        { name: 'dmQuanHeGiaDinh:read', menu },
        { name: 'dmQuanHeGiaDinh:write' },
        { name: 'dmQuanHeGiaDinh:delete' },
    );

    app.get('/user/danh-muc/quan-he-gia-dinh', app.permission.check('dmQuanHeGiaDinh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/quan-he-gia-dinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmQuanHeGiaDinh.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/quan-he-gia-dinh/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmQuanHeGiaDinh.getAll(condition, (error, items) => res.send({ error, items }))
    });

    app.post('/api/danh-muc/quan-he-gia-dinh', app.permission.check('dmQuanHeGiaDinh:write'), (req, res) => {
        const newItem = req.body.dmQuanHeGiaDinh;
        app.model.dmQuanHeGiaDinh.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Quan hệ gia đình ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmQuanHeGiaDinh.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/quan-he-gia-dinh', app.permission.check('dmQuanHeGiaDinh:write'), (req, res) => {
        app.model.dmQuanHeGiaDinh.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }))
    });

    app.delete('/api/danh-muc/quan-he-gia-dinh', app.permission.check('dmQuanHeGiaDinh:delete'), (req, res) => {
        app.model.dmQuanHeGiaDinh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
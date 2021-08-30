module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 2206: { title: 'Học Sau đại học', link: '/user/danh-muc/hoc-sdh' } },
    };
    app.permission.add(
        { name: 'dmHocSdh:read', menu },
        { name: 'dmHocSdh:write' },
    );
    app.get('/user/danh-muc/hoc-sdh', app.permission.check('dmHocSdh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/hoc-sdh/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmHocSdh.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/hoc-sdh/all', app.permission.check('staff:login'), (req, res) => {
        app.model.dmHocSdh.getAll((error, items) => res.send({ error, items }))
    });

    app.get('/api/danh-muc/hoc-sdh/item/:ma', app.permission.check('dmHocSdh:read'), (req, res) => {
        app.model.dmHocSdh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/hoc-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.dmHocSdh.create(changes, (error, item) => { res.send({ error, item }) });
    });

    app.put('/api/danh-muc/hoc-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.dmHocSdh.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item })
        })
    });

    app.delete('/api/danh-muc/hoc-sdh', app.permission.check('dmHocSdh:write'), (req, res) => {
        app.model.dmHocSdh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
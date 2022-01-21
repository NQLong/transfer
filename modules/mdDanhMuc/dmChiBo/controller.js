module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4009: { title: 'Chi bộ', link: '/user/danh-muc/chi-bo' },
        },
    };
    app.permission.add(
        { name: 'dmChiBo:read', menu },
        { name: 'dmChiBo:write' },
    );
    app.get('/user/danh-muc/chi-bo', app.permission.check('dmChiBo:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chi-bo/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmChiBo.getPage(pageNumber, pageSize, condition, '*', 'ten ASC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/chi-bo/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmChiBo.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/chi-bo', app.permission.check('dmChiBo:write'), (req, res) => {
        let newData = req.body.item;
        newData.phuCap = newData.phuCap ? parseFloat(newData.phuCap).toFixed(2) : null;
        newData.kichHoat = newData.kichHoat ? parseInt(newData.kichHoat) : null;
        app.model.dmChiBo.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/chi-bo', app.permission.check('dmChiBo:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmChiBo.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/chi-bo', app.permission.check('dmChiBo:write'), (req, res) => {
        app.model.dmChiBo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};
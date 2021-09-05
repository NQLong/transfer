module.exports = app => {
    // API
    app.get('/api/submenu/all', app.permission.check('menu:read'),
        (req, res) => app.model.fwSubmenu.getAll({}, '*', 'priority ASC', (error, items) => {
            res.send({ error, items });
        }));

    app.post('/api/submenu', app.permission.check('menu:write'), (req, res) => {
        const { submenu } = req.body;
        if (!submenu.link) submenu.link = '#';
        app.model.fwSubmenu.create(submenu, (error, item) => res.send({ error, item }));
    });

    app.put('/api/submenu', app.permission.check('menu:write'), (req, res) => {
        app.model.fwSubmenu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/submenu', app.permission.check('menu:write'), (req, res) => {
        app.model.fwSubmenu.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/submenu/swap', app.permission.check('menu:write'), (req, res) => {
        let { id, priority } = req.body;
        if (id && priority) {
            app.model.fwSubmenu.get({ id }, (error, item) => {
                if (item) {
                    const isUp = item.priority > Number(priority) ? 1 : 0;
                    app.model.fwSubmenu.ganThuTu(Number(id), Number(priority), isUp, error => res.send({ error }));
                } else {
                    res.send({ error });
                }
            });
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });

};
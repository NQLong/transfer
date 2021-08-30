module.exports = app => {
    app.permission.add(
        { name: 'dmCapDeTai:read' },
        { name: 'dmCapDeTai:write' },
        { name: 'dmCapDeTai:delete' },
    );
    app.get('/user/danh-muc/cap-de-tai', app.permission.check('dmCapDeTai:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/cap-de-tai/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(tenCap) LIKE :searchText OR lower(maCap) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmCapDeTai.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/cap-de-tai/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmCapDeTai.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/cap-de-tai/item/:maCap', app.permission.check('user:login'), (req, res) => {
        if (req.params.maCap.length === 2) {
            app.model.dmCapDeTai.get({ maCu: req.params.maCap }, (error, item) => res.send({ error, item }));
        } else {
            app.model.dmCapDeTai.get({ maCap: req.params.maCap }, (error, item) => res.send({ error, item }));
        }
    });

    app.post('/api/danh-muc/cap-de-tai', app.permission.check('dmCapDeTai:read'), (req, res) => {
        app.model.dmCapDeTai.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/cap-de-tai', app.permission.check('dmCapDeTai:read'), (req, res) => {
        app.model.dmCapDeTai.update({ maCap: req.body.maCap }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/cap-de-tai', app.permission.check('dmCapDeTai:delete'), (req, res) => {
        app.model.dmCapDeTai.delete({ maCap: req.body.maCap }, errors => res.send({ errors }));
    });

    app.get('/api/danh-muc/cap-de-tai/item/:maCap', app.permission.check('user:login'), (req, res) => {
        if (req.params.maCap.length === 2) {
            app.model.dmCapDeTai.get({ maCu: req.params.maCap }, (error, item) => { res.send({ error, item }) });
        } else {
            app.model.dmCapDeTai.get({ maCap: req.params.maCap }, (error, item) => { res.send({ error, item }) });
        }
    });

    app.get('/api/danh-muc/cap-de-tai/tmdt/all', app.permission.check('user:login'), (req, res) => {
        const curDate = new Date().getTime(),
            condition = req.query.condition;
        app.model.dmCapDeTai.searchList(curDate, condition, (error, item) => res.send({ error, item }));
    });
};
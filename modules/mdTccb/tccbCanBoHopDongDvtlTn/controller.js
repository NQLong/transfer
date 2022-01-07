module.exports = app => {
    app.permission.add(
        { name: 'staff:login' },
        { name: 'tchcCanBoHopDongDvtlTn:read' },
        { name: 'tchcCanBoHopDongDvtlTn:write' },
        { name: 'tchcCanBoHopDongDvtlTn:delete' },
    );
    app.get('/user/tchc/can-bo-hop-dong-dvtl-tn/:shcc', app.permission.check('tchcCanBoHopDongDvtlTn:read'), app.templates.admin);
    app.get('/user/tchc/can-bo-hop-dong-dvtl-tn', app.permission.check('tchcCanBoHopDongDvtlTn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tchc/can-bo-hop-dong-dvtl-tn/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tchcCanBoHopDongDvtlTn.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tchc/can-bo-hop-dong-dvtl-tn/all', checkGetStaffPermission, (req, res) => {
        app.model.tchcCanBoHopDongDvtlTn.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tchc/can-bo-hop-dong-dvtl-tn/item/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.tchcCanBoHopDongDvtlTn.get({ shcc: req.params.shcc }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tchc/can-bo-hop-dong-dvtl-tn/edit/item/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.tchcCanBoHopDongDvtlTn.get({ shcc: req.params.shcc }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tchc/can-bo-hop-dong-dvtl-tn', app.permission.check('tchcCanBoHopDongDvtlTn:write'), (req, res) => {
        app.model.tchcCanBoHopDongDvtlTn.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tchc/can-bo-hop-dong-dvtl-tn', app.permission.check('tchcCanBoHopDongDvtlTn:write'), (req, res) => {
        app.model.tchcCanBoHopDongDvtlTn.update({ shcc: req.body.shcc }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/tchc/can-bo-hop-dong-dvtl-tn', app.permission.check('tchcCanBoHopDongDvtlTn:delete'), (req, res) => {
        app.model.tchcCanBoHopDongDvtlTn.delete({ shcc: req.body.shcc }, errors => res.send({ errors }));
    });
};
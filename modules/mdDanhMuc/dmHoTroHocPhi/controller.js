module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2022: { title: 'Hỗ trợ học phí', link: '/user/danh-muc/ho-tro-hoc-phi' },
        },
    };
    app.permission.add(
        { name: 'dmHoTroHocPhi:read', menu },
        { name: 'dmHoTroHocPhi:write' },
        { name: 'dmHoTroHocPhi:delete' },
    );
    app.get('/user/danh-muc/ho-tro-hoc-phi', app.permission.check('dmHoTroHocPhi:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ho-tro-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmHoTroHocPhi.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ho-tro-hoc-phi/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoTroHocPhi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ho-tro-hoc-phi/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoTroHocPhi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ho-tro-hoc-phi', app.permission.check('dmHoTroHocPhi:write'), (req, res) => {
        app.model.dmHoTroHocPhi.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ho-tro-hoc-phi', app.permission.check('dmHoTroHocPhi:write'), (req, res) => {
        app.model.dmHoTroHocPhi.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ho-tro-hoc-phi', app.permission.check('dmHoTroHocPhi:delete'), (req, res) => {
        app.model.dmHoTroHocPhi.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4028: { title: 'Hội nghị', link: '/user/danh-muc/hoi-nghi' },
        },
    };
    app.permission.add(
        { name: 'dmHoiNghi:read', menu },
        { name: 'dmHoiNghi:write' },
        { name: 'dmHoiNghi:delete' },
    );
    app.get('/user/danh-muc/hoi-nghi', app.permission.check('dmHoiNghi:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/hoi-nghi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmHoiNghi.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/hoi-nghi/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoiNghi.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/hoi-nghi/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoiNghi.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/hoi-nghi', app.permission.check('dmHoiNghi:write'), (req, res) => {
        app.model.dmHoiNghi.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/hoi-nghi', app.permission.check('dmHoiNghi:write'), (req, res) => {
        app.model.dmHoiNghi.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/hoi-nghi', app.permission.check('dmHoiNghi:delete'), (req, res) => {
        app.model.dmHoiNghi.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
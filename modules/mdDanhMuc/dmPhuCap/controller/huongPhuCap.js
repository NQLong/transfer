module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2021: { title: 'Hình thức hưởng phụ cấp', link: '/user/danh-muc/huong-phu-cap' },
        },
    };
    app.permission.add(
        { name: 'dmHuongPhuCap:read', menu },
        { name: 'dmHuongPhuCap:write' },
        { name: 'dmHuongPhuCap:delete' },
    );
    app.get('/user/danh-muc/huong-phu-cap', app.permission.check('dmHuongPhuCap:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/huong-phu-cap/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmHuongPhuCap.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/huong-phu-cap/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmHuongPhuCap.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/huong-phu-cap/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHuongPhuCap.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/huong-phu-cap', app.permission.check('dmHuongPhuCap:write'), (req, res) => {
        app.model.dmHuongPhuCap.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/huong-phu-cap', app.permission.check('dmHuongPhuCap:write'), (req, res) => {
        app.model.dmHuongPhuCap.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/huong-phu-cap', app.permission.check('dmHuongPhuCap:delete'), (req, res) => {
        app.model.dmHuongPhuCap.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
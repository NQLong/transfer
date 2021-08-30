module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.category,
    //     menus: {
    //         2103: { title: 'Sở hữu trí tuệ', link: '/user/danh-muc/so-huu-tri-tue' },
    //     },
    // };
    // app.permission.add(
    //     { name: 'dmSoHuuTriTue:read', menu },
    //     { name: 'dmSoHuuTriTue:write' },
    //     { name: 'dmSoHuuTriTue:delete' },
    // );
    // app.get('/user/danh-muc/so-huu-tri-tue', app.permission.check('dmSoHuuTriTue:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/so-huu-tri-tue/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmSoHuuTriTue.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/so-huu-tri-tue/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmSoHuuTriTue.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/so-huu-tri-tue/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmSoHuuTriTue.get({ ma: req.params.ma }, '*', 'ma', (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/so-huu-tri-tue', app.permission.check('dmSoHuuTriTue:write'), (req, res) => {
        const maSoHuuTriTue = req.body.item && req.body.item.ma;

        if (!maSoHuuTriTue) {
            res.send({ error: 'Mã sở hữu trí tuệ bị trống' });
        } else {
            app.model.dmSoHuuTriTue.get({ ma: maSoHuuTriTue }, (error, item) => {
                if (!error && item) {
                    res.send({ error: 'Mã sở hữu trí tuệ đã tồn tại' });
                } else {
                    app.model.dmSoHuuTriTue.create(req.body.item, (error, item) => res.send({ error, item }));
                }
            });
        }
    });

    app.put('/api/danh-muc/so-huu-tri-tue', app.permission.check('dmSoHuuTriTue:write'), (req, res) => {
        const { ma: maSoHuuTriTue } = req.body;
        const changes = req.body.changes || {};
        const newMaSoHuuTriTue = 'ma' in changes ? changes.ma : maSoHuuTriTue;

        if (!newMaSoHuuTriTue) {
            res.send({ error: 'Mã sở hữu trí tuệ bị trống' });
        } else if (maSoHuuTriTue !== newMaSoHuuTriTue) {
            app.model.dmSoHuuTriTue.get({ ma: newMaSoHuuTriTue }, (error, item) => {
                if (!error && item) {
                    res.send({ error: 'Mã sở hữu trí tuệ đã tồn tại' });
                } else {
                    app.model.dmSoHuuTriTue.update({ ma: maSoHuuTriTue }, req.body.changes, (error, items) => res.send({ error, items }));
                }
            });
        } else {
            app.model.dmSoHuuTriTue.update({ ma: maSoHuuTriTue }, req.body.changes, (error, items) => res.send({ error, items }));
        }
    });

    app.delete('/api/danh-muc/so-huu-tri-tue', app.permission.check('dmSoHuuTriTue:delete'), (req, res) => {
        app.model.dmSoHuuTriTue.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};
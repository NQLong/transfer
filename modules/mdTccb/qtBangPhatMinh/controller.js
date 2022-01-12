module.exports = app => {
    app.post('/api/qua-trinh/bang-phat-minh', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBangPhatMinh.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/bang-phat-minh', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBangPhatMinh.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/bang-phat-minh', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBangPhatMinh.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/bang-phat-minh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtBangPhatMinh.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bang-phat-minh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBangPhatMinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBangPhatMinh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/bang-phat-minh', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBangPhatMinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtBangPhatMinh.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};
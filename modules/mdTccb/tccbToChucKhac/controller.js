module.exports = app => {
    app.post('/api/staff/to-chuc-khac', app.permission.check('staff:write'), (req, res) =>
        app.model.tccbToChucKhac.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/to-chuc-khac', app.permission.check('staff:write'), (req, res) =>
        app.model.tccbToChucKhac.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/to-chuc-khac', app.permission.check('staff:write'), (req, res) =>
        app.model.tccbToChucKhac.delete({ ma: req.body.ma }, (error) => res.send(error)));

    app.post('/api/user/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.tccbToChucKhac.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        console.log(req);
        if (req.body.changes && req.session.user) {
            app.model.tccbToChucKhac.get({ ma: req.body.ma }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.tccbToChucKhac.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.tccbToChucKhac.get({ ma: req.body.ma }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.tccbToChucKhac.delete({ ma: req.body.ma }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};
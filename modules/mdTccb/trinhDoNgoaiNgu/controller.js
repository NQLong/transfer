module.exports = app => {
    app.post('/api/staff/trinh-do-nn', app.permission.check('staff:write'), (req, res) =>
        app.model.trinhDoNgoaiNgu.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/trinh-do-nn', app.permission.check('staff:write'), (req, res) =>
        app.model.trinhDoNgoaiNgu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/trinh-do-nn', app.permission.check('staff:write'), (req, res) =>
        app.model.trinhDoNgoaiNgu.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/staff/trinh-do-nn', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.trinhDoNgoaiNgu.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/trinh-do-nn', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.trinhDoNgoaiNgu.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.trinhDoNgoaiNgu.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/trinh-do-nn', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.trinhDoNgoaiNgu.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.trinhDoNgoaiNgu.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};
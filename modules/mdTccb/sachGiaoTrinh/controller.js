module.exports = app => {
    app.post('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.sachGiaoTrinh.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
            if (req.body.changes && req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        const changes = app.clone(req.body.changes, { shcc: req.session.user.shcc });
                        app.model.sachGiaoTrinh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });
};
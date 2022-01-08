module.exports = app => {
    app.post('/api/qua-trinh/ung-dung-tm', app.permission.check('staff:write'), (req, res) =>
        app.model.qtUngDungThuongMai.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/ung-dung-tm', app.permission.check('staff:write'), (req, res) =>
        app.model.qtUngDungThuongMai.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/ung-dung-tm', app.permission.check('staff:write'), (req, res) =>
        app.model.qtUngDungThuongMai.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/ung-dung-tm', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtUngDungThuongMai.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/ung-dung-tm', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtUngDungThuongMai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        const changes = req.body.changes;
                        app.model.qtUngDungThuongMai.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/ung-dung-tm', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtUngDungThuongMai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        app.model.qtUngDungThuongMai.delete({ id: req.body.id }, (error) => res.send(error));
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
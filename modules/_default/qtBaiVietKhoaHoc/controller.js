module.exports = app => {
    app.post('/api/staff/qt-bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/qt-bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/qt-bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/staff/qt-bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtBaiVietKhoaHoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/qt-bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        const changes = app.clone(req.body.changes, { shcc: req.session.user.shcc });
                        app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/qt-bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });
}
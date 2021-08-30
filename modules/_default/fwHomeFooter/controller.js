module.exports = app => {
    app.get('/api/system/footer', app.permission.check('system:settings'), (req, res) => {
        app.model.fwHomeFooter.getAll({}, '*', 'priority ASC', (error, item) => {
            res.send({ error, item });
        })
    });

    app.put('/api/system/footer', app.permission.check('system:settings'), (req, res) => {
        app.model.fwHomeFooter.update({ id: req.body.id }, req.body.changes, (error, item) => {
            res.send({ error, item });
        })
    });

    app.post('/api/system/footer', app.permission.check('system:settings'), (req, res) => {
        app.model.fwHomeFooter.create(req.body.changes, (error, item) => {
            res.send({ error, item });
        })
    });

    app.delete('/api/system/footer', app.permission.check('system:settings'), (req, res) => {
        app.model.fwHomeFooter.delete({ id: req.body.id }, (error, item) => {
            res.send({ error, item });
        })
    })

    app.put('/api/system/footer/swap', app.permission.check('system:settings'), (req, res) => {
        let { id, priority } = req.body;
        if (id && priority) {
            app.model.fwHomeFooter.get({ id }, (error, item) => {
                if (item) {
                    const isUp = item.priority > Number(priority) ? 1 : 0;
                    app.model.fwHomeFooter.ganThuTu(Number(id), Number(priority), isUp, error => res.send({ error }));
                } else {
                    res.send({ error });
                }
            });
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });

    app.get('/system/footer', (req, res) => {
        app.model.fwHomeFooter.getAll({ active: 1 }, '*', 'priority ASC', (error, item) => {
            res.send({ error, item });
        })
    });

}
module.exports = app => {

    app.post('/api/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.tccbToChucKhac.create(req.body.data, (error, item) => res.send({ error, item })) : res.send({ error: 'No permission' });
    });

    app.put('/api/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.tccbToChucKhac.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item })) : res.send({ error: 'No permission' });
    });

    app.delete('/api/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.tccbToChucKhac.delete({ ma: req.body.ma }, (error) => res.send(error)) : res.send({ error: 'No permission' });
    });

    app.post('/api/user/staff/to-chuc-khac', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.tccbToChucKhac.create(req.body.data, (error, item) => res.send({ error, item })) : res.send({ error: 'No permission' });
    });
};
module.exports = app => {

    app.permission.add(
        'dtThoiGianMoMon:read', 'dtThoiGianMoMon:write', 'dtThoiGianMoMon:delete'
    );

    app.get('/api/dao-tao/page/thoi-gian-mo-mon/:pageNumber/:pageSize', app.permission.orCheck('dtThoiGianMoMon:read', 'dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:read'), (req, res) => {
        // let pageSize = req.params.pageSize,
        //     pageNumber = req.params.pageNumber;
        app.model.dtThoiGianMoMon.getPage(1, 4, (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:write'), (req, res) => {
        let data = req.body.data;
        app.model.dtThoiGianMoMon.create(data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:delete'), (req, res) => {
        let id = req.body.id;
        app.model.dtThoiGianMoMon.delete({ id }, (error) => res.send({ error }));
    });

    app.put('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:write'), (req, res) => {
        let id = req.body.id, changes = req.body.changes;
        if (changes.kichHoat) {
            app.model.dtThoiGianMoMon.update({
                statement: 'id != :id',
                parameter: { id }
            }, { kichHoat: 0 }, (error) => {
                if (!error) app.model.dtThoiGianMoMon.update({ id }, changes, (error, item) => res.send({ error, item }));
            });
        } else app.model.dtThoiGianMoMon.update({ id }, changes, (error, item) => res.send({ error, item }));
    });
};
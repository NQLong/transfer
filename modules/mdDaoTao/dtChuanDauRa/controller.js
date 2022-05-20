module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            9008: {
                title: 'Chuẩn đầu ra', groupIndex: 2,
                icon: 'fa fa-graduation-cap', backgroundColor: '#00C2CB',
                link: '/user/dao-tao/chuan-dau-ra'
            },
        },
    };

    app.permission.add(
        { name: 'dtChuanDauRa:read', menu },
        { name: 'dtChuanDauRa:manage', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtChuanDauRa:write' },
        { name: 'dtChuanDauRa:delete' },
    );

    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/user/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:read','dtChuongTrinhDaoTao:manage'), app.templates.admin);

    app.get('/api/dao-tao/chuan-dau-ra/all', app.permission.orCheck('dtChuanDauRa:read','dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuanDauRa.getAll({}, '*', 'thangDoMin asc', (error, items) => {
            res.send({ error, items });
        });
    });

    app.post('/api/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:write','dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuanDauRa.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:delete','dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuanDauRa.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:write','dtChuongTrinhDaoTao:manage'), (req, res) => {
        let changes = req.body.changes;
        app.model.dtChuanDauRa.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });
};
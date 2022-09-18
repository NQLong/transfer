module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            509: { title: 'Dashboard', link: '/user/hcth/dashboard', icon: 'fa-bar-chart', backgroundColor: '#f5c842', pin: true },
        },
    };

    app.permission.add(
        { name: 'hcth:login', menu },
    );

    app.get('/user/hcth/dashboard', app.permission.check('hcth:login'), app.templates.admin);

    //API------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/dashboard/get-data', app.permission.check('hcth:login'), async (req, res) => {
        try {
            let time = req.query.time || null;
            const item = await app.model.hcthCongVanDi.dashboardGetData(time);
            let soLieu = item.rows,
                { totalVanBanDen = [], totalVanBanDi = [], vanBanDenNam = [], vanBanDiNam = [] } = item;
            res.send({ data: { soLieu, totalVanBanDen, totalVanBanDi, vanBanDenNam, vanBanDiNam } });

        } catch (error) {
            res.send({ error });
        }
    });
};
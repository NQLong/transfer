module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3001: { title: 'Dashboard', link: '/user/tccb/dashboard', icon: 'fa-bar-chart', backgroundColor: '#f5c842', pin: true },
        },
    };

    app.permission.add(
        { name: 'staff:read', menu },
        { name: 'staff:write' },
        { name: 'staff:delete' },
    );

    app.get('/user/tccb/dashboard', app.permission.check('staff:read'), app.templates.admin);
    //API------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/dashboard/get-data', app.permission.check('staff:read'), (req, res) => {
        let time = req.query.time || null;
        app.model.canBo.getDashboardData(time, (error, item) => {
            if (error) res.send({ error });
            else {
                let soLieu = item.rows[0],
                    { nhanSuDonVi = [], nhanSuCongTac = [], qtDiNuocNgoai = [], qtCongTacTrongNuoc = [] } = item;
                app.model.dmDonVi.getAll({ kichHoat: 1 }, 'ma,maPl', 'maPl', (error, listDonVi) => {
                    if (error) res.send({ error });
                    else {
                        res.send({ data: { soLieu, nhanSuDonVi, nhanSuCongTac, qtDiNuocNgoai, qtCongTacTrongNuoc, listDonVi } });
                    }
                });
            }
        });
    });
};
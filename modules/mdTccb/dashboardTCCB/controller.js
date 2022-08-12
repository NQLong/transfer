module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3001: { title: 'Dashboard', link: '/user/tccb/dashboard', icon: 'fa-bar-chart', backgroundColor: '#f5c842', pin: true }
        }
    };

    app.permission.add(
        { name: 'tccbDashboard:manage', menu }
    );

    app.permissionHooks.add('staff', 'addRoleDashboardTccb', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbDashboard:manage');
            resolve();
        } else resolve();
    }));

    app.get('/user/tccb/dashboard', app.permission.check('tccbDashboard:manage'), app.templates.admin);
    //API------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/dashboard/get-data', app.permission.check('tccbDashboard:manage'), (req, res) => {
        let time = req.query.time || null;
        app.model.canBo.getDashboardData(time, (error, item) => {
            if (error) res.send({ error });
            else {
                let soLieu = item.rows[0],
                    { nhanSuDonVi = [], nhanSuCongTac = [], qtDiNuocNgoai = [], qtCongTacTrongNuoc = [], qtNghiPhep = [], qtNghiThaiSan = [] } = item;
                app.model.dmDonVi.getAll({ kichHoat: 1 }, 'ma,maPl', 'maPl', (error, listDonVi) => {
                    if (error) res.send({ error });
                    else {
                        res.send({ data: { soLieu, nhanSuDonVi, nhanSuCongTac, qtDiNuocNgoai, qtCongTacTrongNuoc, listDonVi, qtNghiPhep, qtNghiThaiSan } });
                    }
                });
            }
        });
    });
};
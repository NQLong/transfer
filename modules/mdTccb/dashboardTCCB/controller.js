module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3001: { title: 'Dashboard', link: '/user/tccb/dashboard', icon: 'fa-bar-chart', backgroundColor: '#f5c842', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:read', menu },
        { name: 'staff:write' },
        { name: 'staff:delete' },
    );

    app.get('/user/tccb/dashboard', app.permission.check('staff:read'), app.templates.admin);
    //API------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/dashboard/total-gender', app.permission.check('staff:read'), (req, res) => {
        app.model.canBo.tccbDasboardTotalGender((error, data) => {
            if (error || !data) res.send({ error });
            else {
                let result = app.clone(data.rows[0]);
                new Promise(resolve => app.model.dmDonVi.count((e, re) => {
                    if (e || !re) {
                        result = app.clone(result, { totalFaculty: 0 });
                    }
                    else result = app.clone(result, { totalFaculty: re.rows[0]['COUNT(*)'] });
                    resolve();
                })).then(() => new Promise(resolve => app.model.dmDonVi.count({
                    statement: 'maPl IN (:maPl)', parameter: { maPl: '01' }
                }, (e, re) => {
                    if (e || !re) {
                        result = app.clone(result, { totalKhoa: 0 });
                    }
                    else result = app.clone(result, { totalKhoa: re.rows[0]['COUNT(*)'] });
                    resolve();
                }))).then(() => new Promise(resolve => app.model.dmDonVi.count({
                    statement: 'maPl IN (:maPl)', parameter: { maPl: '02' },
                }, (e, re) => {
                    if (e || !re) {
                        result = app.clone(result, { totalPB: 0 });
                    }
                    else result = app.clone(result, { totalPB: re.rows[0]['COUNT(*)'] });
                    resolve();
                }))).then(() => res.send({ error, data: result })
                ).catch((reason) => res.send({ error: reason }));
            }
        });
    });
};
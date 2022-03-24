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

    app.get('/api/tccb/dashboard/total-gender', app.permission.check('staff:read'), (req, res) => {
        let listStaff = [], listStaffFaculty = [], listStaffPB = [], listCanBo = [],
            now = new Date().getTime(), numDiNuocNgoai = '', listDiNuocNgoai = [], listCongTacTrongNuoc = [];
        app.model.canBo.tccbDashboardStaffByDV((error, data) => {
            if (!error) {
                listStaff = data.rows;
                listStaffFaculty = listStaff.filter(item => item.maPL == 1);
                listStaffPB = listStaff.filter(item => item.maPL == 2);
            }
            // res.send({ listStaff, listStaffFaculty, listStaffPB });
        });

        app.model.qtDiNuocNgoai.getAll({
            parameter: { now },
            statement: 'ngayVe = -1 OR (ngayDi < :now AND ngayVe > :now)'
        }, (error, data) => {
            if (!error) {
                numDiNuocNgoai = data.length;
            }
        });

        app.model.canBo.tccbDashboardStaffCurrentlyForeign((error, data) => {
            if (!error) {
                listDiNuocNgoai = data.rows.filter(item => item.numOfStaff != 0);
            }
        });

        app.model.canBo.tccbDashboardStaffCurrentlyWorkOutside((error, data) => {
            if (!error) {
                listCongTacTrongNuoc = data.rows.filter(item => item.numOfStaff != 0);
            }
        });

        app.model.canBo.getAll({}, 'shcc,ngach,hocVi,phai,ngayNghi,chucDanh', null, (error, data) => {
            if (!error) listCanBo = data.filter(canBo => !canBo.ngayNghi).map(canBo => {
                let gioiTinh = canBo.phai ? (canBo.phai === '01' ? 'Nam' : 'Nữ') : 'Chưa xác định';
                canBo = app.clone(canBo, { gioiTinh });
                return canBo;
            });
        });
        
        app.model.canBo.tccbDasboardTotalGender((error, data) => {
            if (error || !data) res.send({ error });
            else {
                let result = app.clone(data.rows[0], { listStaff, listStaffFaculty, listStaffPB, numDiNuocNgoai, listDiNuocNgoai, listCongTacTrongNuoc, listCanBo });
                new Promise(resolve => app.model.dmDonVi.getAll((error, items) => {
                    if (error || !items) {
                        result = app.clone(result, { allDonVi: [] });
                    }
                    else result = app.clone(result, { allDonVi: items });
                    resolve();
                })).then(() => res.send({ error, data: result }));
            }
        });
    });
};
module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7002: { title: 'Danh sách môn học mở trong học kỳ', link: '/user/dao-tao/dang-ky-mo-mon', icon: 'fa-paper-plane-o', backgroundColor: '#8E9763', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'dtDangKyMoMon:read', menu },
        { name: 'dtDangKyMoMon:manage', menu },
        { name: 'dtDangKyMoMon:write' },
        { name: 'dtDangKyMoMon:delete' },
    );

    app.get('/user/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), app.templates.admin);
    app.get('/user/dao-tao/dang-ky-mo-mon/:id', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), app.templates.admin);

    //APIs-----------------------------------------------------------------------------------------------------------------------------------------------------
    const checkDaoTaoPermission = (req, res, next) => app.isDebug ? next() : app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage')(req, res, next);

    app.get('/api/dao-tao/dang-ky-mo-mon/page/:pageNumber/:pageSize', checkDaoTaoPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : '';
        let filter = JSON.stringify(req.query.filter || {}),
            donViFilter = req.query.donViFilter,
            donVi = req.session.user.staff ? req.session.user.staff.maDonVi : null;

        if (req.session.user.permissions.exists(['dtDangKyMoMon:read'])) donVi = donViFilter || null;
        app.model.dtDangKyMoMon.searchPage(pageNumber, pageSize, donVi, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });


    //Phân quyền cho đơn vị ---------------------------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dtDangKyMoMon:manage', text: 'Đào tạo: Quản lý Mở môn' });

    app.permissionHooks.add('staff', 'checkRoleDTDangKyMoMon', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dtDangKyMoMon:manage');
        }
        resolve();
    }));

    //Gán quyền ----------------------------------------------------------------------------
    app.permissionHooks.add('assignRole', 'checkRoleDTDangKyMoMon', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'dtDangKyMoMon:manage') {
                app.permissionHooks.pushUserPermission(user, 'dtDangKyMoMon:manage');
            }
        });
        resolve();
    }));
};
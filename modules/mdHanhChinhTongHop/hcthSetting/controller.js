module.exports = app => {

    const { MA_HCTH } = require('../constant');

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            504: { title: 'Cấu hình', link: '/user/hcth/setting', icon: 'fa-cog', backgroundColor: '#1488db'},
        },
    };

    app.permission.add({ name: 'hcthSetting:read', menu }, 'hcthSetting:write', 'hcthSetting:delete');

    app.get('/user/hcth/setting', app.permission.check('hcthSetting:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/setting/all', app.permission.check('hcthSetting:read'), async (req, res) => {
        app.model.hcthSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/setting', app.permission.check('hcthSetting:read'), async (req, res) => {
        const { key } = req.body;
        app.model.hcthSetting.get({ key }, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/setting', app.permission.check('hcthSetting:write'), async (req, res) => {
        const { changes } = req.body;
        app.model.hcthSetting.setValue(changes, error => res.send({ error }));
    });

    app.delete('/api/hcth/setting', app.permission.check('hcthSetting:delete'), async (req, res) => {
        const { key } = req.body;
        app.model.hcthSetting.delete({ key }, error => res.send({ error }));
    });

    // Phân quyền setting ------------------------------------------------------------------------------------------------------------------------

    const manageHcthSettingRole = 'manageHcthSetting';
    app.assignRoleHooks.addRoles(manageHcthSettingRole, { id: 'hcthSetting:manage', text: 'Hành chính - Tổng hợp: Quản lí cấu hình' });

    app.assignRoleHooks.addHook(manageHcthSettingRole, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == manageHcthSettingRole && userPermissions.includes('hcth:manage')) {
            const assignRolesList = app.assignRoleHooks.get(manageHcthSettingRole).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleHcthQuanLyCauHinh', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == MA_HCTH) {
            app.permissionHooks.pushUserPermission(user, 'hcthSetting:manage', 'hcthSetting:read', 'hcthSetting:write', 'hcthSetting:delete');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleHcthQuanLyCauHinh', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == manageHcthSettingRole);
        inScopeRoles.forEach(role => {
            if (role.tenRole === 'hcthSetting:manage') {
                app.permissionHooks.pushUserPermission(user, 'hcthSetting:read', 'hcthSetting:write', 'hcthSetting:delete');
            }
        });
        resolve();
    }));
};
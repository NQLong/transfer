module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7022: { title: 'Cấu hình', pin: true, link: '/user/dao-tao/settings', icon: 'fa-sliders', backgroundColor: '#274d5a' },
        },
    };

    app.permission.add(
        { name: 'dtSettings:manage', menu },
        'dtSettings:write'
    );

    app.get('/user/dao-tao/settings', app.permission.check('dtSettings:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDtSettings', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtSettings:manage', 'dtSettings:write');
            resolve();
        } else resolve();
    }));

    // APIs -------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/settings/all', app.permission.check('dtSettings:manage'), async (req, res) => {
        try {
            let items = await app.model.dtSettings.getAll(), result = {};
            items.forEach(item => {
                result[item.key] = item.value;
            });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dao-tao/settings/keys', app.permission.check('dtSettings:manage'), async (req, res) => {
        try {
            const { keys } = req.query;
            let result = await app.model.dtSettings.getValue(keys);
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dao-tao/settings/schedule-settings', app.permission.check('dtSettings:manage'), async (req, res) => {
        try {
            const listKey = ['tkbSoLopMin', 'tkbSoLopMax', 'tkbSoTietBuoiMin', 'tkbSoTietBuoiMax', 'tkbSoBuoiTuanMin', 'tkbSoBuoiTuanMax', 'tkbSoLuongDuKienMin', 'tkbSoLuongDuKienMax'];
            let result = await app.model.dtSettings.getValue(...listKey);
            Object.keys(result).forEach(key => {
                result[key] = result[key] ? parseInt(result[key]) : 0;
            });
            res.send({ items: result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dao-tao/settings', app.permission.check('dtSettings:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            await app.model.dtSettings.setValue(changes);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });


};
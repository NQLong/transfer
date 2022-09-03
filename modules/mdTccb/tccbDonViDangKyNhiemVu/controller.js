module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3036: { title: 'Đơn vị đăng ký nhiệm vụ', link: '/user/tccb/don-vi-dang-ky-nhiem-vu', icon: 'fa-pencil', backgroundColor: '#2a99b8', groupIndex: 6 }
        }
    };
    app.permission.add(
        { name: 'tccbDonViDangKyNhiemVu:write', menu },
        { name: 'tccbDonViDangKyNhiemVu:delete' },
    );
    app.get('/user/tccb/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:write'), app.templates.admin);
    app.get('/user/tccb/don-vi-dang-ky-nhiem-vu/:nam', app.permission.check('tccbDonViDangKyNhiemVu:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('tccbDonViDangKyNhiemVu:write'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     const maDonVi = req.session.user.staff.maDonVi;
    //     condition.maDonVi = maDonVi;
    //     app.model.tccbDonViDangKyNhiemVu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    // });
    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/danh-gia-nam/all', app.permission.check('tccbDonViDangKyNhiemVu:write'), (req, res) => {
        app.model.tccbDanhGiaNam.getAll({}, '*', 'nam DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/all/by-year', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const nam = Number(req.query.nam), maDonVi = req.session.user.staff.maDonVi;
            let danhGiaNam = await app.model.tccbDanhGiaNam.getAll({ nam });
            danhGiaNam = danhGiaNam[0];
            let danhGiaDonVis = await app.model.tccbKhungDanhGiaDonVi.getAll({ nam });
            let dangKys = await app.model.tccbDonViDangKyNhiemVu.getAll({ nam, maDonVi });
            let items = danhGiaDonVis.filter(item => !item.parentId);
            items = items.map(item => danhGiaDonVis.filter(danhGia => danhGia.parentId == item.id));
            items = items.reduce((prev, cur) => prev.concat(cur));
            items = items.map(danhGiaDonVi => {
                const index = dangKys.findIndex(dangKy => dangKy.maKhungDanhGiaDonVi == danhGiaDonVi.id);
                if (index == -1) {
                    return {
                        noiDung: danhGiaDonVi.noiDung,
                        maKhungDanhGiaDonVi: danhGiaDonVi.id,
                        maDonVi,
                        nam,
                    };
                }
                return {
                    noiDung: danhGiaDonVi.noiDung,
                    ...dangKys[index]
                };
            });
            res.send({ items, danhGiaNam });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/all', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const maDonVi = req.session.user.staff.maDonVi;
            condition.maDonVi = maDonVi;
            const items = await app.model.tccbDonViDangKyNhiemVu.getAll(condition);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu/item/:id', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const maDonVi = req.session.user.staff.maDonVi;
            const item = await app.model.tccbDonViDangKyNhiemVu.get({ id: req.params.id, maDonVi });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const newItem = req.body.item;
            const nam = newItem.nam;
            const { donViBatDauDangKy, donViKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (donViBatDauDangKy > new Date.now() || new Date.now() > donViKetThucDangKy) {
                throw 'Bạn không được quyền đăng ký do thời gian đăng ký không phù hợp';
            }
            newItem.maDonVi = req.session.user.staff.maDonVi;
            const item = await app.model.tccbDonViDangKyNhiemVu.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            changes.maDonVi = req.session.user.staff.maDonVi;
            const { nam } = await app.model.tccbDonViDangKyNhiemVu.update({ id: req.body.id });
            const { donViBatDauDangKy, donViKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (donViBatDauDangKy > new Date.now() || new Date.now() > donViKetThucDangKy) {
                throw 'Bạn không được quyền đăng ký do thời gian đăng ký không phù hợp';
            }
            const item = await app.model.tccbDonViDangKyNhiemVu.update({ id: req.body.id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia/don-vi-dang-ky-nhiem-vu', app.permission.check('tccbDonViDangKyNhiemVu:delete'), async (req, res) => {
        try {
            const { nam } = await app.model.tccbDonViDangKyNhiemVu.update({ id: req.body.id });
            const { donViBatDauDangKy, donViKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (donViBatDauDangKy > new Date.now() || new Date.now() > donViKetThucDangKy) {
                throw 'Bạn không được quyền đăng ký do thời gian đăng ký không phù hợp';
            }
            await app.model.tccbDonViDangKyNhiemVu.delete({ id: req.body.id });
        } catch (error) {
            res.send({ error });
        }
    });

    app.assignRoleHooks.addRoles('tccbDonViDangKyNhiemVu', { id: 'tccbDonViDangKyNhiemVu:write', text: 'Đơn vị đăng ký nhiệm vụ' });

    app.assignRoleHooks.addHook('tccbDonViDangKyNhiemVu', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'tccbDonViDangKyNhiemVu' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('tccbDonViDangKyNhiemVu').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleDonViDangKyNhiemVu', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length) {
            app.permissionHooks.pushUserPermission(user, 'tccbDonViDangKyNhiemVu:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleDonViDangKyNhiemVu', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tccbDonViDangKyNhiemVu');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tccbDonViDangKyNhiemVu:write') {
                app.permissionHooks.pushUserPermission(user, 'tccbDonViDangKyNhiemVu:write');
            }
        });
        resolve();
    }));
};
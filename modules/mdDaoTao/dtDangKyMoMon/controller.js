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
        { name: 'quanLyDaoTao:manager' }
    );

    app.get('/user/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), app.templates.admin);
    app.get('/user/dao-tao/dang-ky-mo-mon/:id', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), app.templates.admin);

    //APIs-----------------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/dang-ky-mo-mon/page/:pageNumber/:pageSize', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), async (req, res) => {
        let _pageNumber = parseInt(req.params.pageNumber),
            _pageSize = parseInt(req.params.pageSize),
            user = req.session.user,
            permissions = user.permissions,
            searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : '';
        let donViFilter = req.query.donViFilter,
            donVi = user.staff ? user.staff.maDonVi : null;
        if (permissions.includes('dtDangKyMoMon:read')) donVi = donViFilter || null;
        let page = await app.model.dtDangKyMoMon.searchPage(_pageNumber, _pageSize, donVi, searchTerm);
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        let listLoaiHinhDaoTao = permissions.filter(item => item.includes('quanLyDaoTao')).map(item => item.split(':')[1]);
        if (!listLoaiHinhDaoTao.includes('manager') && permissions.includes('dtDangKyMoMon:read')) {
            //Nếu là người phòng đào tạo
            list = list.filter(item => listLoaiHinhDaoTao.includes(item.loaiHinhDaoTao));
        }
        list?.forEach(item => {
            item.permissionWrite = true;
            if (!permissions.includes('dtDangKyMoMon:write')) {
                const today = Date.now();
                let data = thoiGianMoMon.find(tgmm => tgmm.loaiHinhDaoTao == item.loaiHinhDaoTao && tgmm.bacDaoTao == item.bacDaoTao);
                let { batDau, ketThuc } = data;
                if (batDau < today || ketThuc >= today) {
                    item.permissionWrite = false;
                }
            }
        });
        const pageCondition = searchTerm;
        res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, thoiGianMoMon } });
    });

    app.post('/api/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:manage', 'dtDangKyMoMon:write'), async (req, res) => {
        try {
            const now = Date.now();
            let { data, settings } = req.body;
            let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
            thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == settings.loaiHinhDaoTao && item.bacDaoTao == settings.bacDaoTao);
            if (now > thoiGianMoMon.ketThuc) throw 'Đã hết hạn đăng ký!';
            const hocKy = thoiGianMoMon.hocKy,
                nam = thoiGianMoMon.nam;
            if (data.nam != nam || data.hocKy != hocKy || now <= thoiGianMoMon.batDau) {
                throw 'Không thuộc thời gian đăng ký hiện tại';
            } else {
                let item = await app.model.dtDangKyMoMon.get({
                    nam, hocKy, maNganh: data.maNganh, loaiHinhDaoTao: settings.loaiHinhDaoTao, bacDaoTao: settings.bacDaoTao
                });
                if (item) throw `Mã ngành ${data.maNganh} đã được tạo trong HK${hocKy} - năm ${nam}`;
                item = await app.model.dtDangKyMoMon.create(data);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:manage', 'dtDangKyMoMon:write'), async (req, res) => {
        let { data, id, isDuyet, settings } = req.body,
            thoiGian = new Date().getTime(),
            changes = isDuyet ? { isDuyet: 1 } : { thoiGian },
            isDaoTao = req.session.user.permissions.includes('dtDangKyMoMon:read');
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == settings.loaiHinhDaoTao && item.bacDaoTao == settings.bacDaoTao);
        const hocKy = thoiGianMoMon.hocKy,
            nam = thoiGianMoMon.nam;
        if ((!data.nam || !data.hocKy || data.nam != nam || data.hocKy != hocKy) && !isDaoTao) {
            res.send({ error: 'Không thuộc thời gian đăng ký hiện tại' });
            return;
        } else {
            const updateDanhSachMonMo = (list) => new Promise((resolve, reject) => {
                const newDanhSach = [];
                const update = (index = 0) => {
                    if (index == list.length) {
                        resolve();
                    } else {
                        let monHoc = list[index];
                        delete monHoc.id;
                        app.model.dtDanhSachMonMo.create(monHoc, (error, item) => {
                            if (error || !item) reject(error);
                            else {
                                newDanhSach.push(item);
                                update(index + 1);
                            }
                        });
                    }
                };
                app.model.dtDanhSachMonMo.delete({ maDangKy: id }, (error) => {
                    if (error) reject(error);
                    else {
                        update();
                    }
                });
            });
            try {
                data && data.length ? await updateDanhSachMonMo(data) : [];
                app.model.dtDangKyMoMon.update({ id }, changes, (error, item) => res.send({ error, item }));
            } catch (error) {
                res.send({ error });
            }
        }
    });


    //Phân quyền cho đơn vị ---------------------------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dtDangKyMoMon:manage', text: 'Đào tạo: Quản lý Mở môn học' });

    app.readyHooks.add('Create permission quanLyDaoTao', {
        ready: () => app.database.oracle && app.database.oracle.connected && app.model.dmSvLoaiHinhDaoTao,
        run: () => {
            app.assignRoleHooks.addRoles('quanLyDaoTao', async () => {
                let listLoaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 });
                listLoaiHinhDaoTao = listLoaiHinhDaoTao.map(item => ({ id: `quanLyDaoTao:${item.ma}`, text: `Quản lý đào tạo: ${item.ten}` }));
                listLoaiHinhDaoTao.push({ id: 'quanLyDaoTao:manager', text: 'Quản lý đào tạo: Admin' });
                return listLoaiHinhDaoTao;
            });
        }
    });

    app.permissionHooks.add('staff', 'AllPermissionDaoTao', (user, staff) => new Promise((resolve) => {
        if (staff.maDonVi == 33 && staff.donViQuanLy.length) {
            app.permissionHooks.pushUserPermission(user, 'quanLyDaoTao:manager');
        } resolve();
    }));

    app.permissionHooks.add('staff', 'checkRoleDTDangKyMoMon', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dtDangKyMoMon:manage');

        }
        resolve();
    }));

    app.assignRoleHooks.addHook('quanLyDaoTao', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'quanLyDaoTao' && userPermissions.includes('quanLyDaoTao:manager')) {
            const assignRolesList = app.assignRoleHooks.get('quanLyDaoTao').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    //Gán quyền ----------------------------------------------------------------------------
    app.permissionHooks.add('assignRole', 'checkRoleDTDangKyMoMon', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'dtDangKyMoMon:manage') {
                app.permissionHooks.pushUserPermission(user, 'dtDangKyMoMon:manage', 'dtMonHoc:manage', 'dtChuongTrinhDaoTao:manage', 'dtNganhDaoTao:manage', 'dtDanhSachChuyenNganh:manage');
            }
        });
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyDaoTao', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'quanLyDaoTao');
        inScopeRoles.forEach(role => {
            if (role.tenRole.includes('quanLyDaoTao')) {
                app.permissionHooks.pushUserPermission(user, role.tenRole);
            }
        });
        resolve();
    }));
};
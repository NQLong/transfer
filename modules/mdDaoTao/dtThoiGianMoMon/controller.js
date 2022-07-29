module.exports = app => {

    app.permission.add(
        'dtThoiGianMoMon:write', 'dtThoiGianMoMon:delete'
    );

    app.permissionHooks.add('staff', 'addRolesDtThoiGianMoMon', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiGianMoMon:write', 'dtThoiGianMoMon:delete');
            resolve();
        } else resolve();
    }));

    app.get('/api/dao-tao/page/thoi-gian-mo-mon/:pageNumber/:pageSize', app.permission.orCheck('dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:read'), async (req, res) => {
        let permissions = req.session.user.permissions;
        let listLoaiHinhDaoTao = permissions.filter(item => item.includes('quanLyDaoTao')).map(item => item.split(':')[1]);
        let page = await app.model.dtThoiGianMoMon.getPage(1, 4, {
            statement: '(:listLoaiHinhDaoTao) IS NULL OR loaiHinhDaoTao IN (:listLoaiHinhDaoTao)',
            parameter: { listLoaiHinhDaoTao: listLoaiHinhDaoTao.includes('manager') ? null : listLoaiHinhDaoTao }
        });
        for (let item of page.list) {
            let ctkdt = await app.model.dtCauTrucKhungDaoTao.get({ id: item.nam });
            item.namDaoTao = ctkdt.namDaoTao;
        }
        res.send({ page });
    });

    app.post('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:write'), async (req, res) => {
        try {
            let data = req.body.data,
                { nam, hocKy, loaiHinhDaoTao, bacDaoTao } = data;
            const thoiGianMoMon = await app.model.dtThoiGianMoMon.get({ nam, hocKy, loaiHinhDaoTao, bacDaoTao });
            if (thoiGianMoMon) throw 'Đã tồn tại thời gian mở môn học kỳ cho loại hình này';
            const item = await app.model.dtThoiGianMoMon.create(data);
            let ctkdt = await app.model.dtCauTrucKhungDaoTao.get({ id: item.nam });
            item.namDaoTao = ctkdt.namDaoTao;
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }

    });

    app.delete('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:delete'), (req, res) => {
        let id = req.body.id;
        app.model.dtThoiGianMoMon.delete({ id }, (error) => res.send({ error }));
    });

    app.put('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:write'), (req, res) => {
        let id = req.body.id, changes = req.body.changes;
        if (changes.kichHoat) {
            app.model.dtThoiGianMoMon.update({
                statement: 'id != :id AND loaiHinhDaoTao = :loaiHinhDaoTao AND bacDaoTao = :bacDaoTao',
                parameter: { id, loaiHinhDaoTao: changes.loaiHinhDaoTao, bacDaoTao: changes.bacDaoTao },
            }, { kichHoat: 0 }, (error) => {
                if (!error) app.model.dtThoiGianMoMon.update({ id }, changes, (error, item) => res.send({ error, item }));
            });
        } else app.model.dtThoiGianMoMon.update({ id }, changes, (error, item) => res.send({ error, item }));
    });
};
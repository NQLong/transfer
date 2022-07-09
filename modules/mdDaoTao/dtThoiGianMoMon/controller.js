module.exports = app => {

    app.permission.add(
        'dtThoiGianMoMon:read', 'dtThoiGianMoMon:write', 'dtThoiGianMoMon:delete'
    );

    app.get('/api/dao-tao/page/thoi-gian-mo-mon/:pageNumber/:pageSize', app.permission.orCheck('dtThoiGianMoMon:read', 'dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:read'), (req, res) => {
        let permissions = req.session.user.permissions;
        let listLoaiHinhDaoTao = permissions.filter(item => item.includes('quanLyDaoTao')).map(item => item.split(':')[1]);
        app.model.dtThoiGianMoMon.getPage(1, 4, (error, page) => {
            page.list = listLoaiHinhDaoTao.length ? page.list.filter(item => listLoaiHinhDaoTao.includes(item.loaiHinhDaoTao)) : page.list;
            res.send({ error, page });
        });
    });

    app.post('/api/dao-tao/thoi-gian-mo-mon', app.permission.check('dtThoiGianMoMon:write'), async (req, res) => {
        try {
            let data = req.body.data,
                { nam, hocKy, loaiHinhDaoTao, bacDaoTao } = data;
            const thoiGianMoMon = await app.model.dtThoiGianMoMon.get({ nam, hocKy, loaiHinhDaoTao, bacDaoTao });
            if (thoiGianMoMon) throw 'Đã tồn tại thời gian mở môn học kỳ cho loại hình này';
            const item = await app.model.dtThoiGianMoMon.create(data);
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
        console.log(changes);
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
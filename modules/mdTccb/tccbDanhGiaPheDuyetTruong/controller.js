module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3037: { title: 'Trường phê duyệt', link: '/user/tccb/danh-gia-phe-duyet-truong', icon: 'fa-pencil', backgroundColor: '#fecc2c', groupIndex: 6 },
        }
    };
    app.permission.add(
        { name: 'tccbDanhGiaPheDuyetTruong:manage', menu },
        { name: 'tccbDanhGiaPheDuyetTruong:write' },
    );
    app.get('/user/tccb/danh-gia-phe-duyet-truong', app.permission.check('tccbDanhGiaPheDuyetTruong:manage'), app.templates.admin);
    app.get('/user/tccb/danh-gia-phe-duyet-truong/:nam', app.permission.check('tccbDanhGiaPheDuyetTruong:manage'), app.templates.admin);

    app.get('/api/tccb/danh-gia-phe-duyet-truong/all-nam', app.permission.check('tccbDanhGiaPheDuyetTruong:manage'), (req, res) => {
        app.model.tccbDanhGiaNam.getAll({}, '*', 'nam DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia-phe-duyet-truong/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaPheDuyetTruong:manage'), async (req, res) => {
        try {
            const nam = parseInt(req.query.nam),
                _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                filter = req.query.filter ? req.query.filter : { filterNhom: 'Tất cả', filterYKien: 'Tất cả' };
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDanhGiaPheDuyetTruong.searchPage(_pageNumber, _pageSize, searchTerm, nam, JSON.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-phe-duyet-truong', app.permission.check('president:login'), async (req, res) => {
        try {
            const id = req.body.id, approvedTruong = req.body.approvedTruong, userDuyetCapTruong = req.session.user.email, nam = parseInt(req.body.nam);
            const danhGia = await app.model.tccbDanhGiaNam.get({ nam });
            if (!danhGia) {
                throw 'Không có dữ liệu phê duyệt của năm';
            }
            const { truongBatDauPheDuyet, truongKetThucPheDuyet } = danhGia;
            if (Date.now() < truongBatDauPheDuyet || Date.now() > truongKetThucPheDuyet) {
                throw 'Thời gian phê duyệt không phù hợp';
            }
            const item = await app.model.tccbDanhGiaPheDuyetTruong.update({ id }, { userDuyetCapTruong, approvedTruong });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-phe-duyet-truong-phe-duyet-all', app.permission.check('president:login'), async (req, res) => {
        try {
            const approvedTruong = req.body.approvedTruong, userDuyetCapTruong = req.session.user.email, nam = parseInt(req.body.nam);
            const danhGia = await app.model.tccbDanhGiaNam.get({ nam });
            if (!danhGia) {
                throw 'Không có dữ liệu phê duyệt của năm';
            }
            const { truongBatDauPheDuyet, truongKetThucPheDuyet } = danhGia;
            if (Date.now() < truongBatDauPheDuyet || Date.now() > truongKetThucPheDuyet) {
                throw 'Thời gian phê duyệt không phù hợp';
            }
            await app.model.tccbDanhGiaPheDuyetTruong.update({}, { userDuyetCapTruong, approvedTruong });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-phe-duyet-truong-y-kien', app.permission.check('tccbDanhGiaPheDuyetTruong:write'), async (req, res) => {
        try {
            const id = req.body.id, yKienTruongTccb = req.body.yKienTruongTccb, truongTccb = req.session.user.email, nam = parseInt(req.body.nam);
            const danhGia = await app.model.tccbDanhGiaNam.get({ nam });
            if (!danhGia) {
                throw 'Không có dữ liệu phê duyệt của năm';
            }
            const pheDuyet = await app.model.tccbDanhGiaPheDuyetTruong.get({ id });
            if (pheDuyet?.approvedTruong == 'Đồng ý') {
                throw 'Trường đã duyệt, không được sửa đổi dữ liệu';
            }
            const { truongBatDauPheDuyet, truongKetThucPheDuyet } = danhGia;
            if (Date.now() < truongBatDauPheDuyet || Date.now() > truongKetThucPheDuyet) {
                throw 'Thời gian phê duyệt không phù hợp';
            }
            const item = await app.model.tccbDanhGiaPheDuyetTruong.update({ id }, { yKienTruongTccb, truongTccb });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};
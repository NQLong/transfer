module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3036: { title: 'Đơn vị phê duyệt', link: '/user/tccb/danh-gia-phe-duyet-don-vi', icon: 'fa-pencil', backgroundColor: '#B8492F', groupIndex: 6 },
        }
    };
    app.permission.add(
        { name: 'manager:login', menu },
    );
    app.get('/user/tccb/danh-gia-phe-duyet-don-vi', app.permission.check('manager:login'), app.templates.admin);
    app.get('/user/tccb/danh-gia-phe-duyet-don-vi/:nam', app.permission.check('manager:login'), app.templates.admin);

    app.get('/api/tccb/danh-gia-phe-duyet-don-vi/all-nam', app.permission.check('manager:login'), (req, res) => {
        app.model.tccbDanhGiaNam.getAll({}, '*', 'nam DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia-phe-duyet-don-vi/page/:pageNumber/:pageSize', app.permission.check('manager:login'), async (req, res) => {
        try {
            const maDonVi = req.session.user.staff?.maDonVi,
                nam = parseInt(req.query.nam),
                _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.tccbDanhGiaPheDuyetDonVi.searchPage(_pageNumber, _pageSize, searchTerm, nam, maDonVi);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-phe-duyet-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const id = req.body.id, approvedDonVi = req.body.approvedDonVi, userDuyetCapDonVi = req.session.user.email, nam = parseInt(req.body.nam);
            const danhGia = await app.model.tccbDanhGiaNam.get({ nam });
            if (!danhGia) {
                throw 'Không có dữ liệu phê duyệt của năm';
            }
            const pheDuyetTruong = await app.model.tccbDanhGiaPheDuyetTruong.get({ idPheDuyetCapDonVi: id });
            if (pheDuyetTruong?.approvedTruong == 'Đồng ý') {
                throw 'Trường đã duyệt, không được sửa đổi dữ liệu';
            }
            const { donViBatDauPheDuyet, donViKetThucPheDuyet } = danhGia;
            if (Date.now() < donViBatDauPheDuyet || Date.now() > donViKetThucPheDuyet) {
                throw 'Thời gian phê duyệt không phù hợp';
            }
            const item = await app.model.tccbDanhGiaPheDuyetDonVi.update({ id }, { userDuyetCapDonVi, approvedDonVi, dangKyLai: approvedDonVi == 'Không đồng ý' ? 1 : 0 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};